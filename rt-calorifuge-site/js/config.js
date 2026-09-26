/* =========================================================================
   RT CALORIFUGE — FICHIER DE CONFIGURATION
   -------------------------------------------------------------------------
   Coordonnées utilisées dans tout le site. Les valeurs actuelles sont aussi
   écrites en clair dans index.html (pour les moteurs de recherche) : si vous
   en changez une ici, pensez à la mettre à jour dans le HTML et dans le
   bloc JSON-LD en bas de index.html.
   Une valeur vide ("") masque la ligne correspondante (adresse, SIRET,
   LinkedIn) : aucun texte provisoire n'est affiché aux visiteurs.
   ========================================================================= */

window.RT_CONFIG = {

  /* --- Téléphone -------------------------------------------------------
     phoneDisplay : ce qui est affiché à l'écran
     phoneLink    : numéro utilisé pour l'appel (format international)      */
  phoneDisplay: "06 52 41 17 49",
  phoneLink: "+33652411749",

  /* --- E-mail --------------------------------------------------------- */
  email: "contact@rtcalorifuge.fr",

  /* --- Zone d'intervention -------------------------------------------- */
  zone: "Basé à Lille, intervention dans les Hauts-de-France",

  /* --- Horaires de contact -------------------------------------------- */
  horaires: "8h00 – 18h00",

  /* --- Adresse et SIRET (pied de page) : vides = lignes masquées ------- */
  adresse: "",
  siret: "",

  /* --- Réseaux professionnels : vide = lien masqué --------------------- */
  linkedin: "",

  /* --- Formulaire ------------------------------------------------------
     Clé Web3Forms (https://web3forms.com) : les demandes arrivent par
     e-mail. Vide = mode de secours « mailto ».                           */
  web3formsKey: "051777d8-783c-46b6-9fd9-1b59baf8eeb3",

  /* --- Nom de domaine -------------------------------------------------- */
  siteUrl: "https://rtcalorifuge.fr"
};
