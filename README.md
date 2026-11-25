# Mon centième

Application web française de visualisation de l'heure classique et de l'heure décimale (heures au centième), avec conversion, cumul, pointage et chronomètre. Calculs dans le navigateur, sans compte ni serveur applicatif.

## Comprendre le centième

Une heure contient 100 centièmes, soit 36 secondes par centième. Formule : heures + minutes / 60 + secondes / 3600. Arrondir uniquement à l'affichage.

| Classique | Décimal |
| --- | --- |
| 13 h 30 | 13,50 h |
| 7 h 45 | 7,75 h |
| 7 h 36 | 7,60 h |
| 1 min | 0,016666… h |

## Fonctionnalités

- Horloges analogiques et numériques synchronisées sur l'heure locale, thèmes, précision, son et format configurables.
- Convertisseur dans les deux sens, virgule ou point pour les décimales.
- Cumul : début (référence) au choix en heure normale (07:30) ou centième (7,50), équivalence instantanée, fin facultative en heure normale, ajouts et pauses, modification des lignes, copie. Changer d'unité préserve l'horaire à la seconde près ; une saisie décimale est convertie à la seconde la plus proche. Exemple : 0,50 h ou 0:30 selon le mode.
  Chaque ligne d'activité ou de pause possède aussi son propre départ facultatif en heure normale ou décimale, modifiable après ajout. La fin est calculée automatiquement (J+1 si passage de minuit), sans modifier le cumul des durées. Exemple : Harmo, 2,70 h, départ 07:30 (7,50) → fin 10:12 (10,20).
- Pointage : périodes travaillées et estimation brute au taux horaire. Les périodes qui se chevauchent sont additionnées, sans majoration ni règle fiscale ou conventionnelle.
- Chronomètre double unité, tours, pause et remise à zéro.
- Informations pédagogiques, réglages et mentions légales.

Passage de minuit pris en charge pour une période unique ; début = fin donne zéro. Pas de gestion de dates ou de changement d'heure saisonnier pour les durées. Résultats indicatifs.

## Développement

Node.js 22.18+ (LTS recommandé), npm et Git.

    git clone https://github.com/iBob78/moncentieme.git
    cd moncentieme
    npm ci
    npm run dev

Ouvrir l'adresse indiquée par Vite.

| Commande | Rôle |
| --- | --- |
| npm run dev | Développement |
| npm test | Tests de calcul et validation (node:test) |
| npm run typecheck | Vérification TypeScript |
| npm run build | Production vers dist/ |
| npm run preview | Prévisualisation du build |

## Intégration continue (GitHub Actions)

Le workflow [Qualité du code](.github/workflows/ci.yml) s'exécute sur chaque pull request vers main, sur chaque push vers main et, une fois disponible sur la branche par défaut, manuellement depuis l'onglet Actions. Il utilise Node.js 22, npm ci avec le lockfile, npm test, npm run typecheck, npm run build et vérifie la présence de dist/index.html. Les étapes s'arrêtent en cas d'échec ; les exécutions devenues obsolètes sont annulées.

Consulter les résultats dans [Actions](https://github.com/iBob78/moncentieme/actions) ou dans les vérifications de la pull request. Ne fusionner qu'après réussite de la CI et vérification manuelle des changements d'interface. Ce workflow ne déploie pas le site et ne rend pas les vérifications obligatoires à lui seul : la protection de main doit être configurée séparément.

## Architecture

    index.html                   Métadonnées et entrée HTML
    src/main.tsx                 Montage React
    src/App.tsx                  Navigation et horloge
    src/components/              Interfaces et dialogues
    src/types/clock.ts           Types métier
    src/utils/timeCalculations.ts Conversions et validation
    src/utils/audioTick.ts       Son local
    src/utils/projectZipGenerator.ts Export des sources
    tests/                       Tests automatisés
    public/robots.txt            Exploration du site
    vite.config.ts               React/Tailwind/HTML monofichier
    vercel.json                  Hébergement
    AGENTS.md                    Instructions de contribution
    .github/workflows/ci.yml     Tests, TypeScript et build automatiques

Modules historiques conservés, non exposés dans la navigation actuelle : ConversionTable, EquivalenceVisualizer, OptionBCentesimalOnly, TimeTravelController, DownloadZipModal et VercelDeployModal. Le générateur ZIP utilise un manifeste statique de fichiers source (y compris documentation, lockfile, tests et robots.txt) ; maintenir cette liste à chaque ajout ou suppression de fichier. Le générateur est conservé ; le téléchargement du dépôt GitHub reste la méthode de référence.

## Confidentialité

Pas de compte, cookie, traceur, publicité ou stockage persistant dans le code applicatif. Les saisies et réglages restent en mémoire pendant la navigation et sont perdus au rechargement. Les polices système évitent les requêtes Google Fonts. L'hébergeur peut néanmoins traiter des données techniques de connexion. Les coordonnées de l'éditeur et de l'hébergeur dans les mentions légales restent à compléter avant publication.

## Vercel

Importer le dépôt, choisir Vite, commande npm run build, sortie dist. Vérifier la compilation, la prévisualisation, les cinq onglets et les en-têtes HTTP en production. Aucun secret ni variable d'environnement requis par le code actuel.

## Historique et état des validations

Consulter [CHANGELOG.md](CHANGELOG.md) pour les changements, les preuves de validation et les points restant à traiter. Le premier contrôle GitHub Actions du 25 novembre 2026 a réussi sur le commit `08a0fb3` ([rapport](https://github.com/iBob78/moncentieme/actions/runs/45576478244)). Les résultats des commits ultérieurs sont à vérifier dans Actions.

## Contribution

Lire [AGENTS.md](AGENTS.md), travailler sur une branche dédiée, lancer les tests et proposer une pull request. Ne pas changer les règles de calcul sans régression. Aucune licence explicite n'est déclarée ; la visibilité publique n'accorde pas à elle seule un droit de redistribution.
