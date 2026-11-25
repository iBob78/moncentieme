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
- Cumul : début (référence), fin facultative, ajouts et pauses, modification des lignes, copie. Exemple : 0,50 h ou 0:30 selon le mode.
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

Modules historiques conservés, non exposés dans la navigation actuelle : ConversionTable, EquivalenceVisualizer, OptionBCentesimalOnly, TimeTravelController, DownloadZipModal et VercelDeployModal. Le générateur ZIP utilise un manifeste statique de fichiers source (y compris documentation, lockfile, tests et robots.txt) ; maintenir cette liste à chaque ajout ou suppression de fichier. Le générateur est conservé ; le téléchargement du dépôt GitHub reste la méthode de référence.

## Confidentialité

Pas de compte, cookie, traceur, publicité ou stockage persistant dans le code applicatif. Les saisies et réglages restent en mémoire pendant la navigation et sont perdus au rechargement. Les polices système évitent les requêtes Google Fonts. L'hébergeur peut néanmoins traiter des données techniques de connexion. Les coordonnées de l'éditeur et de l'hébergeur dans les mentions légales restent à compléter avant publication.

## Vercel

Importer le dépôt, choisir Vite, commande npm run build, sortie dist. Vérifier la compilation, la prévisualisation, les cinq onglets et les en-têtes HTTP en production. Aucun secret ni variable d'environnement requis par le code actuel.

## Contribution

Lire [AGENTS.md](AGENTS.md), travailler sur une branche dédiée, lancer les tests et proposer une pull request. Ne pas changer les règles de calcul sans régression. Aucune licence explicite n'est déclarée ; la visibilité publique n'accorde pas à elle seule un droit de redistribution.
