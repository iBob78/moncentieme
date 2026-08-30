# Horloge Temps Réel & Horloge au Centième (Base 60 & Base 100)

Application Web interactive développée avec **React**, **Vite** et **Tailwind CSS**.
Elle permet de visualiser l'heure normale (sexagésimale) et l'heure au centième (industrielle/décimale) en temps réel.
Exemple : **13h30 ➔ 13,50**.

---

## 🚀 Déploiement sur Vercel (100% Compatible)

Vous pouvez déployer ce projet sur **Vercel** de trois manières très simples :

### Méthode 1 : Via GitHub (Recommandé)
1. Poussez ce projet sur votre compte GitHub / GitLab / Bitbucket.
2. Rendez-vous sur [vercel.com/new](https://vercel.com/new).
3. Importez votre dépôt. Vercel détecte automatiquement la configuration **Vite** grâce au fichier `vercel.json` inclus.
4. Cliquez sur **Deploy**. En 30 secondes, votre site est en ligne avec HTTPS et actualisations automatiques.

### Méthode 2 : En ligne de commande avec Vercel CLI
Ouvrez votre terminal dans le dossier du projet et lancez :
```bash
npx vercel --prod
```
Suivez les quelques instructions à l'écran, le déploiement est immédiat.

### Méthode 3 : Glisser-déposer du dossier `dist/`
1. Générez le dossier de production :
   ```bash
   npm run build
   ```
2. Rendez-vous sur le tableau de bord Vercel ([vercel.com/deploy](https://vercel.com/deploy)).
3. Glissez-déposez directement le dossier `dist/` dans l'interface.

---

## 🧭 Affichage direct de l'Option B sur Vercel

Le projet intègre :
- **Option A** : Vue double synchronisée (Horloge classique & Horloge au centième côte à côte).
- **Option B** : Vue dédiée exclusive **Horloge au Centième seule** (avec grand cadran industriel, format RH / paie et pointage).

Pour que le site s'ouvre directement sur l'**Option B**, ajoutez simplement le paramètre dans l'URL :
```
https://votre-projet.vercel.app/?view=option-b
```
Un sélecteur en haut de la page permet également de basculer entre l'Option A et l'Option B en un seul clic !
