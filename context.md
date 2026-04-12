# PROMPT — AgroAssist Web Angular + Tailwind
# Application de supervision agronomique avec données mock
# Sénégal & Afrique de l'Ouest


════════════════════════════════════════════════════════════
SECTION 01 — CONTEXTE & RÔLE
════════════════════════════════════════════════════════════

Tu es un développeur Angular senior expert en applications AgriTech.
Tu vas construire la version web d'AgroAssist, une application de gestion agronomique
destinée aux superviseurs et directeurs d'exploitation au Sénégal et en Afrique de l'Ouest.

Cette interface web est le tableau de bord de supervision : les techniciens utilisent
l'app mobile Flutter ; les managers utilisent cette web app pour piloter, planifier
et analyser à distance.

Toutes les données sont en MOCK (JSON statique ou services Angular avec données fictives
en dur). Aucun appel HTTP réel — architecture prête pour branchement API NestJS ultérieur.


════════════════════════════════════════════════════════════
SECTION 02 — STACK TECHNIQUE EXACTE
════════════════════════════════════════════════════════════

- Angular 17 avec Standalone Components (pas de NgModule)
- Tailwind CSS v3 configuré dans tailwind.config.js avec palette AgroAssist custom
- Angular Material 17 pour les composants de base (mat-table, mat-dialog, mat-snackbar)
- Chart.js via ng2-charts pour les graphiques (rendement, intrants, activité)
- Leaflet.js pour la carte interactive des parcelles
- Services Angular avec données mock retournées via Observable.of() ou BehaviorSubject
- Interfaces TypeScript strictes pour toutes les entités métier
- Routing Angular avec lazy loading par feature module
- Guards d'authentification (mock — rôle stocké en localStorage)
- Responsive design : desktop-first, breakpoints md/lg/xl Tailwind


════════════════════════════════════════════════════════════
SECTION 03 — STRUCTURE DU PROJET
════════════════════════════════════════════════════════════

src/
├── app/
│   ├── core/
│   │   ├── models/           ← interfaces TypeScript (Parcelle, Visite, Tache, Intrant, Equipe, User)
│   │   ├── services/         ← services mock (parcelle.service.ts, visite.service.ts, etc.)
│   │   ├── guards/           ← auth.guard.ts (mock)
│   │   └── interceptors/     ← auth.interceptor.ts (injecte token JWT fictif)
│   ├── shared/
│   │   ├── components/       ← stat-card, alert-badge, avatar, status-chip, data-table
│   │   ├── pipes/            ← date-locale.pipe, hectare.pipe, statut-culture.pipe
│   │   └── directives/       ← highlight.directive
│   ├── features/
│   │   ├── auth/             ← login page (mock credentials)
│   │   ├── dashboard/        ← page d'accueil superviseur
│   │   ├── parcelles/        ← liste + détail parcelle + carte
│   │   ├── visites/          ← liste visites + détail visite stepper (lecture)
│   │   ├── taches/           ← kanban + calendrier tâches
│   │   ├── equipes/          ← gestion membres + planning équipe
│   │   ├── intrants/         ← stock + traçabilité + consommation
│   │   └── rapports/         ← KPIs + graphiques + export PDF fictif
│   ├── layout/
│   │   ├── sidebar/          ← navigation latérale avec rôle affiché
│   │   ├── topbar/           ← barre supérieure : recherche, notifs, profil
│   │   └── shell/            ← layout wrapper (sidebar + topbar + router-outlet)
│   └── app.routes.ts         ← routing racine lazy
├── assets/
│   ├── mock-data/            ← fichiers JSON mock (parcelles.json, visites.json, etc.)
│   └── images/
├── styles/
│   ├── tailwind.css          ← @tailwind base/components/utilities
│   └── theme.scss            ← variables Angular Material + couleurs custom
└── tailwind.config.js


════════════════════════════════════════════════════════════
SECTION 04 — DONNÉES MOCK — ENTITÉS & INTERFACES
════════════════════════════════════════════════════════════

// models/parcelle.model.ts
export interface Parcelle {
  id: string;
  code: string;                     // ex: "PAR-2024-001"
  nom: string;
  superficie: number;               // en hectares
  culture: 'riz' | 'mais' | 'mil' | 'arachide' | 'oignon' | 'tomate';
  stade: 'semis' | 'levee' | 'tallage' | 'floraison' | 'maturation' | 'recolte';
  statut: 'sain' | 'attention' | 'urgent' | 'recolte';
  technicienId: string;
  producteurNom: string;
  coordonnees: { lat: number; lng: number };
  zone: string;                     // ex: "Vallée du Fleuve"
  typesSol: string;
  derniereVisite: Date;
  prochaineVisite: Date;
  rendementPrecedent: number;       // t/ha
  createdAt: Date;
}

// models/visite.model.ts
export interface Visite {
  id: string;
  parcelleId: string;
  technicienId: string;
  date: Date;
  statut: 'planifiee' | 'en_cours' | 'completee';
  etapeActuelle: 1 | 2 | 3 | 4 | 5 | 6;
  observations: {
    croissance: 'excellente' | 'normale' | 'faible';
    couleurFeuilles: 'verte' | 'jaunissante' | 'brunissante';
    maladiesDetectees: string[];
    ravageursDetectes: string[];
    stressHydrique: boolean;
    hauteurPlantes: number;         // en cm
    tauxCouverture: number;         // en %
  };
  sol: { humidite: 'sec' | 'normal' | 'humide'; ph: number; drainage: 'bon' | 'moyen' | 'mauvais'; };
  irrigation: { type: string; probleme: string | null; };
  recommandations: Recommandation[];
  photos: string[];                 // URLs fictives
  rapport: string | null;
  duree: number;                    // en minutes
}

// models/tache.model.ts
export interface Tache {
  id: string;
  titre: string;
  type: 'semis' | 'irrigation' | 'traitement' | 'fertilisation' | 'desherbage' | 'recolte' | 'inspection';
  priorite: 'urgent' | 'haute' | 'normale' | 'basse';
  statut: 'todo' | 'en_cours' | 'done' | 'reporte';
  parcelleId: string;
  equipeId: string;
  dateDebut: Date;
  dateFin: Date;
  description: string;
  ressources: string[];
  completionPct: number;
}

// models/intrant.model.ts
export interface Intrant {
  id: string;
  nom: string;
  type: 'semence' | 'engrais' | 'pesticide' | 'herbicide' | 'fongicide';
  quantiteStock: number;
  unite: 'kg' | 'L' | 'sac';
  seuilAlerte: number;
  dateExpiration: Date;
  fournisseur: string;
  prixUnitaire: number;             // en FCFA
  mouvements: MouvementIntrant[];
}

// models/membre.model.ts
export interface Membre {
  id: string;
  nom: string;
  prenom: string;
  role: 'technicien' | 'chef_equipe' | 'ouvrier' | 'applicateur';
  equipeId: string;
  telephone: string;
  disponible: boolean;
  tachesEnCours: number;
  performanceScore: number;         // 0-100
  avatar?: string;
}


════════════════════════════════════════════════════════════
SECTION 05 — PAGES & ROUTES
════════════════════════════════════════════════════════════

PAGE /login
- Formulaire email + mot de passe (mock credentials : admin@agroassist.sn / password)
- Logo AgroAssist + illustration agricole SVG
- Redirection vers /dashboard après "authentification"
- Stockage rôle dans localStorage

PAGE /dashboard  [HOME]
- KPI cards (4) : Parcelles actives, Visites du jour, Tâches urgentes, Alertes intrants
- Graphique "Activité semaine" (bar chart - visites par jour)
- Graphique "État des cultures" (donut - répartition par statut)
- Tableau "Parcelles à risque" (3-5 lignes, statut urgent/attention)
- Feed "Dernières visites" (liste chronologique, 5 éléments)
- Widget météo mock (ville + température + icône + prévisions 3 jours)
- Carte Leaflet mini (parcelles géolocalisées, clic → ouvre détail)

PAGE /parcelles
- Header avec stats (total ha, cultures actives, visites planifiées)
- Filtres : zone, culture, statut, technicien (dropdowns Tailwind)
- Toggle vue : liste table | carte Leaflet | cards grille
- Table : colonnes Code, Nom, Superficie, Culture, Statut, Technicien, Dernière visite, Actions
- Statut avec badge coloré (🟢 sain / 🟡 attention / 🔴 urgent)
- Bouton "Nouvelle parcelle" → modal formulaire mock

PAGE /parcelles/:id
- Header : nom parcelle + badge statut + boutons Éditer/Nouvelle visite
- Section info : carte Leaflet zoomée, superficie, sol, producteur, zone
- Timeline visites (liste chronologique des visites de cette parcelle)
- Graphique évolution rendement (line chart multi-saisons)
- Historique intrants utilisés (table)
- Prochaine visite planifiée + technicien assigné

PAGE /visites
- Filtres : date range, technicien, parcelle, statut
- Table : Parcelle, Technicien, Date, Durée, Statut, Problèmes détectés, Actions
- Ligne cliquable → /visites/:id

PAGE /visites/:id
- Stepper lecture seule (6 étapes) avec données collectées
- Photos de visite (grille images mock avec placeholder)
- Recommandations émises (cards avec type + description)
- Bouton "Télécharger rapport PDF" (déclenche toast mock)

PAGE /taches
- Onglets : Kanban | Calendrier | Liste
- Kanban : 4 colonnes (À faire / En cours / Terminé / Reporté)
- Cards tâches : titre, type icon, priorité badge, parcelle, échéance, assigné
- Drag & drop simulé (update statut en mock via service)
- Filtres : priorité, type, équipe, date

PAGE /equipes
- Liste des équipes avec membres + performance score
- Pour chaque équipe : chef, nb membres, zone couverte, tâches en cours
- Planning semaine (grille jours × membres)
- Stats individuelles membres (table)

PAGE /intrants
- Dashboard stock : cards par type (semences, engrais, pesticides)
- Alertes automatiques (stock bas = badge rouge, expiration proche = badge orange)
- Table stocks avec barre de progression quantité/seuil
- Historique mouvements (entrées/sorties) avec filtres
- Graphique consommation par type sur 30 jours

PAGE /rapports
- Sélecteur période (semaine/mois/saison)
- KPIs synthèse : visites réalisées, ha couverts, tâches closes, coût intrants
- Graphiques : rendement moyen par culture, top 5 problèmes détectés,
  efficacité équipes, consommation intrants vs budget
- Bouton "Générer rapport PDF" (toast mock)


════════════════════════════════════════════════════════════
SECTION 06 — DESIGN SYSTEM & TAILWIND CONFIG
════════════════════════════════════════════════════════════

// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E8F5EE',
          100: '#C5E6D3',
          200: '#8FCCA9',
          400: '#2D9E64',
          600: '#1A7A4A',   // ← couleur principale AgroAssist
          800: '#0F4D2E',
          900: '#072918',
        },
        secondary: {
          400: '#0D6B5E',
          600: '#085048',
        },
        warning: {
          400: '#F5A623',
          100: '#FEF6E4',
        },
        danger: {
          400: '#DC2626',
          100: '#FEF2F2',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

DESIGN TOKENS À APPLIQUER SYSTÉMATIQUEMENT :
- Sidebar : bg-primary-600, texte blanc, width 256px fixe
- Topbar : bg-white, border-b, shadow-sm, height 64px
- Cards : bg-white, rounded-xl, shadow-sm, border border-gray-100
- Badges statut : rounded-full, text-xs, font-medium, padding px-2.5 py-0.5
  · sain     → bg-green-100 text-green-800
  · attention → bg-yellow-100 text-yellow-800
  · urgent   → bg-red-100 text-red-800
  · planifie → bg-blue-100 text-blue-800
- Bouton primaire : bg-primary-600 hover:bg-primary-800 text-white rounded-lg
- Bouton secondaire : bg-white border border-gray-200 hover:bg-gray-50
- Tables : thead bg-gray-50, tr hover:bg-gray-50, border-b border-gray-100
- KPI Card : grande valeur font-bold text-2xl text-gray-900,
             label text-sm text-gray-500, tendance colorée (↑ vert / ↓ rouge)

TYPOGRAPHIE :
- Importer depuis Google Fonts : Plus Jakarta Sans (400, 500, 600, 700)
- Titres de page : text-2xl font-semibold text-gray-900
- Sous-titres section : text-sm font-medium text-gray-500 uppercase tracking-wider
- Corps : text-sm text-gray-700, line-height relaxed


════════════════════════════════════════════════════════════
SECTION 07 — SERVICES MOCK — PATTERN À SUIVRE
════════════════════════════════════════════════════════════

// PATTERN OBLIGATOIRE pour tous les services mock
// core/services/parcelle.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, delay } from 'rxjs';
import { Parcelle } from '../models/parcelle.model';
import { MOCK_PARCELLES } from '../../../assets/mock-data/parcelles.mock';

@Injectable({ providedIn: 'root' })
export class ParcelleService {
  private parcelles$ = new BehaviorSubject(MOCK_PARCELLES);

  getAll(): Observable {
    return this.parcelles$.asObservable().pipe(delay(200)); // simule latence API
  }

  getById(id: string): Observable {
    return of(MOCK_PARCELLES.find(p => p.id === id)).pipe(delay(150));
  }

  getByStatut(statut: string): Observable {
    return of(MOCK_PARCELLES.filter(p => p.statut === statut)).pipe(delay(150));
  }

  update(id: string, changes: Partial): Observable {
    const current = this.parcelles$.value;
    const idx = current.findIndex(p => p.id === id);
    const updated = { ...current[idx], ...changes };
    const newList = [...current];
    newList[idx] = updated;
    this.parcelles$.next(newList);
    return of(updated).pipe(delay(300));
  }

  getStats(): Observable<{ total: number; urgentes: number; totalHa: number }> {
    const p = MOCK_PARCELLES;
    return of({
      total: p.length,
      urgentes: p.filter(x => x.statut === 'urgent').length,
      totalHa: p.reduce((sum, x) => sum + x.superficie, 0)
    }).pipe(delay(100));
  }
}

// Créer le même pattern pour :
// VisiteService, TacheService, IntrantService, EquipeService,
// MembreService, RapportService, NotificationService, MeteoService


════════════════════════════════════════════════════════════
SECTION 08 — COMPOSANTS PARTAGÉS À CRÉER
════════════════════════════════════════════════════════════

// shared/components/ — chaque composant est Standalone

StatCardComponent
  @Input() label: string
  @Input() value: string | number
  @Input() trend?: { value: number; direction: 'up' | 'down' }
  @Input() icon?: string            // nom icône Material
  @Input() color?: 'green' | 'red' | 'yellow' | 'blue'
  → Template : card blanche, icône cercle coloré, valeur large, label muted, badge tendance

StatusChipComponent
  @Input() statut: 'sain' | 'attention' | 'urgent' | 'planifie' | 'done'
  → Badge pill avec couleur sémantique Tailwind

AvatarComponent
  @Input() nom: string
  @Input() prenom: string
  @Input() size?: 'sm' | 'md' | 'lg'
  → Cercle coloré avec initiales (couleur basée sur hash du nom)

DataTableComponent
  @Input() columns: TableColumn[]   // { key, label, type: 'text'|'badge'|'date'|'number'|'actions' }
  @Input() data: T[]
  @Input() loading: boolean
  @Output() rowClick: EventEmitter
  → Table Material avec tri, pagination, skeleton loader

AlertBadgeComponent
  @Input() count: number
  @Input() type: 'danger' | 'warning'
  → Pastille numérotée rouge/orange

LoadingSkeletonComponent
  @Input() rows: number
  → Lignes grises animées (shimmer effect Tailwind)

EmptyStateComponent
  @Input() icon: string
  @Input() title: string
  @Input() subtitle: string
  @Input() actionLabel?: string
  @Output() actionClick: EventEmitter
  → Illustration + texte centré pour listes vides

PageHeaderComponent
  @Input() title: string
  @Input() subtitle?: string
  @Input() breadcrumbs?: Breadcrumb[]
  → Header de page avec fil d'ariane


════════════════════════════════════════════════════════════
SECTION 09 — CONTRAINTES UX & QUALITÉ
════════════════════════════════════════════════════════════

CONTRAINTES OBLIGATOIRES :

1. RESPONSIVE
   - Desktop 1280px+ : sidebar fixe + contenu
   - Tablet 768-1279px : sidebar collapsible (icônes seules)
   - Mobile <768px : sidebar en drawer (hamburger menu)

2. ÉTATS DE CHARGEMENT
   - Skeleton loaders sur toutes les tables et listes (pas de spinner simple)
   - Délai simulé de 200-400ms sur tous les appels service (pipe delay())
   - Toast notifications (snackbar Material) sur toutes les actions

3. ACCESSIBILITÉ
   - aria-label sur tous les boutons iconiques
   - Role et aria-live sur les zones de statut
   - Focus visible sur tous les éléments interactifs
   - Contraste minimal 4.5:1 pour tout texte

4. PERFORMANCE
   - Lazy loading strict par feature (loadComponent / loadChildren)
   - OnPush ChangeDetection sur tous les composants
   - TrackBy sur tous les *ngFor
   - Pipes purs pour les transformations

5. COHÉRENCE DONNÉES MOCK
   - Les IDs sont cohérents entre entités (parcelleId dans Visite correspond à une Parcelle)
   - Les dates sont réalistes (campagne agricole 2024-2025, hivernage juillet-octobre)
   - Les noms sont sénégalais authentiques (Mamadou Diallo, Fatou Sarr, Ibrahima Ba...)
   - Les coordonnées GPS correspondent à des zones agricoles réelles au Sénégal
     (Vallée du Fleuve Sénégal : 15.5°N 14.8°W / Casamance : 12.5°N 15.5°W / Thiès : 14.8°N 16.9°W)

6. ARCHITECTURE PRÉPARÉE POUR API
   - Chaque service a une interface IService avec les méthodes CRUD standard
   - Les URLs d'API sont centralisées dans environment.ts (même si pas utilisées)
   - Les DTOs mock respectent le format JSON que retournera NestJS
   - HttpClient importé mais utilisé avec HttpClientTestingModule


════════════════════════════════════════════════════════════
SECTION 10 — ORDRE DE GÉNÉRATION RECOMMANDÉ
════════════════════════════════════════════════════════════

Génère dans cet ordre pour un résultat cohérent et testable :

ÉTAPE 1 — Fondations
  ├── tailwind.config.js + styles/tailwind.css
  ├── Toutes les interfaces TypeScript (models/)
  ├── Tous les fichiers mock data (assets/mock-data/*.mock.ts)
  └── Tous les services mock (core/services/)

ÉTAPE 2 — Layout Shell
  ├── SidebarComponent (navigation + rôle utilisateur)
  ├── TopbarComponent (recherche + notifs + profil)
  └── ShellComponent (wrapper layout)

ÉTAPE 3 — Composants partagés
  ├── StatCardComponent
  ├── StatusChipComponent
  ├── DataTableComponent
  ├── LoadingSkeletonComponent
  └── EmptyStateComponent

ÉTAPE 4 — Pages dans l'ordre
  ├── /login
  ├── /dashboard  ← page la plus complexe, à faire en 1er pour valider le design
  ├── /parcelles (liste + carte)
  ├── /parcelles/:id
  ├── /visites
  ├── /taches (Kanban)
  ├── /equipes
  ├── /intrants
  └── /rapports

ÉTAPE 5 — Finitions
  ├── app.routes.ts complet avec guards
  ├── Notifications service + affichage
  └── README.md avec instructions de lancement