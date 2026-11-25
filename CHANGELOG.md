# Journal des modifications — Mon centième

Ce journal décrit les évolutions versionnées. Le statut de déploiement est à vérifier séparément sur Vercel.

## Optimisation smartphone et cumul — 25 novembre 2026

- Convertisseur simplifié : heures et minutes côte à côte, suppression des secondes, exemples et explications permanentes, résultat et copie compacts ; conversion inverse arrondie à la minute la plus proche avec tests de retenue.

- Pied de page minimal : deux liens juridiques, suppression des badges et descriptions redondantes, réduction des marges ; toutes les informations restent accessibles.

- Cumul : affichage centésimal à deux décimales (ajustement après retour utilisateur), précision interne conservée. Découpage automatique des activités en conflit (pauses prioritaires puis départ le plus tardif), reprise dans les créneaux libres, copie des segments et absence de double déduction des pauses horodatées. Régression Harmo 09:20–11:30 puis 12:00–12:32.
- Réorganisation directement dans les lignes compactes du cumul : poignée tactile pour glisser, flèches à la demande, glisser-déposer souris conservé. Test de régression sur le déplacement de pause, sans modification du total ni des horaires.
- Densité mobile revue après retour utilisateur : deux cadrans côte à côte, lecture numérique compacte ; cumul en mode lecture avec édition à la demande, horaires de journée et ajout repliables. Les données et calculs restent identiques.
- Détection réactive de la largeur, du pointeur principal et de la préférence de mouvement, sans identification du navigateur ni transmission de données.
- En-tête compact, cinq onglets visibles sans défilement horizontal, zones tactiles agrandies, champs à 16 px et clavier décimal.
- Cartes cumul plus compactes, réorganisation par flèches accessible sur téléphone et ordinateur, cadrans redimensionnables, pointage et dialogues adaptés.
- Le glisser-déposer reste disponible sur pointeur fin ; la conservation des saisies en mémoire reste inchangée.

### Validation et traçabilité
- `a3012be` : adaptation responsive et tactile.
- `f304362` : cadrans côte à côte et édition à la demande.
- `f2a0c2d` : déplacement des activités et pauses depuis la vue compacte.
- `cf7a568` : découpage des activités en conflit.
- `4af7730` : affichage centésimal à deux décimales.
- `791f8cc` : pied de page minimal.
- `bef0c2a` : convertisseur compact.
- [CI complète réussie](https://github.com/iBob78/moncentieme/actions/runs/45595020071) pour `bef0c2a6c7c3c581c68e52e2285c21751d32a65c` : installation, tests, TypeScript, build et vérification de la sortie.
- [Preview Vercel réussie](https://vercel.com/moncentieme/moncentieme/8Ky8T6wmPZyWvrnA25h6hRbcGMWi). Le propriétaire a accepté la version et autorisé sa fusion le 25 novembre 2026.
- [Pull request nº2](https://github.com/iBob78/moncentieme/pull/2). Les essais visuels exhaustifs sur appareils réels, l'export ZIP en exécution, les mentions légales et la protection de main restent à vérifier. Les contrôles après fusion sont consultables dans Actions et Vercel.

## Maintenance — 25 novembre 2026

### Corrections métier
- Cumul : départ facultatif par activité ou pause, saisissable lors de l'ajout ou après, en heure normale ou centième ; fin calculée dans les deux unités avec indication de passage de minuit. Le total de durée reste inchangé. Régression Harmo : 2,70 h à 07:30 finit à 10:12.
- Cumul : choix du format du début de journée (heure normale ou centième), conversion réversible à la seconde, affichage de l'équivalence et des secondes utiles dans les résultats. Tests des limites et du passage de minuit.
- Centralisation de la validation des heures, durées et nombres décimaux dans src/utils/timeCalculations.ts.
- Refus des valeurs négatives, non finies et malformées ; prise en charge des séparateurs virgule et point.
- Correction du cumul : une durée éditée est immédiatement répercutée dans le total. Les changements d'unité préservent la valeur valide.
- Validation des horaires, du passage à minuit et du taux horaire ; avertissements pour les saisies invalides et les pauses supérieures à la durée disponible.
- Désactivation de la copie de résultats connus invalides ; arrondi à l'affichage.

### Interface et confidentialité
- Conservation des saisies en mémoire lors de la navigation entre les cinq onglets ; le rechargement les efface.
- Rafraîchissement de l'horloge à la seconde hors cadrans fluides, au lieu d'une mise à jour à chaque image.
- Suppression des appels Google Fonts ; utilisation des polices système.
- Clarification de la politique de confidentialité : l'hébergement peut traiter des données de connexion.
- Conservation et documentation des modules historiques non exposés dans la navigation.

### Maintenance
- Ajout d'AGENTS.md : architecture, invariants métier, confidentialité, tests et processus Git.
- Enrichissement du README : installation, fonctionnalités, formules, limites, déploiement et CI.
- Ajout de .gitignore et des tests unitaires node:test.
- Synchronisation du manifeste statique d'export ZIP avec les sources versionnées.
- Ajout du workflow .github/workflows/ci.yml sous Node.js 22 : installation npm ci, tests, TypeScript, build et vérification de dist/index.html.

### Vérifications réalisées
Première exécution GitHub Actions confirmée réussie pour le commit `08a0fb34600d20a8edc2ec4758cfb9d0b670059e` : toutes les étapes du job « Tests, TypeScript et build » ont réussi.

Rapport : https://github.com/iBob78/moncentieme/actions/runs/45576478244

Contrôle de la fonctionnalité finale : commit `2e7675f11f680b955c912f4dddf27c3395659972`, [GitHub Actions](https://github.com/iBob78/moncentieme/actions/runs/45582479366) réussi pour npm ci, tests, TypeScript, build et sortie dist/index.html. [Preview Vercel](https://vercel.com/moncentieme/moncentieme/85BpXawftuQjT1VZHB5QcpyEEdRk) réussie. Le propriétaire a accepté la fonctionnalité de départ par activité le 25 novembre 2026 et autorisé la fusion.

Ces preuves concernent les commits indiqués ; les commits suivants doivent être contrôlés à nouveau. L'acceptation utilisateur concerne le cumul, pas un audit visuel exhaustif ni un audit de sécurité.

### Vérifications et améliorations restant ouvertes
- Compléter les tests manuels des cinq onglets sur ordinateur et mobile, notamment navigation, chronomètre, copies et export ZIP (module historique). Le cumul par activité a été accepté par le propriétaire.
- Renseigner les coordonnées légales de l'éditeur et de l'hébergeur et vérifier les traitements techniques d'hébergement.
- Configurer, si souhaité, une protection de main exigeant la réussite du job de qualité ; le workflow seul ne bloque pas une fusion.
- Vérifier la prévisualisation et le déploiement Vercel après autorisation de fusion.

### Traçabilité
- `3ba0fe4` : fiabilisation et documentation.
- `56f64cc` : manifeste ZIP statique.
- `08a0fb3` : intégration continue et documentation.
- `c675f56` : documentation de la première CI réussie.
- `0e9ffbc` : départ de journée dans les deux unités.
- `2e7675f` : départ indépendant par activité et fin automatique.
- Pull request : https://github.com/iBob78/moncentieme/pull/1

## Historique initial
- 30 août 2026 : création de l'application et configuration Vercel.
- 4 septembre 2026 : évolution du cumul, ajout des mentions légales et métadonnées.
- 5 septembre 2026 : mise à jour du cumul et des fonctions de conversion (`267738d`).
