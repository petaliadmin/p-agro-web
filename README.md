# 🌾 Petalia Farm OS — Application de Supervision Agronomique

Application Angular 17 de gestion agronomique destinée aux superviseurs et directeurs
d'exploitation au **Sénégal et en Afrique de l'Ouest**.

---

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancement](#lancement)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Structure du projet](#structure-du-projet)
- [Pages disponibles](#pages-disponibles)
- [Stack technique](#stack-technique)
- [Données mock](#données-mock)
- [Branchement API NestJS](#branchement-api-nestjs)

---

## Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Angular CLI** 17 : `npm install -g @angular/cli@17`

---

## Installation

```bash
# Cloner / dézipper le projet
cd agroassist-web

# Installer les dépendances
npm install

# Vérifier que Angular CLI est disponible
ng version
```

---

## Lancement

```bash
# Démarrer le serveur de développement
npm start
# → http://localhost:4200

# Build de production
npm run build:prod
# → dist/agroassist-web/
```

---

## Comptes de démonstration

| Rôle        | Email                         | Mot de passe |
|-------------|-------------------------------|--------------|
| Directeur   | admin@agroassist.sn           | password     |
| Superviseur | superviseur@agroassist.sn     | password     |

---

## Structure du projet

```
src/
├── app/
│   ├── core/
│   │   ├── models/           ← interfaces TypeScript strictes
│   │   ├── services/         ← services mock (BehaviorSubject + delay)
│   │   ├── guards/           ← authGuard, loginGuard
│   │   └── interceptors/     ← authInterceptor (JWT fictif)
│   ├── shared/
│   │   ├── components/       ← StatCard, StatusChip, Avatar, etc.
│   │   ├── pipes/            ← dateLocale, hectare, statutCulture, fcfa
│   │   └── directives/       ← HighlightDirective
│   ├── features/
│   │   ├── auth/             ← /login
│   │   ├── dashboard/        ← /dashboard
│   │   ├── parcelles/        ← /parcelles, /parcelles/:id
│   │   ├── visites/          ← /visites, /visites/:id
│   │   ├── taches/           ← /taches (Kanban + Liste)
│   │   ├── equipes/          ← /equipes
│   │   ├── intrants/         ← /intrants
│   │   └── rapports/         ← /rapports
│   └── layout/
│       ├── sidebar/          ← navigation latérale (responsive)
│       ├── topbar/           ← barre supérieure + notifications
│       └── shell/            ← layout wrapper
├── assets/
│   └── mock-data/            ← données fictives TypeScript
└── environments/             ← config dev/prod + API endpoints
```

---

## Pages disponibles

| Route             | Description                                         |
|-------------------|-----------------------------------------------------|
| `/login`          | Authentification mock                               |
| `/dashboard`      | KPIs, graphiques, carte Leaflet, météo              |
| `/parcelles`      | Liste / grille / carte de toutes les parcelles      |
| `/parcelles/:id`  | Détail parcelle : infos, timeline visites           |
| `/visites`        | Liste des visites terrain                           |
| `/visites/:id`    | Détail visite : stepper, photos, recommandations    |
| `/taches`         | Kanban + Liste des tâches                           |
| `/equipes`        | Équipes, membres, scores de performance             |
| `/intrants`       | Stocks, alertes, historique mouvements              |
| `/rapports`       | KPIs, graphiques, top problèmes, export PDF (mock)  |

---

## Stack technique

| Couche        | Technologie                       |
|---------------|-----------------------------------|
| Framework     | Angular 17 Standalone Components  |
| Styles        | Tailwind CSS v3 + palette custom  |
| UI Components | Angular Material 17               |
| Graphiques    | Chart.js 4 (CDN)                  |
| Cartographie  | Leaflet.js (CDN)                  |
| State         | BehaviorSubject + RxJS            |
| Routing       | Angular Router + lazy loading     |
| Auth          | Mock guard + localStorage         |

---

## Données mock

Toutes les données sont fictives mais **réalistes** :

- **8 parcelles** réparties au Sénégal (Vallée du Fleuve, Casamance, Niayes, Bassin Arachidier)
- **6 visites** avec observations complètes, recommandations et photos placeholder
- **10 tâches** réparties en Kanban (Todo / En cours / Terminé / Reporté)
- **8 membres** d'équipe + 3 équipes avec scores de performance
- **8 intrants** avec historique mouvements + alertes automatiques
- **Noms sénégalais authentiques** : Mamadou Diallo, Fatou Sarr, Ibrahima Ba…
- **Coordonnées GPS réelles** dans les zones agricoles du Sénégal

---

## Branchement API NestJS

Pour connecter un backend NestJS réel :

1. **Modifier `environment.ts`** :
   ```ts
   mock: false,
   apiUrl: 'http://localhost:3000/api',
   ```

2. **Remplacer les services mock** par des appels HTTP :
   ```ts
   // Avant (mock)
   return of(MOCK_PARCELLES).pipe(delay(200));

   // Après (HTTP)
   return this.http.get<Parcelle[]>(`${environment.apiUrl}${API_ENDPOINTS.parcelles.base}`);
   ```

3. Tous les **endpoints sont déjà centralisés** dans `environment.ts` → `API_ENDPOINTS`

4. L'**intercepteur HTTP** `authInterceptor` injecte automatiquement le token Bearer

---

## Design System

- **Couleur principale** : `#1A7A4A` (vert Petalia Farm OS)
- **Police** : Plus Jakarta Sans (400, 500, 600, 700)
- **Breakpoints** : mobile < 768px · tablet 768-1279px · desktop ≥ 1280px
- **Sidebar** : 256px (desktop) → 64px icônes (tablet) → drawer (mobile)

---

## Licence

Projet Petalia Farm OS — Usage interne. Tous droits réservés.
