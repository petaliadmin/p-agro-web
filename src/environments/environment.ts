// src/environments/environment.ts
// Configuration développement - données mock
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',   // URL NestJS future
  appName: 'AgroAssist',
  version: '1.0.0',
  mock: true,                            // true = services mock, false = vrais appels HTTP
  mapbox: {
    token: '',                           // À remplir pour Mapbox (optionnel, on utilise OSM)
  },
  defaultLang: 'fr',
  timezone: 'Africa/Dakar',
};

// API endpoints - centralisés pour branchement futur
export const API_ENDPOINTS = {
  auth: {
    login:   '/auth/login',
    logout:  '/auth/logout',
    refresh: '/auth/refresh',
    me:      '/auth/me',
  },
  parcelles: {
    base:      '/parcelles',
    byId:      (id: string) => `/parcelles/${id}`,
    stats:     '/parcelles/stats',
    urgentes:  '/parcelles/urgentes',
  },
  visites: {
    base:      '/visites',
    byId:      (id: string) => `/visites/${id}`,
    byParcelle:(id: string) => `/visites/parcelle/${id}`,
    recentes:  '/visites/recentes',
    stats:     '/visites/stats',
    activite:  '/visites/activite-semaine',
  },
  taches: {
    base:       '/taches',
    byId:       (id: string) => `/taches/${id}`,
    statut:     (id: string) => `/taches/${id}/statut`,
    stats:      '/taches/stats',
    urgentes:   '/taches/urgentes',
  },
  intrants: {
    base:       '/intrants',
    byId:       (id: string) => `/intrants/${id}`,
    mouvement:  (id: string) => `/intrants/${id}/mouvements`,
    alertes:    '/intrants/alertes',
    stats:      '/intrants/stats',
    conso:      '/intrants/consommation',
  },
  equipes: {
    base:       '/equipes',
    byId:       (id: string) => `/equipes/${id}`,
    membres:    (id: string) => `/equipes/${id}/membres`,
  },
  membres: {
    base:       '/membres',
    byId:       (id: string) => `/membres/${id}`,
    disponibles:'/membres/disponibles',
  },
  rapports: {
    kpis:       '/rapports/kpis',
    export:     '/rapports/export',
    graphiques: '/rapports/graphiques',
  },
  notifications: {
    base:      '/notifications',
    nonLues:   '/notifications/non-lues',
    count:     '/notifications/count',
    marquer:   (id: string) => `/notifications/${id}/lue`,
  },
  meteo: {
    base:      '/meteo',
    ville:     (ville: string) => `/meteo/${ville}`,
  },
};
