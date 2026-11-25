# AGENTS.md — Mon centième

## Mission
Application française, gratuite, statique : heures décimales, pointage et chronomètre. Préserver exactitude, simplicité et confidentialité. Ces règles couvrent tout le dépôt. Lire le README avant toute intervention.

## Architecture
- React 19, TypeScript strict, Vite 7, Tailwind CSS 4. Vercel statique, sortie dist/.
- src/App.tsx : navigation, réglages et heure locale ; outils maintenus en mémoire pendant la navigation.
- src/components/ : horloges SVG, convertisseur, cumul, paie, chronomètre, dialogues.
- src/utils/timeCalculations.ts : conversions et validation métier ; src/types/clock.ts : contrats.
- src/utils/projectZipGenerator.ts : export des sources. Les composants historiques non exposés sont documentés dans le README.

## Invariants métier
- 1 h = 60 min = 3600 s = 100 centièmes d'heure ; 1 centième = 36 s. 7,60 h = 7 h 36, jamais 7 h 60.
- Accepter virgule et point ; rejeter valeurs négatives, non finies, minutes/secondes >= 60 et saisies malformées.
- Heure de journée distincte d'une durée : 24:00 seul horaire 24 valide. Fin antérieure au début = passage de minuit ; heures égales = zéro.
- Cumul : (fin - début) + ajouts - pauses ; début seul = référence. Arrondir uniquement à l'affichage. Ne jamais copier un total connu invalide.
- Paie : estimation brute, sans majorations ni règles conventionnelles implicites ; les périodes superposées sont additionnées.

## Confidentialité et interface
- Aucun compte, stockage persistant, traceur ou appel externe ajouté sans accord. Les saisies restent en mémoire vive. Ne pas promettre l'absence de journaux côté hébergeur.
- Polices système ; interface française, responsive, accessible au clavier et erreurs explicites. Ne pas inventer les coordonnées légales.

## Vérifications
1. Node 22.18+ recommandé ; npm ci.
2. npm test (ajouter une régression à chaque modification métier), npm run typecheck, npm run build.
3. Vérifier les cinq onglets, conservation des saisies, pauses, minuit, copies et chronomètre en navigation.
4. Actualiser README et le manifeste statique de l'export ZIP à chaque ajout, renommage ou suppression de fichier ; conserver les imports ?raw explicites. Ne jamais annoncer un test réussi sans l'avoir exécuté.

## Intégration continue
Le workflow .github/workflows/ci.yml exécute npm ci, npm test, npm run typecheck et npm run build sous Node 22. Vérifier les résultats dans la pull request ; ne pas contourner ni désactiver les contrôles pour masquer un échec. La CI ne remplace pas les tests visuels. Garder les permissions minimales (contents: read), sans secret ni déploiement dans ce workflow.

## Git
Branche dédiée, commits explicites et pull request vers main. Ne pas fusionner ni déployer sans accord. Indiquer les tests réellement effectués et les limites. Aucun secret ou donnée personnelle dans Git.
