import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';

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
        title: 'Tableau de bord — AgroAssist',
      },
      {
        path: 'parcelles',
        loadComponent: () => import('./features/parcelles/parcelles.component').then(m => m.ParcellesComponent),
        title: 'Parcelles — AgroAssist',
      },
      {
        path: 'parcelles/:id',
        loadComponent: () => import('./features/parcelles/parcelle-detail.component').then(m => m.ParcelleDetailComponent),
        title: 'Détail parcelle — AgroAssist',
      },
      {
        path: 'visites',
        loadComponent: () => import('./features/visites/visites.component').then(m => m.VisitesComponent),
        title: 'Visites — AgroAssist',
      },
      {
        path: 'visites/:id',
        loadComponent: () => import('./features/visites/visite-detail.component').then(m => m.VisiteDetailComponent),
        title: 'Détail visite — AgroAssist',
      },
      {
        path: 'taches',
        loadComponent: () => import('./features/taches/taches.component').then(m => m.TachesComponent),
        title: 'Tâches — AgroAssist',
      },
      {
        path: 'equipes',
        loadComponent: () => import('./features/equipes/equipes.component').then(m => m.EquipesComponent),
        title: 'Équipes — AgroAssist',
      },
      {
        path: 'intrants',
        loadComponent: () => import('./features/intrants/intrants.component').then(m => m.IntrantsComponent),
        title: 'Intrants — AgroAssist',
      },
      {
        path: 'rapports',
        loadComponent: () => import('./features/rapports/rapports.component').then(m => m.RapportsComponent),
        title: 'Rapports — AgroAssist',
      },
      {
        path: 'profil',
        loadComponent: () => import('./features/profil/profil.component').then(m => m.ProfilComponent),
        title: 'Mon profil — AgroAssist',
      },
      {
        path: 'parametres',
        loadComponent: () => import('./features/parametres/parametres.component').then(m => m.ParametresComponent),
        title: 'Paramètres — AgroAssist',
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'Notifications — AgroAssist',
      },
    ],
  },

  // Error pages (hors shell)
  {
    path: '403',
    loadComponent: () => import('./features/errors/forbidden.component').then(m => m.ForbiddenComponent),
    title: 'Accès interdit — AgroAssist',
  },
  {
    path: '500',
    loadComponent: () => import('./features/errors/server-error.component').then(m => m.ServerErrorComponent),
    title: 'Erreur serveur — AgroAssist',
  },
  {
    path: '404',
    loadComponent: () => import('./features/errors/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page introuvable — AgroAssist',
  },

  // Fallback → 404
  {
    path: '**',
    loadComponent: () => import('./features/errors/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page introuvable — AgroAssist',
  },
];
