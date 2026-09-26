/* =========================================================================
   RT CALORIFUGE — SCRIPT PRINCIPAL
   1. Coordonnées (js/config.js)
   2. Pré-sélection du service depuis la section Services
   3. Menu mobile
   4. Réalisations (carrousel)
   5. FAQ (un seul volet ouvert)
   6. Formulaire : champs conditionnels, validation, envoi
   ========================================================================= */
(function () {
  "use strict";

  var CFG = window.RT_CONFIG || {};
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------------
     1. COORDONNÉES
     Les vraies valeurs sont déjà écrites dans le HTML (lisibles sans JS et
     par les moteurs). config.js permet de les modifier en un seul endroit.
     Les blocs [data-cfg-wrap] restent masqués tant que la valeur est vide.
  --------------------------------------------------------------------- */
  function applyConfig() {
    $$("[data-cfg]").forEach(function (el) {
      var key = el.getAttribute("data-cfg");
      if (CFG[key]) el.textContent = CFG[key];
    });

    if (CFG.phoneLink) {
      var tel = "tel:" + CFG.phoneLink.replace(/\s+/g, "");
      $$("[data-cfg-tel]").forEach(function (el) { el.setAttribute("href", tel); });
    }

    if (CFG.email) {
      $$("[data-cfg-mail]").forEach(function (el) {
        el.setAttribute("href", "mailto:" + CFG.email + "?subject=" +
          encodeURIComponent("Demande de calorifuge — chantier"));
      });
    }

    $$("[data-cfg-wrap]").forEach(function (wrap) {
      var key = wrap.getAttribute("data-cfg-wrap");
      wrap.hidden = !CFG[key];
    });

    var li = $("[data-cfg-linkedin]");
    if (li && CFG.linkedin) {
      li.setAttribute("href", CFG.linkedin);
      li.setAttribute("rel", "noopener");
      li.setAttribute("target", "_blank");
    }

    var y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------------
     2. PRÉ-SÉLECTION DU SERVICE
     Les liens [data-prefill-service] (section Services) cochent le type
     d'intervention correspondant dans le formulaire.
  --------------------------------------------------------------------- */
  function initPrefill() {
    $$("[data-prefill-service]").forEach(function (a) {
      a.addEventListener("click", function () {
        var v = a.getAttribute("data-prefill-service");
        var radio = $('#devis-form [name="service"][value="' + v + '"]');
        if (radio && !radio.checked) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     3. MENU MOBILE
  --------------------------------------------------------------------- */
  function initNav() {
    var burger = $("#burger");
    var nav = $("#nav");
    if (!burger || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    }

    burger.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); burger.focus(); }
    });
  }

  /* ---------------------------------------------------------------------
     4. RÉALISATIONS — carrousel
     Défilement natif (tactile, trackpad, flèches du clavier) + boutons.
  --------------------------------------------------------------------- */
  function initCarousel() {
    $$("[data-carousel]").forEach(function (root) {
      var track = $(".carousel__track", root);
      var slides = $$(".slide", track);
      var prev = $('[data-dir="-1"]', root);
      var next = $('[data-dir="1"]', root);
      var current = $("[data-carousel-current]", root);
      if (!track || !slides.length) return;

      function index() {
        var x = track.scrollLeft, best = 0, dist = Infinity;
        slides.forEach(function (s, i) {
          var d = Math.abs(s.offsetLeft - track.offsetLeft - x);
          if (d < dist) { dist = d; best = i; }
        });
        return best;
      }

      function update() {
        var max = track.scrollWidth - track.clientWidth - 2;
        var atEnd = track.scrollLeft >= max;
        if (current) current.textContent = atEnd ? slides.length : index() + 1;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = atEnd;
      }

      function go(dir) {
        var i = Math.max(0, Math.min(slides.length - 1, index() + dir));
        track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: "smooth" });
      }

      prev.addEventListener("click", function () { go(-1); });
      next.addEventListener("click", function () { go(1); });

      var raf;
      track.addEventListener("scroll", function () {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(update);
      }, { passive: true });
      window.addEventListener("resize", update);
      update();
    });
  }

  /* ---------------------------------------------------------------------
     5. FAQ — un seul volet ouvert à la fois
  --------------------------------------------------------------------- */
  function initFaq() {
    var items = $$(".faq__item");
    items.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        items.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  }

  /* ---------------------------------------------------------------------
     6. FORMULAIRE
  --------------------------------------------------------------------- */
  var MAX_FILES_BYTES = 10 * 1024 * 1024; // 10 Mo

  // Blocs techniques affichés selon le service choisi
  var TECH_BY_SERVICE = {
    "Gaines de ventilation": ["gaines"],
    "Tuyauteries": ["tuyauteries"],
    "Gaines + tuyauteries": ["gaines", "tuyauteries"],
    "À définir": []
  };

  function setError(field, message) {
    var wrap = field.closest(".field");
    var slot = wrap && $('[data-err-for="' + field.id + '"]', wrap);
    if (wrap) wrap.classList.toggle("is-invalid", !!message);
    if (message) field.setAttribute("aria-invalid", "true"); else field.removeAttribute("aria-invalid");
    if (slot) slot.textContent = message || "";
  }

  function setGroupError(form, name, message) {
    var slot = $('[data-err-group="' + name + '"]', form);
    if (!slot) return;
    slot.textContent = message || "";
    var fs = slot.closest("fieldset");
    if (fs) fs.classList.toggle("is-invalid", !!message);
  }

  function validateGroup(form, name) {
    var ok = !!form.querySelector('[name="' + name + '"]:checked');
    setGroupError(form, name, ok ? "" : "Choisissez une option.");
    return ok;
  }

  function validateField(field) {
    var v = (field.value || "").trim();

    if (field.type === "checkbox") {
      if (field.required && !field.checked) { setError(field, "Merci de cocher cette case pour envoyer la demande."); return false; }
      setError(field, ""); return true;
    }

    if (field.type === "file") {
      var total = 0;
      for (var i = 0; i < field.files.length; i++) total += field.files[i].size;
      if (total > MAX_FILES_BYTES) {
        setError(field, "Fichiers trop lourds (10 Mo maximum). Envoyez-les plutôt par e-mail.");
        return false;
      }
      setError(field, ""); return true;
    }

    if (field.required && !v) { setError(field, "Ce champ est nécessaire pour vous répondre."); return false; }

    if (field.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) {
      setError(field, "Adresse e-mail non valide."); return false;
    }

    if (field.type === "tel" && v && v.replace(/[^0-9]/g, "").length < 9) {
      setError(field, "Numéro de téléphone incomplet."); return false;
    }

    setError(field, ""); return true;
  }

  // Téléphone OU e-mail : au moins l'un des deux
  function validateContact(form) {
    var tel = form.elements.telephone, mail = form.elements.email;
    var okTel = validateField(tel), okMail = validateField(mail);
    if (!okTel || !okMail) return false;
    if (!tel.value.trim() && !mail.value.trim()) {
      setError(tel, "Indiquez un téléphone ou un e-mail pour que nous puissions vous répondre.");
      return false;
    }
    return true;
  }

  function initForm() {
    var form = $("#devis-form");
    if (!form) return;

    var status  = $("#form-status");
    var success = $("#form-success");
    var btn     = $("#submit-btn");
    var btnLabel = btn.textContent;
    var techBlocks = $$("[data-tech]", form);
    var techHint = $("#tech-hint");

    // --- Champs techniques conditionnels ---
    function syncTech() {
      var checked = form.querySelector('[name="service"]:checked');
      var wanted = checked ? (TECH_BY_SERVICE[checked.value] || []) : [];
      techBlocks.forEach(function (fs) {
        var on = wanted.indexOf(fs.getAttribute("data-tech")) !== -1;
        fs.hidden = !on;
        fs.disabled = !on;   // un bloc masqué n'est pas envoyé
      });
      if (techHint) techHint.hidden = !!checked;
    }
    $$('[name="service"]', form).forEach(function (r) {
      r.addEventListener("change", function () { syncTech(); validateGroup(form, "service"); });
    });
    $$('[name="type_besoin"]', form).forEach(function (r) {
      r.addEventListener("change", function () { validateGroup(form, "type_besoin"); });
    });
    syncTech();

    // --- Validation au fil de la saisie ---
    var fields = $$("input, select, textarea", form).filter(function (f) {
      return f.type !== "radio" && !f.classList.contains("hp");
    });
    fields.forEach(function (f) {
      f.addEventListener("blur", function () {
        if (f.name === "telephone" || f.name === "email") { if (f.value.trim()) validateField(f); return; }
        if (f.required || f.value) validateField(f);
      });
      f.addEventListener(f.type === "file" || f.type === "checkbox" ? "change" : "input", function () {
        var w = f.closest(".field");
        if (w && w.classList.contains("is-invalid")) {
          if (f.name === "telephone" || f.name === "email") validateContact(form); else validateField(f);
        }
      });
    });

    function collect() {
      var fd = new FormData(form);
      fd.delete("_gotcha");
      // Champs vides retirés : l'e-mail reçu ne contient que les informations saisies
      var empty = [];
      fd.forEach(function (v, k) {
        if ((typeof v === "string" && !v.trim()) || (v instanceof File && !v.name && !v.size)) empty.push(k);
      });
      empty.forEach(function (k) { fd.delete(k); });
      return fd;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      status.classList.remove("is-error");

      // Anti-spam (champs pièges remplis uniquement par les robots)
      if (form.elements._gotcha.value || form.elements.botcheck.checked) return;

      var invalid = [];
      if (!validateGroup(form, "service")) invalid.push($("#fs-service"));
      if (!validateGroup(form, "type_besoin")) invalid.push($("#fs-besoin"));
      ["entreprise", "nom"].forEach(function (n) { if (!validateField(form.elements[n])) invalid.push(form.elements[n]); });
      if (!validateContact(form)) invalid.push(form.elements.telephone);
      ["ville", "description", "fichiers"].forEach(function (n) { if (!validateField(form.elements[n])) invalid.push(form.elements[n]); });

      if (invalid.length) {
        status.textContent = "Certains champs sont à compléter avant l'envoi.";
        status.classList.add("is-error");
        var first = invalid[0];
        var focusable = first.tagName === "FIELDSET" ? $("input", first) : first;
        focusable.focus({ preventScroll: true });
        first.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }

      var fd = collect();
      var service = fd.get("service") || "";
      var subject = "Demande chantier — " + service + " — " + (fd.get("entreprise") || "") + " — " + (fd.get("ville") || "");

      // --- Mode 1 : Web3Forms (clé renseignée dans js/config.js) ---
      if (CFG.web3formsKey) {
        fd.append("access_key", CFG.web3formsKey);
        fd.append("subject", subject);
        fd.append("from_name", "Site RT Calorifuge");
        if (fd.get("email")) fd.append("replyto", fd.get("email"));

        btn.disabled = true;
        btn.textContent = "Envoi en cours…";

        fetch("https://api.web3forms.com/submit", { method: "POST", body: fd, headers: { "Accept": "application/json" } })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data && data.success) showSuccess();
            else throw new Error((data && data.message) || "Erreur");
          })
          .catch(function () {
            btn.disabled = false;
            btn.textContent = btnLabel;
            status.textContent = "L'envoi a échoué. Réessayez dans un instant ou appelez-nous au 06 52 41 17 49.";
            status.classList.add("is-error");
          });
        return;
      }

      // --- Mode 2 (secours) : ouverture du logiciel de messagerie ---
      if (CFG.email) {
        var labels = {
          service: "Intervention", type_besoin: "Besoin", entreprise: "Entreprise", nom: "Nom",
          telephone: "Téléphone", email: "E-mail", ville: "Ville du chantier", description: "Besoin",
          date_intervention: "Date souhaitée", duree: "Durée estimée", personnes: "Nombre de personnes",
          type_chantier: "Type de chantier", fonction: "Fonction",
          type_gaines: "Type de gaines", epaisseur: "Épaisseur", reseau_gaines: "Réseau (gaines)", quantite: "Métrage gaines",
          reseau_tuyauterie: "Réseau (tuyauterie)", temperature_reseau: "Chaud / froid", metrage_tuyauterie: "Métrage tuyauterie",
          diametres: "Diamètres", isolant_tuyauterie: "Isolant / épaisseur", finition_tuyauterie: "Finition"
        };
        var lines = [];
        Object.keys(labels).forEach(function (k) {
          var val = fd.get(k);
          if (val && typeof val === "string" && val.trim()) lines.push(labels[k] + " : " + val.trim());
        });
        lines.push("", "(Pensez à joindre vos plans, métrés ou photos à cet e-mail.)");
        window.location.href = "mailto:" + CFG.email +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(lines.join("\n"));
        showSuccess();
        return;
      }

      status.textContent = "Formulaire non relié : renseignez web3formsKey ou email dans js/config.js.";
      status.classList.add("is-error");
    });

    function showSuccess() {
      form.hidden = true;
      success.hidden = false;
      success.setAttribute("tabindex", "-1");
      success.focus({ preventScroll: true });
      success.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  /* --------------------------------------------------------------------- */
  function init() {
    applyConfig();
    initPrefill();
    initNav();
    initCarousel();
    initFaq();
    initForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
