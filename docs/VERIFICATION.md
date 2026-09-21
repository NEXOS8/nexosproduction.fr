# Vérification de la refonte — 18 septembre 2026

Correction de positionnement intégrée après précision de l’utilisateur : **conseil et accompagnement en acquisition client**. Diagnostic global, stratégie et accompagnement structurent désormais l’accueil et le contact. Paid, automatisation et expertises complémentaires sont présentés comme leviers à étudier ou coordonner ; le référencement local est une expertise historique secondaire. L’ancien angle centré sur la visibilité Google a été retiré des pages commerciales.

## Réalisé

- Accueil, contact et cinq pages de services réécrits ; identité et navigation communes sur dix pages.
- Nouveau CSS responsive et JavaScript sans dépendance de production. Les anciens CSS ne sont plus chargés.
- Icônes, image de partage et manifeste harmonisés avec la nouvelle identité. Les PNG sont fournis, leur génération n'est pas nécessaire pour publier.
- Sélection du besoin, questions fréquentes natives, navigation mobile et préparation d'un brouillon e-mail/WhatsApp.
- URL du service transmise au formulaire via un besoin prédéfini. Aucun texte saisi n'est placé dans les événements de mesure.
- Le formulaire est activé par JavaScript ; sans JavaScript, les coordonnées et une alternative explicite restent disponibles.
- Les pages légales reçoivent l'habillage commun ; leurs conditions commerciales et données non confirmées ne sont pas inventées.

## Contrôles effectués

- Vérification statique des dix pages après correction du positionnement : 349 références locales, ancres et assets résolues ; un H1 et une canonique par page ; sept blocs JSON-LD valides.
- Navigateur Chromium intégré : aucun débordement horizontal sur les dix pages à 320 px ; accueil, contact et référencement local également vérifiés à 768 et 1440 px. Accueil et contact inspectés à 390 px.
- Inspection visuelle de l'accueil, d'une page service et du contact sur ordinateur/mobile.
- Sélecteur de situation : affichage du bon contenu et maintien des alternatives sans JavaScript dans le HTML.
- Menu mobile : ouverture, navigation et fermeture ; FAQ : ouverture et contenu attendus.
- Formulaire : champ obligatoire, rejet d'une activité contenant seulement des espaces, présélection du besoin, brouillon correctement encodé, HTML saisi conservé comme texte, masquage du brouillon devenu périmé après modification.
- Les destinations e-mail et WhatsApp générées ont été inspectées. Aucun message de test n'a été envoyé.
- Vérification de syntaxe JavaScript et des espaces dans les diffs Git.

## Limites

- Aucun gain de conversion n'est mesuré ni garanti ; aucune campagne, vente ou collecte de contacts n'a été simulée comme réelle.
- Le contact prépare un message à envoyer dans la messagerie du visiteur ; il n'existe pas de backend d'envoi.
- Pas de test sur appareils physiques Safari/iOS/Android, pas de score Lighthouse certifié ni de données de vitesse terrain.
- Les informations légales provisoires, l'ancienne grille tarifaire et la politique de confidentialité nécessitent des informations réelles avant publication. Voir REFONTE-STRATEGIE.md.
- Prévisualisation locale uniquement : aucune publication réalisée.

## Aperçu

Depuis le dossier du site : `node scripts/preview.mjs`, puis ouvrir `http://127.0.0.1:4173`.
Les fichiers HTML sont directement déployables ; aucune compilation n'est nécessaire.
