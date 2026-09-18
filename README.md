# Mon Portfolio — AdonisJS

> **Ancienne version de mon portfolio**, construite pendant mon apprentissage d'**AdonisJS** (2025).
> Aujourd'hui remplacée par [mon_potfolio](https://github.com/samsteeven/mon_potfolio) (Next.js 16 + Fumadocs MDX).

## Fonctionnalités

- **Portfolio public** : page d'accueil, projets (détail par slug), technologies, compétences, services.
- **Blog** : articles, tags, publication programmée, notifications admin.
- **Guestbook / commentaires** : commentaires par visiteurs authentifiés.
- **OAuth** : connexion via GitHub et Google (Adonis Ally).
- **Newsletter** : inscription / désinscription, envoi d'emails.
- **Demandes de contact** : formulaire + gestion admin.
- **Admin** : dashboard, gestion des projets, skills, technologies, articles, tags, FAQ, utilisateurs, newsletters, demandes de contact.
- **CV** : composant d'upload avec preview et drag-and-drop.
- **Cache portfolio** : système de cache avec invalidation automatique (Technology, Skill, Project, BlogPost, User) et commandes de maintenance.

## Stack technique

| Couche | Techno |
|---|---|
| Backend | **AdonisJS 6** (Core, Lucid ORM, Auth, Ally, Bouncer, Cache, Limiter, Mail, Redis, Session, Shield, Static, Vite) |
| Frontend | **Inertia.js + React**, HeroUI, Tailwind CSS, Framer Motion / GSAP |
| Base de données | **MySQL** (ou SQLite en option) |
| Queues | **BullMQ** (`@rlanz/bull-queue`) |
| Emails | Edge.js (`@adonisjs/mail`) |
| Tests | **Japa** (`@japa/runner`, `@japa/plugin-adonisjs`, `@japa/assert`) |

## Prérequis

- Node.js (version LTS récente)
- MySQL (ou utiliser SQLite)

## Installation

```bash
npm install
cp .env.example .env   # puis renseigner DB, APP_KEY, etc.
node ace migration:run
npm run dev            # http://localhost:3333
```

Générer la clé si besoin :

```bash
node ace generate:key
```

## Commandes utiles

```bash
npm run dev         # serveur de dev (HMR)
npm run build       # build de production
npm run start       # démarrage en production
npm run test        # tests Japa
npm run lint        # ESLint
npm run format      # Prettier
npm run typecheck   # tsc --noEmit
```

### Cache portfolio

```bash
node ace cache:portfolio:clear     # vider le cache
node ace cache:portfolio:refresh   # recharger depuis la BDD
node ace cache:portfolio:status    # état du cache
```

## Structure

```
app/
  controllers/        # Contrôleurs (public + admin)
  models/             # Modèles Lucid
  services/           # Services métier
inertia/              # Pages React (Inertia)
start/                # Routes, kernel, limiter, env
resources/views/      # Templates Edge (emails…)
tests/                # Tests fonctionnels (Japa)
```