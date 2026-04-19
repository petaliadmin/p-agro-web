import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

export const routes: Routes = [
  // Redirect racine
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Auth (pas de shell)
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
  },

  // Shell layout (protégé)
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Tableau de bord — Petalia Farm OS',
      },
      {
        path: 'parcelles',
        loadComponent: () => import('./features/parcelles/parcelles.component').then(m => m.ParcellesComponent),
        title: 'Parcelles — Petalia Farm OS',
      },
      {
        path: 'parcelles/:id',
        loadComponent: () => import('./features/parcelles/parcelle-detail.component').then(m => m.ParcelleDetailComponent),
        title: 'Détail parcelle — Petalia Farm OS',
      },
      {
        path: 'visites',
        loadComponent: () => import('./features/visites/visites.component').then(m => m.VisitesComponent),
        title: 'Visites — Petalia Farm OS',
      },
      {
        path: 'visites/:id',
        loadComponent: () => import('./features/visites/visite-detail.component').then(m => m.VisiteDetailComponent),
        title: 'Détail visite — Petalia Farm OS',
      },
      {
        path: 'taches',
        loadComponent: () => import('./features/taches/taches.component').then(m => m.TachesComponent),
        title: 'Tâches — Petalia Farm OS',
      },
      {
        path: 'equipes',
        loadComponent: () => import('./features/equipes/equipes.component').then(m => m.EquipesComponent),
        title: 'Équipes — Petalia Farm OS',
      },
      {
        path: 'intrants',
        loadComponent: () => import('./features/intrants/intrants.component').then(m => m.IntrantsComponent),
        title: 'Intrants — Petalia Farm OS',
      },
      {
        path: 'rapports',
        loadComponent: () => import('./features/rapports/rapports.component').then(m => m.RapportsComponent),
        title: 'Rapports — Petalia Farm OS',
      },
      {
        path: 'profil',
        loadComponent: () => import('./features/profil/profil.component').then(m => m.ProfilComponent),
        canDeactivate: [unsavedChangesGuard],
        title: 'Mon profil — Petalia Farm OS',
      },
      {
        path: 'parametres',
        loadComponent: () => import('./features/parametres/parametres.component').then(m => m.ParametresComponent),
        title: 'Paramètres — Petalia Farm OS',
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'Notifications — Petalia Farm OS',
      },
      {
        path: 'planification',
        loadComponent: () => import('./features/planification/planification.component').then(m => m.PlanificationComponent),
        title: 'Planification — Petalia Farm OS',
      },
      {
        path: 'rapports-economiques',
        loadComponent: () => import('./features/rapports-economiques/rapports-economiques.component').then(m => m.RapportsEconomiquesComponent),
        title: 'Rapports économiques — Petalia Farm OS',
      },
    ],
  },

  // Carte publique (pas d'auth, pas de shell)
  {
    path: 'carte-publique',
    loadComponent: () =>
      import('./features/carte-publique/carte-publique.component')
        .then(m => m.CartePubliqueComponent),
    title: 'Carte des parcelles — Petalia Farm OS',
  },

  // Error pages (hors shell)
  {
    path: '403',
    loadComponent: () => import('./features/errors/forbidden.component').then(m => m.ForbiddenComponent),
    title: 'Accès interdit — Petalia Farm OS',
  },
  {
    path: '500',
    loadComponent: () => import('./features/errors/server-error.component').then(m => m.ServerErrorComponent),
    title: 'Erreur serveur — Petalia Farm OS',
  },
  {
    path: '404',
    loadComponent: () => import('./features/errors/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page introuvable — Petalia Farm OS',
  },

  // Fallback → 404
  {
    path: '**',
    loadComponent: () => import('./features/errors/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page introuvable — Petalia Farm OS',
  },
];
