# Horloge Temps Réel & Horloge au Centième (Base 60 & Base 100)

Application Web interactive développée avec **React 19**, **Vite 7** et **Tailwind CSS 4**.
Elle permet de visualiser en temps réel l'heure normale (sexagésimale) et l'heure au centième (industrielle / décimale).
Exemple : **13h30 ➔ 13,50**.

Deux modes d'affichage :
- **Option A** : Duo d'horloges synchronisées (classique + centième côte à côte)
- **Option B** : Horloge centésimale dédiée (accès direct via `?view=option-b`)

---

## 🚀 Déploiement sur Vercel (en 1 clic)

Le projet contient un fichier **`vercel.json`** préconfiguré et un **`.npmrc`** qui autorisent explicitement le script postinstall d'esbuild (moteur de build de Vite) — ce qui évite tout avertissement `npm warn allow-scripts esbuild@0.27.7` avec npm 10+ sur Vercel.

### Méthode 1 : Via GitHub (recommandée)
1. Téléchargez le ZIP depuis le bouton violet « Télécharger ZIP » dans l'application.
2. Extrayez le dossier et poussez-le sur votre dépôt GitHub.
3. Rendez-vous sur [vercel.com/new](https://vercel.com/new) et importez le dépôt.
4. Vercel détecte automatiquement **Vite** et les paramètres de build. Cliquez sur **Deploy**.
5. En 30 secondes, votre site est en ligne.

### Méthode 2 : Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### Méthode 3 : Dossier dist/
```bash
npm install
npm run build
```
Glissez-déposez ensuite le dossier `dist/` dans [vercel.com/deploy](https://vercel.com/deploy).

---

## 🔧 Développement local

```bash
npm install
npm run dev
```
Ouvrez http://localhost:5173 dans votre navigateur.

---

## ⚙️ Configuration Node

Le fichier `.nvmrc` fixe la version **Node 20 LTS** recommandée.
Le fichier `.npmrc` contient `allow-scripts=esbuild` pour prévenir tout blocage du moteur de build de Vite sur Vercel.
