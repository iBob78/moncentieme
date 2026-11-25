# Journal des modifications — Mon centième

Les changements ci-dessous décrivent la branche de maintenance en cours, et non une version déjà déployée.

## En préparation — 25 novembre 2026

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

Cette preuve concerne ce commit précis ; tout commit suivant doit être contrôlé à nouveau. La CI ne constitue pas une validation visuelle ni un audit de sécurité.

### Restes à faire avant publication
- Tester manuellement les cinq onglets sur ordinateur et mobile, notamment la modification des durées, la navigation, le chronomètre, les copies et l'export ZIP (module historique).
- Renseigner les coordonnées légales de l'éditeur et de l'hébergeur et vérifier les traitements techniques d'hébergement.
- Configurer, si souhaité, une protection de main exigeant la réussite du job de qualité ; le workflow seul ne bloque pas une fusion.
- Vérifier la prévisualisation et le déploiement Vercel après autorisation de fusion.

### Traçabilité
- `3ba0fe4` : fiabilisation et documentation.
- `56f64cc` : manifeste ZIP statique.
- `08a0fb3` : intégration continue et documentation.
- Pull request : https://github.com/iBob78/moncentieme/pull/1

## Historique initial
- 30 août 2026 : création de l'application et configuration Vercel.
- 4 septembre 2026 : évolution du cumul, ajout des mentions légales et métadonnées.
- 5 septembre 2026 : mise à jour du cumul et des fonctions de conversion (`267738d`).
