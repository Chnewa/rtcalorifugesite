# RT Calorifuge — site internet

Site B2B monopage en HTML / CSS / JavaScript, hébergé sur Netlify (https://rtcalorifuge.fr).
Aucune installation, aucun build, aucune dépendance.

---

## 1. Contenu du dossier

```
rt-calorifuge-site/
├── index.html                       Page unique (toutes les sections)
├── mentions-legales.html            Page légale (noindex)
├── politique-de-confidentialite.html
├── _redirects                       Redirections Netlify des anciennes pages
├── robots.txt / sitemap.xml
├── css/style.css
├── js/config.js                     Coordonnées (téléphone, e-mail, zone, clé formulaire…)
├── js/main.js
└── assets/
    ├── logo-rt-calorifuge-horizontal-blanc.png   logo en-tête et pied de page
    ├── logo-rt-calorifuge-512.jpg                logo pour Google (données structurées)
    ├── favicon-32.png / apple-touch-icon.png
    └── img/
        ├── chantier-gaines-circulaires-calorifugees-600.jpg / -1000.jpg   photo du hero
        ├── services/        photos des deux services
        ├── realisations/    photos du carrousel (01 à 10)
        └── og-rt-calorifuge.jpg                                            partage réseaux sociaux (1200×630)
```

Organisation de la page (FAQ de 5 questions, carte Hauts-de-France dans la zone d'intervention) : Hero → Situations chantier → Services (#gaines, #tuyauteries) →
Interventions (renfort / zone / lot + types de chantiers) → Pourquoi RT → Réalisations →
Zone d'intervention → FAQ → Contact (#contact) → Pied de page.

---

## 2. Coordonnées

Les coordonnées sont écrites en clair dans `index.html` (pour Google) **et** dans `js/config.js`.
Si l'une change, modifiez les deux, ainsi que le bloc JSON-LD en bas de `index.html`.

Aucune donnée administrative non confirmée n'est affichée : pas de SIREN/SIRET ni d'adresse dans le pied de page.
Une fois connus, ajoutez-les dans le pied de page de `index.html` ; `adresse` et `siret` dans `js/config.js`
apparaissent déjà dans les mentions légales et la politique de confidentialité.

---

## 3. Photos

- Hero : `assets/img/chantier-gaines-circulaires-calorifugees-600.jpg` et `-1000.jpg` (portrait 3:4).
- Services : `assets/img/services/calorifuge-gaines-ventilation-circulaires.jpg` et
  `calorifuge-tuyauteries-local-technique.jpg`. À remplacer idéalement par des photos de vrais chantiers :
  « calorifuge de gaines de ventilation sur chantier » et « calorifuge de tuyauteries en local technique
  ou sur réseau CVC ». Affichées en plein cadre dans les tuiles Services (portrait sur desktop, 3:2 sur mobile) :
  fournir de préférence un format portrait 3:4, 1200 × 1600 px, JPG < 250 Ko. Sans photo, la tuile affiche un fond sombre neutre.
- Réalisations (carrousel) : `assets/img/realisations/01-…jpg` à `10-…jpg`.
  Pour ajouter une photo : JPG ~900 px de haut, < 150 Ko, puis dupliquer un bloc
  `<figure class="slide">` dans `index.html` (src, width, height, alt, légende).
- Photo d'équipe : instructions en commentaire HTML dans la section « Pourquoi RT » (rien n'est affiché aux visiteurs).

Les fichiers d'origine non compressés sont conservés dans `~/Desktop/rt-calorifuge-originaux`.

---

## 4. Formulaire

Envoi par **Web3Forms** (clé `web3formsKey` dans `js/config.js`) : chaque demande arrive par e-mail.
- Champs obligatoires : type d'intervention, besoin, entreprise, nom, téléphone **ou** e-mail, ville, message, consentement.
- « Ajouter des précisions » : planning + champs techniques affichés selon le service choisi
  (gaines, tuyauteries ou les deux). Les champs masqués et les champs vides ne sont pas envoyés.
- Anti-spam : champ piège `_gotcha` (navigateur) + case `botcheck` (vérifiée par Web3Forms).
- Pièces jointes : 10 Mo max. **Vérifiez que votre offre Web3Forms accepte les pièces jointes**
  (fonction réservée à l'offre payante chez Web3Forms) en faisant un envoi test avec une photo.

Sans clé, le formulaire ouvre le logiciel de messagerie du visiteur (mode de secours, sans pièce jointe).

---

## 5. Anciennes pages

`calorifuge-gaines-25-50mm` et `sous-traitance-calorifuge-ventilation` ont été fusionnées dans la
page unique. Le fichier `_redirects` les redirige en 301 vers `/#gaines` et `/#interventions`.

---

## 6. Lancer le site en local

```bash
npx serve .
```
Puis ouvrez l'adresse indiquée (les liens `/mentions-legales` sans `.html` fonctionnent avec `serve` et Netlify).

---

## 7. Après mise en ligne

- Google Search Console : vérifier le domaine `rtcalorifuge.fr`, soumettre `sitemap.xml`,
  demander l'indexation de la page d'accueil.
- Google Business Profile : catégorie « Entreprise d'isolation », basé à Lille, zone desservie Hauts-de-France.
- Tester les données structurées : https://search.google.com/test/rich-results
