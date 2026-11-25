# AGENTS.md — Mon centième

## Mission
Application française, gratuite, statique : heures décimales, pointage et chronomètre. Préserver exactitude, simplicité et confidentialité. Ces règles couvrent tout le dépôt. Lire le README et CHANGELOG.md avant toute intervention.

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
- Cumul : (fin - début) + ajouts - pauses ; début seul = référence. Début saisissable en HH:MM[:SS] ou heures décimales (virgule/point), précision à la seconde. Le changement de mode doit conserver la seconde exacte (jusqu'à six décimales dans les champs d'édition) ; tous les résultats centésimaux du cumul sont affichés à deux décimales, sans arrondir les données métier. Fin toujours en HH:MM. Arrondir uniquement à l'affichage. Ne jamais copier un total connu invalide.
- Chaque ligne du cumul peut porter un départ facultatif indépendant du début de journée ; son heure de fin est le départ + la durée, en deux formats et avec indication des jours suivants. Exemple de régression obligatoire : Harmo, durée 2,70 h, départ 07:30 / 7,50, fin 10:12 / 10,20 ; départ modifiable depuis la ligne et depuis le formulaire. Les horaires de ligne déterminent des créneaux dérivés sans modifier la durée saisie : pauses fixes prioritaires, activité au départ le plus tardif prioritaire, égalité départagée par l'ordre des lignes. Reprendre le travail interrompu dans les créneaux libres ; ne pas dupliquer les entrées. Cas obligatoire Harmo 09:20 + 2,70 h avec pause 11:30–12:00 : 09:20–11:30 puis 12:00–12:32. Les pauses horodatées ne sont pas déduites une seconde fois du travail horodaté ; avec période de journée explicite, déduire uniquement leur union intersectée avec cette période. Sans période ni travail horodaté, conserver la déduction des pauses ; les pauses sans horaire restent déduites. Départs du même jour sauf journée explicitement nocturne.
- Paie : estimation brute, sans majorations ni règles conventionnelles implicites ; les périodes superposées sont additionnées.

## Confidentialité et interface
- Aucun compte, stockage persistant, traceur ou appel externe ajouté sans accord. Les saisies restent en mémoire vive. Ne pas promettre l'absence de journaux côté hébergeur.
- Polices système ; interface française, responsive, accessible au clavier et erreurs explicites. Ne pas inventer les coordonnées légales.

## Responsive et accessibilité
Le convertisseur affiche uniquement les heures et minutes, les centièmes à deux décimales et la copie ; aucun exemple ni détail de calcul permanent. Arrondir directement à la minute la plus proche pour la conversion inverse, y compris la retenue d'heure. Ne pas modifier la précision des autres modules.

Conserver un pied de page minimal (Mentions légales et Confidentialité sur une ligne), sans badges ni description redondante. Les autres informations légales restent accessibles dans le dialogue et l'aide/réglages dans l'en-tête.

Utiliser les media queries de largeur et de pointeur, pas le user-agent pour identifier un téléphone. Réagir aux changements de taille et de capacité tactile. Garder les cinq onglets accessibles sans défilement horizontal, les cibles tactiles d'au moins 44 px en hauteur, les champs tactiles à 16 px et le zoom activé. Prévoir une alternative clavier/tactile au glisser-déposer. Tester 320/360/390/430/768/1024/1440 px, orientation, clavier virtuel et dialogues. Respecter prefers-reduced-motion ; ne collecter aucune donnée d'appareil.

Les deux cadrans doivent rester côte à côte sur mobile (dès 320 px). Les lignes du cumul sont compactes par défaut ; ouvrir une seule édition à la fois, afficher les données essentielles hors édition et préserver les saisies lors du repli. Ne pas supprimer une fonctionnalité pour gagner de la place : accès via l'onglet ou l'éditeur dédié. La poignée de réorganisation du cumul reste visible hors édition, supporte le glisser tactile et souris, et donne accès aux flèches au clavier ou au toucher. Le déplacement conserve toutes les données et ne modifie pas les horaires manuels ; il départage les activités ayant le même départ.

## Vérifications
1. Node 22.18+ recommandé ; npm ci.
2. npm test (ajouter une régression à chaque modification métier), npm run typecheck, npm run build.
3. Vérifier les cinq onglets, les champs de départ par activité sur mobile et ordinateur, conservation des saisies, pauses, minuit, copies et chronomètre en navigation.
4. Actualiser CHANGELOG.md pour toute évolution significative, README et le manifeste statique de l'export ZIP à chaque ajout, renommage ou suppression de fichier ; conserver les imports ?raw explicites. Ne jamais annoncer un test réussi sans l'avoir exécuté.

## Intégration continue
Le workflow .github/workflows/ci.yml exécute npm ci, npm test, npm run typecheck et npm run build sous Node 22. Vérifier les résultats dans la pull request ; ne pas contourner ni désactiver les contrôles pour masquer un échec. La CI ne remplace pas les tests visuels. Garder les permissions minimales (contents: read), sans secret ni déploiement dans ce workflow.

## Git
Branche dédiée, commits explicites et pull request vers main. Ne pas fusionner ni déployer sans accord. Indiquer les tests réellement effectués et les limites. Aucun secret ou donnée personnelle dans Git.
