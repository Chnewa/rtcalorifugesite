/* =========================================================================
   RT CALORIFUGE — FICHIER DE CONFIGURATION
   -------------------------------------------------------------------------
   C'EST LE SEUL FICHIER À MODIFIER POUR VOS COORDONNÉES.
   Remplacez les valeurs entre guillemets, enregistrez, rechargez la page.
   Tant qu'une valeur reste vide (""), le site affiche le placeholder
   correspondant, par exemple [NUMÉRO DE TÉLÉPHONE].
   ========================================================================= */

window.RT_CONFIG = {

  /* --- Téléphone -------------------------------------------------------
     phoneDisplay : ce qui est affiché à l'écran   ex. "06 12 34 56 78"
     phoneLink    : le numéro utilisé pour l'appel ex. "+33612345678"
                    (format international, sans espace)                  */
  phoneDisplay: "",
  phoneLink: "+33652411749",

  /* --- E-mail --------------------------------------------------------- */
  email: "contact@rtcalorifuge.fr",

  /* --- Zone d'intervention --------------------------------------------
     ex. "Île-de-France et régions limitrophes" ou "France entière"      */
  zone: "",

  /* --- Horaires de contact ---------------------------------------------
     ex. "Du lundi au vendredi, 7h30 - 18h00"                            */
  horaires: "",

  /* --- Adresse et SIRET (pied de page + mentions légales) ------------- */
  adresse: "",
  siret: "",

  /* --- WhatsApp --------------------------------------------------------
     Laissez vide pour masquer complètement le bouton WhatsApp.
     Pour l'activer : "https://wa.me/33612345678"                        */
  whatsapp: "",

  /* --- Réseaux professionnels ------------------------------------------
     Laissez vide pour masquer le lien.                                  */
  linkedin: "",

  /* --- Formulaire ------------------------------------------------------
     Collez ici votre clé Web3Forms (gratuit, https://web3forms.com) :
     le formulaire enverra les demandes sur votre e-mail, pièces jointes
     comprises. Laissez vide pour utiliser le mode de secours "mailto".  */
  web3formsKey: "051777d8-783c-46b6-9fd9-1b59baf8eeb3",

  /* --- Nom de domaine (pour les données structurées) ------------------ */
  siteUrl: "https://www.rtcalorifuge.fr"
};
