/* =========================================================================
   RT CALORIFUGE — SCRIPT PRINCIPAL
   1. Injection des coordonnées (js/config.js)
   2. Menu mobile
   3. Filtres de la galerie
   4. FAQ (un seul volet ouvert)
   5. Validation et envoi du formulaire
   ========================================================================= */
(function () {
  "use strict";

  var CFG = window.RT_CONFIG || {};
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------------
     1. COORDONNÉES
     Remplit tous les éléments [data-cfg="clé"] et les liens tel:/mailto:.
     Si une valeur est vide, le placeholder du HTML est conservé.
  --------------------------------------------------------------------- */
  function applyConfig() {

    // Textes
    $$("[data-cfg]").forEach(function (el) {
      var key = el.getAttribute("data-cfg");
      if (CFG[key]) el.textContent = CFG[key];
    });

    // Liens téléphone
    var telHref = CFG.phoneLink ? "tel:" + CFG.phoneLink.replace(/\s+/g, "") : null;
    $$("[data-cfg-tel]").forEach(function (el) {
      if (telHref) {
        el.setAttribute("href", telHref);
      } else {
        el.setAttribute("href", "#contact");   // évite un lien tel: vide
        el.setAttribute("title", "Numéro à renseigner dans js/config.js");
      }
    });

    // Liens e-mail
    $$("[data-cfg-mail]").forEach(function (el) {
      if (CFG.email) {
        el.setAttribute("href", "mailto:" + CFG.email + "?subject=" +
          encodeURIComponent("Demande de calorifuge de gaines — chantier"));
      } else {
        el.setAttribute("href", "#contact");
      }
    });

    // LinkedIn (masqué si non renseigné)
    var liWrap = $('[data-cfg-wrap="linkedin"]');
    if (liWrap) {
      if (CFG.linkedin) {
        var a = $("[data-cfg-linkedin]", liWrap);
        if (a) { a.setAttribute("href", CFG.linkedin); a.setAttribute("rel", "noopener"); a.setAttribute("target", "_blank"); }
      } else {
        liWrap.hidden = true;
      }
    }

    // Adresse (masquée si non renseignée)
    var adrWrap = $('[data-cfg-wrap="adresse"]');
    if (adrWrap && !CFG.adresse) adrWrap.hidden = true;

    // WhatsApp : bouton affiché uniquement si un lien est fourni
    var wa = $("#wa-btn");
    if (wa) {
      if (CFG.whatsapp) {
        wa.setAttribute("href", CFG.whatsapp);
        wa.setAttribute("rel", "noopener");
        wa.setAttribute("target", "_blank");
        wa.hidden = false;
      } else {
        wa.hidden = true;
      }
    }

    // Données structurées : téléphone, e-mail, zone
    var ld = $("#ld-business");
    if (ld) {
      try {
        var data = JSON.parse(ld.textContent);
        if (CFG.phoneLink) data.telephone = CFG.phoneLink;
        if (CFG.email)     data.email = CFG.email;
        if (CFG.zone)      data.areaServed = CFG.zone;
        if (CFG.siteUrl) {
          data.url  = CFG.siteUrl.replace(/\/?$/, "/");
          data.logo = data.url + "assets/logo-rt-calorifuge.svg";
        }
        if (CFG.adresse) {
          data.address = { "@type": "PostalAddress", "streetAddress": CFG.adresse, "addressCountry": "FR" };
        }
        ld.textContent = JSON.stringify(data);
      } catch (e) { /* JSON-LD laissé tel quel */ }
    }

    // Année du copyright
    var y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------------
     2. MENU MOBILE
  --------------------------------------------------------------------- */
  function initNav() {
    var burger = $("#burger");
    var nav = $("#nav");
    if (!burger || !nav) return;

    function close() {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Ouvrir le menu");
    }

    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });

    $$("a", nav).forEach(function (a) { a.addEventListener("click", close); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------------------------------------------------------------------
     3. FILTRES GALERIE
  --------------------------------------------------------------------- */
  function initGallery() {
    var filters = $$(".filter");
    var shots = $$("#gallery .shot");
    if (!filters.length || !shots.length) return;

    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-filter");
        filters.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        shots.forEach(function (s) {
          var cats = (s.getAttribute("data-cat") || "").split(/\s+/);
          s.hidden = !(cat === "all" || cats.indexOf(cat) !== -1);
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     4. FAQ — un seul volet ouvert à la fois
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
     5. FORMULAIRE
  --------------------------------------------------------------------- */
  var MAX_FILES_BYTES = 10 * 1024 * 1024; // 10 Mo

  function setError(field, message) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    var slot = $('[data-err-for="' + field.id + '"]', wrap);
    if (message) {
      wrap.classList.add("is-invalid");
      field.setAttribute("aria-invalid", "true");
      if (slot) slot.textContent = message;
    } else {
      wrap.classList.remove("is-invalid");
      field.removeAttribute("aria-invalid");
      if (slot) slot.textContent = "";
    }
  }

  function validateField(field) {
    var v = (field.value || "").trim();

    if (field.type === "checkbox") {
      if (field.required && !field.checked) { setError(field, "Merci de cocher cette case."); return false; }
      setError(field, ""); return true;
    }

    if (field.type === "file") {
      var total = 0;
      for (var i = 0; i < field.files.length; i++) total += field.files[i].size;
      if (total > MAX_FILES_BYTES) {
        setError(field, "Fichiers trop volumineux (10 Mo maximum). Envoyez-les par e-mail si besoin.");
        return false;
      }
      setError(field, ""); return true;
    }

    if (field.required && !v) { setError(field, "Ce champ est nécessaire pour vous répondre."); return false; }

    if (field.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) {
      setError(field, "Adresse e-mail non valide.");
      return false;
    }

    if (field.type === "tel" && v && v.replace(/[^0-9]/g, "").length < 9) {
      setError(field, "Numéro de téléphone trop court.");
      return false;
    }

    setError(field, ""); return true;
  }

  function initForm() {
    var form = $("#devis-form");
    if (!form) return;

    var status  = $("#form-status");
    var success = $("#form-success");
    var btn     = $("#submit-btn");
    var fields  = $$("input, select, textarea", form).filter(function (f) { return f.name !== "_gotcha"; });

    fields.forEach(function (f) {
      f.addEventListener("blur", function () { validateField(f); });
      f.addEventListener("input", function () {
        if (f.closest(".field") && f.closest(".field").classList.contains("is-invalid")) validateField(f);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      status.classList.remove("is-error");

      // Anti-spam
      if (form.querySelector('[name="_gotcha"]').value) return;

      var firstInvalid = null;
      fields.forEach(function (f) {
        if (!validateField(f) && !firstInvalid) firstInvalid = f;
      });

      if (firstInvalid) {
        status.textContent = "Certains champs sont à compléter avant l'envoi.";
        status.classList.add("is-error");
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }

      // --- Mode 1 : Web3Forms (clé renseignée dans js/config.js) ---
      if (CFG.web3formsKey) {
        var fd = new FormData(form);
        fd.append("access_key", CFG.web3formsKey);
        fd.append("subject", "Demande chantier — " + (fd.get("entreprise") || "") + " — " + (fd.get("ville") || ""));
        fd.append("from_name", "Site RT Calorifuge");

        btn.disabled = true;
        btn.textContent = "Envoi en cours…";

        fetch("https://api.web3forms.com/submit", { method: "POST", body: fd })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data.success) {
              showSuccess();
            } else {
              throw new Error(data.message || "Erreur");
            }
          })
          .catch(function () {
            btn.disabled = false;
            btn.textContent = "Envoyer ma demande";
            status.textContent = "L'envoi a échoué. Appelez-nous directement ou réessayez dans un instant.";
            status.classList.add("is-error");
          });
        return;
      }

      // --- Mode 2 (secours) : ouverture du client e-mail ---
      if (CFG.email) {
        var lines = [];
        var labels = {
          type_besoin: "Type de besoin", nom: "Nom et prénom", entreprise: "Entreprise",
          fonction: "Fonction", telephone: "Téléphone", email: "E-mail",
          ville: "Ville du chantier", type_chantier: "Type de chantier",
          date_intervention: "Date souhaitée", duree: "Durée estimée",
          personnes: "Nombre de personnes", epaisseur: "Épaisseur",
          type_gaines: "Type de gaines", quantite: "Quantité / métrage",
          description: "Description du besoin"
        };
        Object.keys(labels).forEach(function (k) {
          var el = form.elements[k];
          var val = el ? (el.value || "").trim() : "";
          if (el && el.length && el[0] && el[0].type === "radio") {
            var checked = form.querySelector('[name="' + k + '"]:checked');
            val = checked ? checked.value : "";
          }
          if (val) lines.push(labels[k] + " : " + val);
        });
        lines.push("");
        lines.push("(Pensez à joindre vos plans, métrés ou photos à cet e-mail.)");

        window.location.href = "mailto:" + CFG.email +
          "?subject=" + encodeURIComponent("Demande chantier — " + (form.elements.ville.value || "")) +
          "&body=" + encodeURIComponent(lines.join("\n"));
        showSuccess();
        return;
      }

      status.textContent = "Le formulaire n'est pas encore relié : renseignez web3formsKey ou email dans js/config.js.";
      status.classList.add("is-error");
    });

    function showSuccess() {
      form.hidden = true;
      success.hidden = false;
      success.setAttribute("tabindex", "-1");
      success.focus();
      success.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  /* --------------------------------------------------------------------- */
  function init() {
    applyConfig();
    initNav();
    initGallery();
    initFaq();
    initForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
