# Todo Frontend — Next.js

Interface web pour la gestion d'une liste de tâches (todo list). Service frontend du projet **Todo Docker** (devoir Docker).

> **Repo backend associé :** [`todo-backend`](../todo-backend) — NestJS + Prisma + MySQL.

---

## 🛠️ Stack technique

| Couche | Technologie | Version cible |
|---|---|---|
| Runtime | Node.js | `20-alpine` |
| Framework | Next.js | `^14` (App Router, `output: standalone`) |
| Langage | TypeScript | `^5` |
| Conteneurisation | Docker (multi-stage) | — |

---

## 📁 Structure du projet

```
todo-frontend/
├── src/
│   ├── app/               # App Router (pages, layouts)
│   │   ├── page.tsx       # Page d'accueil — liste des todos
│   │   └── layout.tsx
│   └── components/        # Composants réutilisables
├── public/                # Assets statiques
├── Dockerfile             # Multi-stage (deps → builder → runner)
├── .dockerignore
├── .env.example
├── next.config.mjs        # output: 'standalone'
└── README.md
```

---

## 🚀 Démarrage rapide (Docker)

> Le `docker-compose.yml` est dans le repo **`todo-backend`**. Le frontend est lancé depuis là via build context `../todo-frontend`.

### Pré-requis
- Docker `>= 24`
- docker-compose `>= 2.20`
- Repo `todo-backend` cloné **à côté** de ce repo (même dossier parent).

### Lancement
Depuis le dossier `todo-backend/` :
```bash
docker compose up --build
```

Frontend accessible sur `http://localhost:3000`.

---

## 💻 Démarrage local (sans Docker)

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer .env (URL du backend)
cp .env.example .env

# 3. Lancer en dev
npm run dev
```

App disponible sur `http://localhost:3000`.

> ⚠️ Le backend doit tourner sur `http://localhost:4000` (voir [`todo-backend`](../todo-backend)).

---

## 🐳 Architecture Docker

### Image frontend (Dockerfile multi-stage)

| Stage | Rôle |
|---|---|
| `deps` | Installe uniquement les dépendances (`npm ci`) — couche cachée tant que `package*.json` ne change pas. |
| `builder` | Copie le code + deps, lance `npm run build`. Génère `.next/standalone/` grâce à `output: 'standalone'`. |
| `runner` | Image minimale (`node:20-alpine`), utilisateur non-root, copie uniquement le **standalone server**, `public/` et `.next/static/`. Lance `node server.js`. |

### Pourquoi `output: 'standalone'` ?

Next.js trace les fichiers réellement utilisés et copie un sous-ensemble minimal de `node_modules` dans `.next/standalone/`. Image finale **~10x plus légère** qu'une image qui embarque tout `node_modules`.

---

## 🌿 Conventions Git

### Branches

- `main` → branche stable, code mergé uniquement après validation.
- Une branche **par fonctionnalité** : `feat/<nom-court>`
  - Exemple : `feat/todo-list-ui`, `feat/todo-form`

### Commits — Conventional Commits

Format standard :
```
<type>(<scope>): <description courte>

[corps optionnel]
[footer optionnel — ex: BREAKING CHANGE ou références issue]
```

| Type | Usage | Exemple |
|---|---|---|
| `feat` | Nouvelle fonctionnalité | `feat(ui): add todo list page` |
| `fix` | Correction de bug | `fix(form): prevent empty submit` |
| `refactor` | Refactor sans changement de comportement | `refactor(api): extract fetch wrapper` |
| `test` | Ajout/modif de tests | `test(todo-item): add render tests` |
| `docs` | Documentation | `docs(readme): add docker steps` |
| `chore` | Maintenance (deps, config) | `chore(deps): bump next to 14.2` |
| `ci` | Pipeline CI/CD | `ci: add typecheck job` |
| `perf` | Performance | `perf(image): use next/image lazy` |

---

## 🔐 Variables d'environnement

Voir [`.env.example`](./.env.example).

| Variable | Description | Exemple |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL du backend NestJS (exposé au navigateur) | `http://localhost:4000` |
| `API_URL_INTERNAL` | URL du backend depuis le container Next.js (réseau Docker) | `http://backend:4000` |

> 💡 **Pourquoi 2 URLs ?** Le navigateur tourne sur l'hôte → utilise `localhost:4000`. Mais les Server Components Next.js tournent dans le container `frontend` du réseau Docker → doivent utiliser le nom de service `backend:4000`.

---

## 📝 Licence

Projet pédagogique — usage libre.
