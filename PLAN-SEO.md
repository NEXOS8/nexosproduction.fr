# Plan SEO — NexosProduction (Lyon)

> Feuille de route pour dominer le SEO local lyonnais (PME / micro-entrepreneurs).
> Rédigé le 15 juin 2026. Les actions **on-site** ont été réalisées ; ce document liste surtout les actions **off-site** que vous seul pouvez faire (compte Google, etc.) — ce sont elles qui pèsent le plus lourd dans le classement local.

---

## 0. Ce qui a déjà été fait sur le site ✅

- **Téléphone réel** (+33 6 31 68 68 32) partout (footer, panneau latéral, données structurées) — fini le faux numéro.
- **Lien Google Maps factice** remplacé ; zone affichée « Lyon & Métropole de Lyon » (business sans adresse publique).
- **Note 5★ factice supprimée** des données structurées (évite une pénalité Google) — à réactiver avec de vrais avis.
- **Domaine canonique aligné sur `www`** (le site redirige l'apex → www, mais toutes les balises pointaient vers l'apex : conflit corrigé).
- **3 pages légales créées** (obligatoires) : mentions légales, CGV, confidentialité (RGPD). ⚠️ voir §1.
- **3 pages SEO dédiées créées** : `/referencement-local-lyon`, `/creation-site-internet-lyon`, `/google-business-profile-lyon` (chacune avec contenu unique, FAQ, données structurées).
- **7 liens internes cassés** (`#offre`) réparés.
- **Données structurées enrichies** : 2 offres, 13 zones desservies, `knowsAbout`, logo, slogan, FAQ complète (6 Q/R), `BreadcrumbList` + `Service` + `FAQPage` sur les pages dédiées.
- **Image Open Graph** créée (`og.jpg`/`og.png`) + jeu d'icônes (favicon, apple-touch-icon, icônes PWA) + `site.webmanifest`.
- **`vercel.json`** : URLs propres (`/mentions-legales` sans `.html`), cache des assets, en-têtes de sécurité (HSTS, etc.).
- **`sitemap.xml`** mis à jour (7 URLs, dates), `robots.txt` OK.
- **Polices** : ajout du poids 800 manquant + nettoyage ; balises `<meta>` géo, `theme-color`, robots avancés.

---

## 1. ⚠️ À COMPLÉTER TOUT DE SUITE (mentions légales)

Les pages légales contiennent des champs `[À COMPLÉTER]` — légalement obligatoires :

- [ ] **Nom + prénom** de l'entrepreneur (dans `mentions-legales.html`, `cgv.html`, `confidentialite.html`).
- [ ] **N° SIRET** (14 chiffres) — `mentions-legales.html` et `cgv.html`.
- [ ] **Adresse de domiciliation** — `mentions-legales.html` (obligatoire pour une entreprise individuelle ; si vous ne voulez pas publier votre domicile, utilisez une société de domiciliation).
- [ ] **Médiateur de la consommation** (nom + site) — `cgv.html` (obligatoire si vous avez des clients particuliers). Ex. : adhésion à un médiateur agréé (~30–60 €/an).

> Donnez-moi ces infos et je les intègre en 2 minutes. Tant qu'elles ne sont pas remplies, ne communiquez pas massivement (risque légal mineur mais réel).

---

## 2. Google Business Profile — PRIORITÉ #1 (≈ 32 % du classement local)

C'est LE levier numéro un, et c'est exactement ce que vous vendez : montrez l'exemple.

- [ ] Créer/revendiquer la fiche sur **business.google.com**.
- [ ] **Catégorie principale** précise (ex. « Agence de référencement » / « Concepteur de sites Web ») + catégories secondaires.
- [ ] **Zone de service** : Lyon + communes (Villeurbanne, Caluire, Bron, Vénissieux, Saint-Priest, Écully, Tassin, Sainte-Foy-lès-Lyon, Villefranche-sur-Saône…) — **sans adresse** affichée.
- [ ] **Téléphone** : +33 6 31 68 68 32 — **Site** : https://www.nexosproduction.fr/
- [ ] **Description** (750 caractères) avec « agence SEO local à Lyon », « création de site internet », « Google Maps ».
- [ ] **Photos** : logo, photo de couverture, visuels de réalisations (les fiches avec photos reçoivent +++ de contacts).
- [ ] **Services / Produits** : lister vos 2 offres (180 € / 400 €).
- [ ] **Vérification** de la fiche (vidéo / téléphone selon ce que Google propose).
- [ ] Activer la **messagerie** et les **questions/réponses**.
- [ ] **Publier un post Google par semaine** (offre, actu, conseil) → signal d'activité.

---

## 3. Avis clients Google (≈ 16 % du classement local)

- [ ] Demander un avis à vos clients satisfaits — **commencez par Anne Fialeix et Christian Bondis**.
- [ ] Récupérer votre **lien d'avis court** depuis la fiche (format `g.page/r/...`) et l'envoyer par SMS/email.
- [ ] **Répondre à chaque avis** (positif comme négatif) — Google valorise les réponses.
- [ ] Objectif : **5 à 10 avis** dans les 2 premiers mois, puis un flux régulier.
- [ ] Une fois de vrais avis visibles, **dites-le moi** : je rajoute une section « Avis » sur le site + je réactive la note ⭐ en données structurées (cette fois, conforme).

---

## 4. Citations & annuaires français (cohérence NAP ≈ 7 %)

**Règle d'or : Nom, Adresse/zone, Téléphone STRICTEMENT identiques partout** (au caractère près).

NAP de référence à copier-coller :
```
NexosProduction
Lyon & Métropole de Lyon
+33 6 31 68 68 32
contact@nexosproduction.fr
https://www.nexosproduction.fr/
```

- [ ] Bing Places for Business
- [ ] Apple Business Connect (Plans)
- [ ] PagesJaunes / Solocal
- [ ] Yelp France
- [ ] Foursquare
- [ ] Annuaires : Cylex, 118000, Justacôté, Hoodspot, Mappy, Pages24
- [ ] Annuaires **sectoriels** selon vos cibles (artisans, coiffeurs, etc.)
- [ ] CCI Lyon Métropole / réseaux d'entrepreneurs locaux

---

## 5. Google Search Console + Bing Webmaster Tools (gratuit, indispensable)

- [ ] Créer une propriété **Domaine** sur Search Console (couvre www + apex) — vérification par **enregistrement DNS TXT** chez votre registrar.
- [ ] Soumettre le sitemap : `https://www.nexosproduction.fr/sitemap.xml`
- [ ] **Demander l'indexation** des 4 pages clés (accueil + 3 pages services).
- [ ] Surveiller : pages indexées, requêtes, position moyenne, Core Web Vitals.
- [ ] Idem sur **Bing Webmaster Tools** (rapide, et alimente aussi l'IA/Copilot).

---

## 6. Backlinks locaux (notoriété / autorité)

- [ ] 🔑 **Le meilleur filon : un crédit « Site réalisé par NexosProduction » en pied de chaque site client**, avec un lien vers www.nexosproduction.fr. Chaque client devient un backlink thématique local. (À faire sur anne-fialeix.fr, christian-bondis-coiffure.fr, etc.)
- [ ] Partenariats locaux (fournisseurs, autres indépendants) avec échange de liens pertinents.
- [ ] Articles invités sur des blogs lyonnais / entrepreneuriat.
- [ ] Presse locale, newsletters de quartier, associations de commerçants.

---

## 7. Contenu — prochaines pages à créer (quand vous voulez aller plus loin)

Chaque page = une nouvelle porte d'entrée sur Google. Idées à fort potentiel local :
- Pages **par métier** : « création de site pour coiffeur à Lyon », « SEO pour artisan à Lyon », « site internet pour restaurant »…
- Pages **par zone** : « référencement Villeurbanne », « agence web Lyon 6 »… (⚠️ uniquement avec du contenu **réellement différent**, sinon Google pénalise les pages « doorway »).
- Un **blog** : « Comment apparaître sur Google Maps à Lyon », « Combien coûte un site internet en 2026 », etc.

> Dites-moi la ou les pages prioritaires, je les rédige sur le même modèle.

---

## 8. Choix du domaine : `www` ou apex ?

Actuellement, `nexosproduction.fr` redirige (308) vers `www.nexosproduction.fr`. J'ai donc tout aligné sur **www** (cohérent et fonctionnel immédiatement).

- Si vous **préférez la version courte** `nexosproduction.fr` (sans www), c'est aussi un très bon choix :
  1. Dans **Vercel → Settings → Domains**, définir `nexosproduction.fr` comme domaine **principal** (Vercel redirigera alors www → apex).
  2. Me prévenir : je rebascule toutes les balises (canonical, sitemap, schéma) vers l'apex en quelques minutes.

L'essentiel est la **cohérence** : une seule version canonique. C'est fait.

---

## 9. Améliorations techniques optionnelles (je peux les faire sur demande)

- [ ] **Auto-héberger les polices** (Syne / Outfit, déjà téléchargées dans `assets/fonts/`) au format woff2 → supprime la requête Google Fonts (meilleur pour le **RGPD** et la **vitesse**). Petit risque visuel à tester, d'où le « sur demande ».
- [ ] **Vrai formulaire de contact** (via Web3Forms/Formspree, gratuit) à la place du simple `mailto:` → plus de conversions. Nécessite une clé API gratuite de votre part.
- [ ] **Prise de RDV en ligne** (Cal.com / Calendly) pour l'audit gratuit.
- [ ] Mini-optimisation des images (l'`og.jpg` peut être encore allégé).

---

## 10. Mesure & objectifs (KPIs)

| Indicateur | Où | Objectif 3 mois |
|---|---|---|
| Position « agence SEO local Lyon » & variantes | Search Console | Top 10 → Top 3 |
| Vues / appels / itinéraires de la fiche | Google Business Profile | Croissance mensuelle |
| Avis Google | Fiche GBP | ≥ 5–10, note ≥ 4,8 |
| Pages indexées | Search Console | 7/7 |
| Trafic organique | Search Console | +50 % |

---

## ✅ Checklist « 30 premiers jours »

1. [ ] Compléter les `[À COMPLÉTER]` légaux (§1)
2. [ ] Créer + vérifier la fiche **Google Business Profile** (§2)
3. [ ] Obtenir **3–5 avis Google** (§3)
4. [ ] **Search Console** + soumettre le sitemap + demander l'indexation (§5)
5. [ ] Inscrire le NAP sur **Bing, Apple Plans, PagesJaunes** (§4)
6. [ ] Ajouter le crédit « Réalisé par NexosProduction » sur les **sites clients** (§6)
7. [ ] Choisir www vs apex (§8)
