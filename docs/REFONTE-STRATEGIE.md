# Refonte NexosLocal — stratégie et critères de qualité

Document de travail du 18 septembre 2026. Il décrit la recherche, l'audit des fichiers existants et les choix de la refonte en cours. Les recommandations sont des hypothèses à vérifier avec de vrais visiteurs et les demandes reçues, pas une promesse de ventes.

## 1. Activité, clientèle et rôle du site

- **Activité confirmée par l'utilisateur : conseil et accompagnement en acquisition client.** Cette formulation guide le positionnement, la promesse et la hiérarchie des contenus.
- Le cœur du métier est le diagnostic global, la stratégie, la priorisation, l'accompagnement, la coordination et le suivi des actions.
- Les mentions PME, entreprises locales et services B2B proviennent des fichiers précédents. Ce sont des hypothèses de segmentation à confirmer, pas une audience prioritaire validée par l'utilisateur.
- Aucun secteur prioritaire, territoire précis ou profil de client rentable n'est confirmé ; le nom NexosLocal ne justifie pas de limiter la cible aux activités locales.
- Les leviers sont étudiés selon la situation : SEO, conversion, acquisition payante, automatisation et expertises complémentaires. Leur étude ou leur coordination ne signifie pas que NexosLocal revendique systématiquement leur exécution.
- Le référencement local est une expertise historique secondaire, à replacer dans une lecture globale de l'acquisition.
- L'objectif du site est d'aider un dirigeant à comprendre comment son acquisition sera analysée et accompagnée, puis à engager une conversation pertinente.
- La qualité des demandes compte autant que leur nombre : une visite ou un clic ne constitue pas une vente.

## 2. Recherche : principes retenus

**Une promesse et une action cohérentes.** Google recommande d'aligner annonce, contenu de la page et action proposée, de rendre l'information essentielle accessible immédiatement et de faciliter le contact sur mobile. Application : décrire clairement le premier échange et proposer un bouton qui mène effectivement à cette étape.

Source : [Google Ads — Optimiser les annonces et pages de destination](https://support.google.com/google-ads/answer/6238826/optimising-your-ad-and-landing-page?hl=en-GB).

**La confiance vient aussi de la substance.** Les recherches de Nielsen Norman Group sur les présentations d'entreprise privilégient langage clair, personnes réelles, informations utiles et transparence. Application : montrer Théo, expliquer le travail et ses limites, utiliser uniquement des preuves vérifiables.

Source : [Nielsen Norman Group — About Us Information on Corporate Websites](https://www.nngroup.com/articles/about-us-information-on-websites/).

**L'accueil doit expliquer l'activité et fournir des points d'entrée utiles.** Les recommandations de Nielsen Norman Group demandent une présentation explicite de l'entreprise et des accès correspondant aux tâches des visiteurs. Application : organiser le parcours autour des problèmes du dirigeant avant de présenter les noms des services.

Source : [Nielsen Norman Group — Top 10 Guidelines for Homepage Usability](https://www.nngroup.com/articles/top-ten-guidelines-for-homepage-usability/).

Ces sources étayent des principes d'utilisabilité. Elles ne permettent pas de prédire le taux de conversion de NexosLocal ni de déclarer une palette plus rentable qu'une autre.

**Évaluer ce que l'IA produit.** [NN/g — The Custodial Era of UX (28 août 2026)](https://www.nngroup.com/articles/ai-ux-debt/) souligne le décalage entre la vitesse de génération et la vérification de l'utilité réelle. Application : supprimer les promesses vagues et vérifier les interactions, pas seulement leur apparence. [NN/g — Handmade Designs](https://www.nngroup.com/articles/handmade-designs/) décrit l'intérêt de signes humains et d'une histoire cohérente ; ajouter une texture ne remplace pas les preuves réelles.

**La rapidité participe au parcours.** Les [études de cas Core Web Vitals de Google](https://web.dev/case-studies/vitals-business-impact) relient l'amélioration de l'expérience technique aux résultats observés dans plusieurs entreprises. Ces chiffres ne sont pas transposables à NexosLocal. La refonte conserve du HTML statique, du JavaScript léger et aucune bibliothèque d'animation.

## 3. Audit observé avant refonte

- Le titre « Transformez votre acquisition en opportunités commerciales » décrit une intention abstraite et explique peu ce qui sera fait.
- Le bouton « Recevoir un diagnostic » mène à trois moyens de contact ; le contenu, le format et les conditions du diagnostic ne sont pas définis.
- Les textes répètent les notions de leviers, frictions, signaux et parcours sans montrer assez de situations concrètes.
- La navigation « Pour qui » mène à une section sur les bénéfices du diagnostic, pas aux entreprises concernées.
- Les mêmes grilles, numéros et méthodes en trois étapes se répètent sur l'accueil et les pages de services.
- Le portrait de Théo est disponible mais arrive tard dans la page et devient très petit sur mobile.
- Aucun résultat client chiffré, témoignage vérifiable, portfolio ou certification n'a été trouvé dans les fichiers examinés.
- Le suivi JavaScript existant enregistre `contact_intent`, y compris un clic vers la page contact ; il ne démontre pas qu'une demande a été envoyée.
- Les CGV conservent des prix d'entrée de 180 € pour un site et 400 € pour un Pack Visibilité Locale, alors que l'offre actuelle est présentée comme un accompagnement sur devis.
- Des champs « en cours de mise à jour » subsistent dans les informations légales.
- La politique de confidentialité annonce l'absence de cookies publicitaires alors que les pages chargent Google Ads/GTM. Le comportement effectif des balises et la gestion du consentement doivent être vérifiés avant publication ; la refonte conserve les identifiants existants.

## 4. Direction retenue pour la refonte en cours

- **Héros :** annoncer explicitement « Conseil et accompagnement en acquisition client », puis expliquer la valeur du diagnostic, des choix stratégiques et du suivi.
- **Entrée par problème :** difficulté à identifier ce qui bloque, multiplication d'actions sans priorités, acquisition insuffisante ou irrégulière, manque de coordination et de suivi ; chaque situation appelle d'abord une compréhension globale.
- **Hiérarchie de l'offre :** diagnostic, stratégie, priorisation et accompagnement précèdent les leviers. Le SEO local et la création de pages ne définissent pas à eux seuls l'activité.
- **Périmètre d'intervention :** distinguer ce qui est analysé, recommandé, accompagné ou coordonné. L'acquisition payante, l'automatisation et les expertises complémentaires sont à étudier selon le besoin, sans revendiquer leur exécution systématique.
- **Démonstration :** des exemples illustratifs expliquent le raisonnement et les actions possibles. Leur statut doit rester explicite ; ils ne sont pas des cas clients ni des résultats obtenus.
- **Incarnation :** le visage de Théo et le contact direct prennent une place visible, avec une présentation factuelle de son rôle.
- **Action principale :** « Parlons de votre situation » annonce un échange plutôt qu'un diagnostic déjà produit.
- **Contact guidé :** un formulaire prépare un e-mail ou un message WhatsApp que le visiteur relit puis envoie lui-même dans son application.
- **Fonctionnement honnête :** ce formulaire n'est pas une collecte par backend. Préparer ou ouvrir un message ne signifie pas qu'il a été envoyé ou reçu.
- **Direction artistique :** papier, encre et corail, composition éditoriale, rythme varié et hiérarchie nette. Ce choix exprime la marque ; son efficacité commerciale reste à mesurer.
- **Preuves :** aucun faux KPI, logo client, avis, tableau de bord ou engagement commercial inventé.
- **Continuité :** préserver les URLs utiles, les coordonnées réelles et les informations commerciales confirmées ; les anciens fichiers ne priment pas sur la définition de l'activité donnée par l'utilisateur.

## 5. Éviter le rendu « AI slop »

Les éléments ci-dessous peuvent donner une impression générique ; ils ne permettent pas d'identifier avec certitude l'origine humaine ou générée d'un site.

| Signal observé ou à éviter | Correction retenue |
| --- | --- |
| Titres abstraits ou interchangeables | Nommer un problème, une action et un résultat attendu compréhensible. |
| Suites de trois verbes dans toutes les sections | Donner aux titres une fonction propre et une formulation naturelle. |
| Numéros 01/02/03 et cartes répétés partout | Utiliser la composition adaptée au contenu, avec moins de répétitions. |
| Promesses sans démonstration | Montrer des exemples clairement illustratifs et des livrables précis. |
| Jargon accumulé | Expliquer concrètement les décisions, les priorités, les actions à coordonner et la manière de suivre leur effet. |
| Statistiques, logos ou témoignages décoratifs | Publier seulement des preuves réelles, attribuées et autorisées. |
| Images artificielles pour simuler une équipe | Utiliser le portrait existant et des visuels utiles au propos. |
| Interactions qui donnent une fausse impression de service actif | Expliquer ce qui est préparé, ouvert ou envoyé, sans faux message de succès. |

## 6. Plan de mesure

1. Vérifier le parcours sur téléphone et ordinateur : compréhension de l'offre, navigation, lisibilité, boutons et préparation du message.
2. Faire tester la page par des dirigeants proches de la cible : comprennent-ils l'activité, le problème traité, l'interlocuteur et la prochaine étape ?
3. Distinguer les événements : clic sur le CTA, ouverture du contact, préparation du message, ouverture de l'application de messagerie.
4. Ne jamais classer ces événements comme « message envoyé », « prospect reçu » ou « vente » sans confirmation réelle.
5. Rapprocher les prises de contact effectivement reçues d'un suivi commercial simple : source connue, besoin, qualification, proposition et issue.
6. Évaluer les demandes pertinentes, les rendez-vous et les ventes avec leur contexte, leur période et leur volume ; éviter de conclure sur quelques clics.
7. Comparer les versions à trafic et intentions comparables. Ne lancer un test A/B que si le volume permet une lecture utile ; sinon privilégier les entretiens et les corrections de friction.
8. Documenter la configuration des outils de mesure et vérifier leur fonctionnement avant d'interpréter les données.

## 7. Informations commerciales à compléter

- Confirmer les segments réellement prioritaires et les critères d'une demande pertinente ; ne pas présenter les entreprises locales comme une priorité déjà validée.
- Préciser les frontières entre conseil, accompagnement, coordination et exécution pour chaque levier, ainsi que le rôle des éventuels intervenants complémentaires.
- Préciser ce que comprend le premier échange, puis ce qui relève d'une prestation payante.
- Confirmer les tarifs et conditions actuels ; les anciens prix des CGV ne sont pas validés pour la nouvelle offre.
- Fournir les données d'identification manquantes, dont le SIRET, sans les déduire ni les inventer.
- Harmoniser les informations commerciales et les textes contractuels une fois ces éléments confirmés.
- Actualiser la politique de confidentialité avec le canal WhatsApp, le fonctionnement du brouillon de contact et la configuration réelle des balises.
- Réunir des exemples de travail réels et, si disponibles, des avis ou résultats accompagnés de leur contexte et de l'autorisation de publication.
- Confirmer le délai de réponse annoncé et la capacité à assurer le suivi direct présenté sur le site.

L'absence de ces éléments n'autorise pas à fabriquer des preuves. La refonte peut montrer clairement l'offre et le raisonnement en attendant leur ajout.
