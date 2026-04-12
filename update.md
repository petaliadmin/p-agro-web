# AgroAssist — Plan de complétion projet

> Dernière mise à jour : 2026-04-12 (Phases 17–23 complétées — phases 24+ en cours)
> Légende : `[DONE]` `[TODO]` `[DOING]`

---

## Phase 0 — Fondations & Infrastructure (existant)

| # | Tâche | Statut |
|---|-------|--------|
| 0.1 | Models TypeScript (Parcelle, Visite, Tache, Intrant, Equipe, Membre, User) | `[DONE]` |
| 0.2 | Mock data (parcelles, visites, taches, intrants, membres, equipes, meteo, notifications) | `[DONE]` |
| 0.3 | Services mock avec BehaviorSubject + delay | `[DONE]` |
| 0.4 | Layout (Shell, Sidebar, Topbar) | `[DONE]` |
| 0.5 | Shared components (StatusChip, Avatar, StatCard, LoadingSkeleton, EmptyState, PageHeader, AlertBadge) | `[DONE]` |
| 0.6 | Pipes (dateLocale, hectare, statutCulture, cultureEmoji, fcfa) | `[DONE]` |
| 0.7 | Directive highlight | `[DONE]` |
| 0.8 | Auth guard + login guard + interceptor | `[DONE]` |
| 0.9 | Routing lazy-loaded complet | `[DONE]` |
| 0.10 | Login page | `[DONE]` |
| 0.11 | Dashboard (KPIs, charts, météo, carte, visites récentes) | `[DONE]` |

---

## Phase 1 — Pages lecture (vues existantes)

| # | Tâche | Statut |
|---|-------|--------|
| 1.1 | Parcelles — liste / grille / carte avec filtres | `[DONE]` |
| 1.2 | Parcelle détail — infos, carte Leaflet, timeline visites, intrants, prochaine visite | `[DONE]` |
| 1.3 | Visites — liste avec filtres (statut, technicien, parcelle) | `[DONE]` |
| 1.4 | Visite détail — stepper, observations, recommandations, photos | `[DONE]` |
| 1.5 | Tâches — Kanban + Liste + Calendrier avec filtres | `[DONE]` |
| 1.6 | Équipes — cards, planning semaine, table membres | `[DONE]` |
| 1.7 | Intrants — stocks, alertes, mouvements, graphique consommation | `[DONE]` |
| 1.8 | Rapports — KPIs, rendement, problèmes, activité, chart budget | `[DONE]` |
| 1.9 | Recherche globale topbar (parcelles, visites, tâches) | `[DONE]` |
| 1.10 | DataTableComponent shared (réutilisable) | `[DONE]` |

---

## Phase 2 — Système de modales/dialogues

| # | Tâche | Statut |
|---|-------|--------|
| 2.1 | Créer `ConfirmDialogComponent` (shared) — modale de confirmation générique (titre, message, boutons Annuler/Confirmer) | `[DONE]` |
| 2.2 | Créer `FormDialogComponent` (shared) — wrapper modale avec header, body slot, footer actions, loading state | `[DONE]` |
| 2.3 | Créer service `DialogService` — open/close, overlay backdrop, animation slide-in, fermeture Escape | `[DONE]` |

---

## Phase 3 — CRUD Parcelles

| # | Tâche | Statut |
|---|-------|--------|
| 3.1 | `ParcelleService.delete(id)` — méthode suppression mock | `[DONE]` |
| 3.2 | Formulaire création parcelle (modale) — champs : nom, code, superficie, culture, stade, zone, sol, producteur, coordonnées | `[DONE]` |
| 3.3 | Bouton "Nouvelle parcelle" → ouvre modale création | `[DONE]` |
| 3.4 | Formulaire édition parcelle (modale) — pré-rempli avec données existantes | `[DONE]` |
| 3.5 | Bouton "Éditer" sur parcelle-detail → ouvre modale édition | `[DONE]` |
| 3.6 | Suppression parcelle avec confirmation dialog | `[DONE]` |
| 3.7 | Validation formulaire (champs requis, superficie > 0, coordonnées valides) | `[DONE]` |
| 3.8 | Toast/notification succès après create/update/delete | `[DONE]` |

---

## Phase 4 — CRUD Visites

| # | Tâche | Statut |
|---|-------|--------|
| 4.1 | `VisiteService.create(visite)` — méthode création mock | `[DONE]` |
| 4.2 | `VisiteService.update(id, changes)` — méthode mise à jour mock | `[DONE]` |
| 4.3 | `VisiteService.delete(id)` — méthode suppression mock | `[DONE]` |
| 4.4 | Formulaire création visite (modale) — champs : parcelleId, technicienId, date, observations initiales | `[DONE]` |
| 4.5 | Bouton "Nouvelle visite" (parcelle-detail + visites liste) → ouvre modale | `[DONE]` |
| 4.6 | Formulaire édition visite — modifier observations, sol, irrigation, recommandations | `[DONE]` |
| 4.7 | Suppression visite avec confirmation | `[DONE]` |
| 4.8 | Validation formulaire (parcelle requise, date valide, technicien requis) | `[DONE]` |
| 4.9 | Toast succès après actions | `[DONE]` |

---

## Phase 5 — CRUD Tâches

| # | Tâche | Statut |
|---|-------|--------|
| 5.1 | `TacheService.create(tache)` — méthode création mock | `[DONE]` |
| 5.2 | `TacheService.delete(id)` — méthode suppression mock | `[DONE]` |
| 5.3 | Formulaire création tâche (modale) — champs : titre, description, type, priorité, parcelleId, equipeId, dateDebut, dateFin, ressources | `[DONE]` |
| 5.4 | Bouton "Nouvelle tâche" → ouvre modale création | `[DONE]` |
| 5.5 | Formulaire édition tâche (modale) — modifier tous les champs + completionPct | `[DONE]` |
| 5.6 | Clic sur card Kanban → ouvre modale édition | `[DONE]` |
| 5.7 | Suppression tâche avec confirmation | `[DONE]` |
| 5.8 | Drag & drop Kanban fonctionnel (dragover + drop → updateStatut) | `[DONE]` |
| 5.9 | Validation formulaire (titre requis, dates cohérentes début < fin) | `[DONE]` |
| 5.10 | Toast succès après actions | `[DONE]` |

---

## Phase 6 — CRUD Équipes & Membres

| # | Tâche | Statut |
|---|-------|--------|
| 6.1 | `EquipeService.create(equipe)` — méthode création mock | `[DONE]` |
| 6.2 | `EquipeService.update(id, changes)` — méthode mise à jour mock | `[DONE]` |
| 6.3 | `EquipeService.delete(id)` — méthode suppression mock | `[DONE]` |
| 6.4 | `MembreService.create(membre)` — méthode création mock | `[DONE]` |
| 6.5 | `MembreService.update(id, changes)` — méthode mise à jour mock | `[DONE]` |
| 6.6 | `MembreService.delete(id)` — méthode suppression mock | `[DONE]` |
| 6.7 | Formulaire création équipe (modale) — nom, zone, couleur, chef (select membre) | `[DONE]` |
| 6.8 | Bouton "Nouvelle équipe" → ouvre modale | `[DONE]` |
| 6.9 | Édition équipe (modale) — modifier infos + ajouter/retirer membres | `[DONE]` |
| 6.10 | Formulaire ajout membre (modale) — nom, prénom, rôle, téléphone, equipeId | `[DONE]` |
| 6.11 | Édition membre (modale) — modifier rôle, téléphone, disponibilité, équipe | `[DONE]` |
| 6.12 | Suppression équipe/membre avec confirmation | `[DONE]` |
| 6.13 | Validation (nom requis, téléphone format sénégalais, pas de doublons) | `[DONE]` |
| 6.14 | Toast succès après actions | `[DONE]` |

---

## Phase 7 — CRUD Intrants & Mouvements

| # | Tâche | Statut |
|---|-------|--------|
| 7.1 | `IntrantService.create(intrant)` — méthode création mock | `[DONE]` |
| 7.2 | `IntrantService.update(id, changes)` — méthode mise à jour mock | `[DONE]` |
| 7.3 | `IntrantService.delete(id)` — méthode suppression mock | `[DONE]` |
| 7.4 | Formulaire création intrant (modale) — nom, type, quantité, unité, seuil alerte, date expiration, fournisseur, prix unitaire | `[DONE]` |
| 7.5 | Bouton "Nouvelle entrée stock" → ouvre modale création intrant | `[DONE]` |
| 7.6 | Formulaire mouvement stock (modale) — type (entrée/sortie), quantité, parcelleId (si sortie), motif | `[DONE]` |
| 7.7 | Bouton "Entrée stock" / "Sortie stock" sur chaque ligne du tableau | `[DONE]` |
| 7.8 | Édition intrant (modale) — modifier infos produit | `[DONE]` |
| 7.9 | Suppression intrant avec confirmation | `[DONE]` |
| 7.10 | Validation (quantité > 0, date expiration future, seuil > 0) | `[DONE]` |
| 7.11 | Mise à jour auto du stock après mouvement | `[DONE]` |
| 7.12 | Toast succès après actions | `[DONE]` |

---

## Phase 8 — Notifications & Feedback utilisateur

| # | Tâche | Statut |
|---|-------|--------|
| 8.1 | Créer `ToastService` — afficher snackbar/toast (succès, erreur, warning, info) | `[DONE]` |
| 8.2 | Créer `ToastComponent` (shared) — toast empilable avec auto-dismiss, icône, couleur par type | `[DONE]` |
| 8.3 | Intégrer toast dans toutes les actions CRUD (create, update, delete) | `[DONE]` |
| 8.4 | `NotificationService.create(notification)` — générer notification après action importante | `[DONE]` |
| 8.5 | Notification temps réel simulée — nouvelle alerte stock, visite complétée, tâche en retard | `[DONE]` |

---

## Phase 9 — Améliorations UX

| # | Tâche | Statut |
|---|-------|--------|
| 9.1 | Drag & drop réel sur Kanban (dragover, drop handlers, update statut au drop) | `[DONE]` |
| 9.2 | Tri colonnes sur les tables (clic header → asc/desc) | `[DONE]` |
| 9.3 | Pagination sur les tables longues (parcelles, visites, membres, intrants) | `[DONE]` |
| 9.4 | Export CSV/Excel mock sur les tables (bouton Export → télécharge fichier) | `[DONE]` |
| 9.5 | Graphique évolution rendement (line chart multi-saisons) sur parcelle-detail | `[DONE]` |
| 9.6 | Filtre date range sur Visites (date picker from/to) | `[DONE]` |
| 9.7 | Filtre date sur Tâches (ajout dropdown date en plus des filtres existants) | `[DONE]` |
| 9.8 | Breadcrumbs cliquables avec routerLink (PageHeaderComponent) | `[DONE]` |
| 9.9 | Boutons actions colonne dans table Visites (voir, éditer, supprimer) | `[DONE]` |

---

## Phase 10 — Accessibilité & Qualité

| # | Tâche | Statut |
|---|-------|--------|
| 10.1 | `aria-label` sur tous les boutons iconiques (sidebar, topbar, actions) | `[DONE]` |
| 10.2 | `role` et `aria-live` sur zones de statut (alertes, KPIs dynamiques) | `[DONE]` |
| 10.3 | Focus visible (outline ring) sur tous les éléments interactifs | `[DONE]` |
| 10.4 | Navigation clavier dans les modales (trap focus via CDK, tab order) | `[DONE]` |
| 10.5 | Contraste couleurs — ratio 4.5:1 minimum (text-gray-400 → gray-500) | `[DONE]` |
| 10.6 | `aria-hidden="true"` sur toutes les icônes décoratives Material Icons | `[DONE]` |

---

## Phase 11 — Pages & fonctionnalités manquantes

| # | Tâche | Statut |
|---|-------|--------|
| 11.1 | Page Profil utilisateur (`/profil`) — voir/éditer nom, email, mot de passe | `[DONE]` |
| 11.2 | Page Paramètres (`/parametres`) — préférences notifications, langue, thème | `[DONE]` |
| 11.3 | Notifications page dédiée (`/notifications`) — liste complète avec filtres | `[DONE]` |
| 11.4 | Ajouter routes `/profil`, `/parametres`, `/notifications` dans app.routes.ts | `[DONE]` |
| 11.5 | Ajouter liens Profil/Paramètres dans le menu utilisateur topbar | `[DONE]` |
| 11.6 | Rapport PDF enrichi — génération vraie avec jsPDF et données réelles | `[DONE]` |
| 11.7 | Dashboard — bouton Actualiser fonctionnel (reload données) | `[DONE]` |

---

## Phase 12 — Préparation API NestJS

| # | Tâche | Statut |
|---|-------|--------|
| 12.1 | Créer `environment.ts` avec URLs API (apiUrl, version, endpoints) | `[DONE]` |
| 12.2 | Refactorer services — HttpClient avec feature flag `environment.mock` (ParcelleService exemplaire) | `[DONE]` |
| 12.3 | Error handling global — `errorInterceptor` (401→login, 403, 404, 500+) | `[DONE]` |
| 12.4 | Retry logic — `retryInterceptor` (retry 2x GET avec délai exponentiel) | `[DONE]` |
| 12.5 | Loading interceptor global — `loadingInterceptor` + `LoadingService` (signal-based) | `[DONE]` |

---

## Résumé progression

| Phase | Description | Progression |
|-------|-------------|-------------|
| Phase 0 | Fondations & infrastructure | **11/11** — 100% |
| Phase 1 | Pages lecture | **10/10** — 100% |
| Phase 2 | Système de modales | **3/3** — 100% |
| Phase 3 | CRUD Parcelles | **8/8** — 100% |
| Phase 4 | CRUD Visites | **9/9** — 100% |
| Phase 5 | CRUD Tâches | **10/10** — 100% |
| Phase 6 | CRUD Équipes & Membres | **14/14** — 100% |
| Phase 7 | CRUD Intrants | **12/12** — 100% |
| Phase 8 | Notifications & Feedback | **5/5** — 100% |
| Phase 9 | Améliorations UX | **9/9** — 100% |
| Phase 10 | Accessibilité | **6/6** — 100% |
| Phase 11 | Pages manquantes | **7/7** — 100% |
| Phase 12 | Préparation API | **5/5** — 100% |
| Phase 13 | Finitions & Polish | **8/8** — 100% |
| Phase 14 | Pages d'erreur, Dark Mode & Animations | **10/10** — 100% |
| Phase 15 | Profil, Formulaires & Corrections | **8/8** — 100% |
| Phase 16 | Notifications avancées & Navigation | **7/7** — 100% |
| Phase 17 | Calendrier, Cartes & Charts dynamiques | **8/8** — 100% |
| Phase 18 | Rapports avancés & Export | **7/7** — 100% |
| Phase 19 | **[AUDIT UX]** Performance & Chargement | **10/10** — 100% |
| Phase 20 | **[AUDIT UX]** Responsive Mobile | **10/10** — 100% |
| Phase 21 | **[AUDIT UX]** Cibles Tactiles & Mobile | **8/8** — 100% |
| Phase 22 | **[AUDIT UX]** Accessibilite WCAG AA | **10/10** — 100% |
| Phase 23 | **[AUDIT UX]** Etats chargement/erreur/vide | **10/10** — 100% |
| Phase 24 | **[AUDIT UX]** Dark Mode complet | **0/10** — 0% |
| Phase 25 | **[AUDIT UX]** Formulaires | **0/10** — 0% |
| Phase 26 | **[AUDIT UX]** Design System | **0/10** — 0% |
| Phase 27 | **[AUDIT UX]** UX Avancee & Optimisations | **0/15** — 0% |
| **TOTAL** | | **205/250** — ~82% |

---

## Phase 13 — Finitions & Polish

| # | Tâche | Statut |
|---|-------|--------|
| 13.1 | Loading bar globale — composant qui utilise `LoadingService.isLoading` signal | `[DONE]` |
| 13.2 | Refactorer `VisiteService` avec HttpClient + `environment.mock` | `[DONE]` |
| 13.3 | Refactorer `TacheService` avec HttpClient + `environment.mock` | `[DONE]` |
| 13.4 | Refactorer `EquipeService` + `MembreService` avec HttpClient | `[DONE]` |
| 13.5 | Refactorer `IntrantService` avec HttpClient | `[DONE]` |
| 13.6 | Refactorer `AuthService` avec HttpClient pour login/logout | `[DONE]` |
| 13.7 | Ajouter lien Notifications dans la sidebar avec badge non-lues | `[DONE]` |
| 13.8 | Toast global au root (app.component) pour erreurs hors shell | `[DONE]` |

---

## Phase 14 — Pages d'erreur, Dark Mode & Animations

| # | Tâche | Statut |
|---|-------|--------|
| 14.1 | Page 404 Not Found — composant dédié avec illustration et bouton retour | `[DONE]` |
| 14.2 | Page 403 Forbidden — accès interdit avec lien retour dashboard | `[DONE]` |
| 14.3 | Page 500 Erreur serveur — erreur générique avec bouton réessayer | `[DONE]` |
| 14.4 | Routes d'erreur dans `app.routes.ts` — wildcard `**` → 404, routes `/403`, `/500` | `[DONE]` |
| 14.5 | `ThemeService` — gestion dark/light/system avec signal + localStorage | `[DONE]` |
| 14.6 | Variables CSS dark mode — `tailwind.css` avec classe `dark:` + `tailwind.config.js` `darkMode: 'class'` | `[DONE]` |
| 14.7 | Appliquer dark mode au shell (sidebar, topbar, main content) | `[DONE]` |
| 14.8 | Connecter Paramètres au `ThemeService` — persistance choix utilisateur | `[DONE]` |
| 14.9 | Animations de transition de pages — Angular `@routeAnimation` (fade + slide) | `[DONE]` |
| 14.10 | Persistance paramètres utilisateur — `SettingsService` avec localStorage | `[DONE]` |

---

## Phase 15 — Profil, Formulaires & Corrections critiques

| # | Tâche | Statut |
|---|-------|--------|
| 15.1 | Profil — sauvegarder les modifications (nom, prénom, email) via `AuthService.updateProfile()` + localStorage | `[DONE]` |
| 15.2 | Profil — validation mot de passe (force, confirmation match, ancien mot de passe vérifié via service) | `[DONE]` |
| 15.3 | Profil — upload avatar (preview image, stockage base64 localStorage, affichage sidebar/topbar) | `[DONE]` |
| 15.4 | Visite formulaire création — exposer champs observations, sol, irrigation, recommandations (pas seulement en édition) | `[DONE]` |
| 15.5 | Visite formulaire — ajout/suppression maladies détectées et ravageurs (champs dynamiques FormArray) | `[DONE]` |
| 15.6 | Tâche formulaire — champ `completionPct` slider disponible à la création (pas seulement édition) | `[DONE]` |
| 15.7 | Notifications page — clic sur notification → navigation vers l'entité liée (parcelle, visite, tâche) | `[DONE]` |
| 15.8 | Notifications page — `marquerLue()` persister dans le service (pas seulement local) | `[DONE]` |

---

## Phase 16 — Notifications avancées & Navigation contextuelle

| # | Tâche | Statut |
|---|-------|--------|
| 16.1 | Visite détail — lien cliquable vers la parcelle associée (`routerLink` sur nom parcelle) | `[DONE]` |
| 16.2 | Parcelle détail — lien « Voir visite » sur chaque visite de la timeline | `[DONE]` |
| 16.3 | Topbar notifications dropdown — bouton « Voir toutes » → `/notifications` | `[DONE]` |
| 16.4 | Notifications dropdown — action rapide sur chaque notif (ex: « Voir la parcelle ») | `[DONE]` |
| 16.5 | Recherche globale — afficher indicateur de chargement pendant la recherche | `[DONE]` |
| 16.6 | Recherche globale — inclure les équipes et intrants dans les résultats | `[DONE]` |
| 16.7 | Sidebar — badge dynamique tâches urgentes sur item « Tâches » | `[DONE]` |

---

## Phase 17 — Calendrier tâches, Cartes & Charts dynamiques

| # | Tâche | Statut |
|---|-------|--------|
| 17.1 | Tâches calendrier — navigation semaine précédente/suivante (boutons ← →) | `[DONE]` |
| 17.2 | Tâches calendrier — afficher le mois/année en cours dans le header | `[DONE]` |
| 17.3 | Parcelles carte — clustering markers Leaflet quand zoom out (plugin MarkerCluster) | `[DONE]` |
| 17.4 | Parcelles carte — popup info au clic sur marker (nom, culture, superficie, lien détail) | `[DONE]` |
| 17.5 | Dashboard — charts réactifs aux données réelles (activité semaine calculée depuis visites) | `[DONE]` |
| 17.6 | Dashboard — donut parcelles recalculé dynamiquement depuis `ParcelleService.getStats()` | `[DONE]` |
| 17.7 | Intrants — graphique consommation calculé depuis les mouvements réels (pas données hardcodées) | `[DONE]` |
| 17.8 | Parcelle détail — rendement chart calculé depuis données réelles des visites | `[DONE]` |

---

## Phase 18 — Rapports avancés & Export complet

| # | Tâche | Statut |
|---|-------|--------|
| 18.1 | Rapports — filtre période recalcule TOUS les graphiques (pas seulement KPIs) | `[DONE]` |
| 18.2 | Rapports — budget vs consommation calculé depuis intrants réels (pas valeurs hardcodées) | `[DONE]` |
| 18.3 | Rapports — performance équipes calculée depuis tâches complétées par équipe | `[DONE]` |
| 18.4 | Rapports PDF — inclure les graphiques (Chart.js → canvas → image dans jsPDF) | `[DONE]` |
| 18.5 | Rapports PDF — inclure carte parcelles (Leaflet screenshot → image) | `[DONE]` |
| 18.6 | Export CSV — option exporter TOUTES les données (pas seulement filtrées) | `[DONE]` |
| 18.7 | DataTable — tri colonnes header cliquable (asc/desc) intégré au composant shared | `[DONE]` |

---
---

# AUDIT UX/UI & PERFORMANCE — Plan d'amelioration

> Audit realise le 12/04/2026 — Phases 19 a 27
> Focus : performance, responsive, accessibilite, design system, UX polish

## Resultats de l'audit

| Categorie | Score actuel | Composants impactes |
|-----------|-------------|---------------------|
| Performance & chargement | 5/10 | 6/10 |
| Responsive / Mobile | 3/10 | 9/10 |
| Accessibilite (WCAG AA) | 4/10 | 10/10 |
| Etats chargement/erreur/vide | 4/10 | 8/10 |
| Dark mode | 3/10 | 10/10 |
| Validation formulaires | 3/10 | 6/10 |
| Consistance design system | 5/10 | 7/10 |

### Problemes critiques identifies

1. **CDN bloquants** : Chart.js et Leaflet charges via `<script>` dans `index.html` — bloquent le rendu, pas de tree-shaking
2. **Polices en double** : Google Fonts importe dans `index.html` ET `tailwind.css`
3. **setTimeout** : Dashboard utilise `setTimeout(100ms)` et `setTimeout(500ms)` pour charts/carte
4. **Pas de debounce** : Recherche topbar filtre a chaque frappe sans debounce
5. **Tableaux non responsives** : Debordent sur mobile, pas de scroll horizontal
6. **Cibles tactiles** : Nombreux boutons < 44px (minimum mobile)
7. **Dark mode incomplet** : Charts et cartes ne s'adaptent pas au dark mode
8. **Accessibilite** : Canvas sans `role="img"`, dropdowns sans navigation clavier, modales sans focus trap correct

---

## Phase 19 — Performance & Chargement (Priorite CRITIQUE)

| # | Tache | Statut |
|---|-------|--------|
| 19.1 | Installer Chart.js et Leaflet via npm, supprimer les `<script>` CDN de `index.html` (lignes 19-23) | `[DONE]` |
| 19.2 | Importer Chart.js dans dashboard et rapports via `import { Chart } from 'chart.js/auto'` | `[DONE]` |
| 19.3 | Importer Leaflet via `import * as L from 'leaflet'`, ajouter styles Leaflet dans `angular.json` | `[DONE]` |
| 19.4 | Supprimer l'import `@import url(...)` duplique dans `tailwind.css` ligne 1 | `[DONE]` |
| 19.5 | Ajouter `<link rel="preload">` pour la police Plus Jakarta Sans dans `index.html` | `[DONE]` |
| 19.6 | Dashboard — remplacer `setTimeout(initCharts, 100)` par `afterNextRender()` Angular 17 | `[DONE]` |
| 19.7 | Dashboard — remplacer `setTimeout(initMap, 500)` par `afterNextRender()` avec check DOM | `[DONE]` |
| 19.8 | Topbar — transformer la recherche en `Subject<string>` avec `debounceTime(300)` | `[DONE]` |
| 19.9 | Topbar — limiter les resultats de recherche a 5 par categorie | `[DONE]` |
| 19.10 | Reduire le budget initial warning a 300KB dans `angular.json` (actuellement 500KB) | `[DONE]` |

---

## Phase 20 — Responsive Mobile (Priorite HAUTE)

| # | Tache | Statut |
|---|-------|--------|
| 20.1 | Dashboard KPI grid — changer `grid-cols-2` en `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` | `[DONE]` |
| 20.2 | Dashboard charts grid — changer `lg:grid-cols-3` en `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` | `[DONE]` |
| 20.3 | Dashboard — reduire gaps en `gap-2 sm:gap-4`, carte en `h-[200px] md:h-[300px]` | `[DONE]` |
| 20.4 | Creer un wrapper `overflow-x-auto` avec indicateur de scroll pour tous les tableaux | `[DONE]` |
| 20.5 | Parcelles/Visites/Rapports/Taches — appliquer le wrapper responsive sur les tableaux | `[DONE]` |
| 20.6 | Sur mobile (< 768px), transformer les tableaux en vue "cards empilees" via `BreakpointObserver` | `[DONE]` |
| 20.7 | Shell — changer padding `p-6` en `p-3 sm:p-4 lg:p-6` | `[DONE]` |
| 20.8 | Shell — ajouter `overflow-hidden` sur body quand sidebar mobile ouverte | `[DONE]` |
| 20.9 | Topbar — ajouter bouton recherche mobile qui ouvre un champ plein ecran | `[DONE]` |
| 20.10 | Login — reduire padding mobile `py-12` → `py-6 sm:py-12`, adapter la moitie gauche | `[DONE]` |

---

## Phase 21 — Cibles Tactiles & Interactions Mobile (Priorite HAUTE)

| # | Tache | Statut |
|---|-------|--------|
| 21.1 | Boutons action tableaux — agrandir de `w-7 h-7` a `min-w-[44px] min-h-[44px]` | `[DONE]` |
| 21.2 | Boutons pagination — ajouter padding pour atteindre 44px minimum | `[DONE]` |
| 21.3 | Badges sidebar — ajouter zone de tap elargie `p-2` | `[DONE]` |
| 21.4 | Login — agrandir le bouton toggle mot de passe (zone cliquable 44px) | `[DONE]` |
| 21.5 | Taches Kanban — agrandir boutons de statut de `text-[10px]` a `text-sm` avec padding | `[DONE]` |
| 21.6 | Taches Kanban — ajouter support tactile (pointer events) pour drag & drop mobile | `[DONE]` |
| 21.7 | Taches calendrier — sur mobile, afficher vue liste au lieu de `grid-cols-7` | `[DONE]` |
| 21.8 | Topbar — agrandir boutons notifications/profil de `w-9 h-9` a `w-11 h-11` | `[DONE]` |

---

## Phase 22 — Accessibilite WCAG 2.1 AA (Priorite HAUTE)

| # | Tache | Statut |
|---|-------|--------|
| 22.1 | Dashboard — ajouter `role="img"` et `aria-label` descriptif sur tous les `<canvas>` | `[DONE]` |
| 22.2 | Sidebar — ajouter `aria-expanded` sur bouton toggle, `aria-current="page"` sur lien actif | `[DONE]` |
| 22.3 | Topbar — ajouter `role="listbox"` sur dropdown resultats, `aria-label` sur input recherche | `[DONE]` |
| 22.4 | Topbar — ajouter navigation fleches haut/bas + Echap dans le dropdown recherche | `[DONE]` |
| 22.5 | Parcelles — ajouter `aria-sort` sur headers triables, `<label>` sur selects filtres | `[DONE]` |
| 22.6 | Rapports — ajouter `aria-label` sur boutons d'action (icones seules) | `[DONE]` |
| 22.7 | Login — ajouter `role="alert"` sur messages d'erreur, `aria-live="polite"` sur spinner | `[DONE]` |
| 22.8 | Modales — implementer focus trap correct (CDK `FocusTrapFactory`) | `[DONE]` |
| 22.9 | Ajouter `@media (prefers-reduced-motion: reduce)` dans `tailwind.css` | `[DONE]` |
| 22.10 | Sidebar mobile — pieger le focus clavier quand ouverte | `[DONE]` |

---

## Phase 23 — Etats de Chargement, Erreur, Vide (Priorite MOYENNE)

| # | Tache | Statut |
|---|-------|--------|
| 23.1 | Creer `LoadingOverlayComponent` reutilisable (overlay semi-transparent + spinner) | `[DONE]` |
| 23.2 | Dashboard — skeleton pour charts et carte (remplacer les setTimeout) | `[DONE]` |
| 23.3 | Parcelles — skeleton pendant filtrage et changement de vue | `[DONE]` |
| 23.4 | Rapports — skeleton sur tableau pendant tri/filtrage | `[DONE]` |
| 23.5 | Taches — skeleton par colonne Kanban (pas global) | `[DONE]` |
| 23.6 | `EmptyStateComponent` — ajouter `@Input() type: 'no-data' | 'no-results' | 'error'` | `[DONE]` |
| 23.7 | "no-results" — message + bouton "Reinitialiser les filtres" | `[DONE]` |
| 23.8 | "error" — message d'erreur + bouton "Reessayer" | `[DONE]` |
| 23.9 | Dashboard/Parcelles — afficher message si tuiles Leaflet echouent (`tileerror`) | `[DONE]` |
| 23.10 | Dashboard/Rapports — try/catch sur `new Chart()` avec fallback textuel | `[DONE]` |

---

## Phase 24 — Dark Mode Complet (Priorite MOYENNE)

| # | Tache | Statut |
|---|-------|--------|
| 24.1 | Dashboard — adapter couleurs Chart.js selon theme (axes, grille, labels, fond) | `[TODO]` |
| 24.2 | Rapports — adapter tous les graphiques au dark mode | `[TODO]` |
| 24.3 | Ecouter `ThemeService` pour re-render les charts au changement de theme | `[TODO]` |
| 24.4 | Utiliser CSS custom properties pour les couleurs des charts | `[TODO]` |
| 24.5 | Login — ajouter classes `dark:` sur panneau gauche (fond, texte, stats) | `[TODO]` |
| 24.6 | Parcelles — classes `dark:` sur cartes grille et panneau carte | `[TODO]` |
| 24.7 | Taches — classes `dark:` sur colonnes Kanban et cartes de tache | `[TODO]` |
| 24.8 | Profil/Parametres — classes `dark:` sur champs et sections | `[TODO]` |
| 24.9 | Carte Leaflet — basculer sur tiles sombres (CartoDB dark_all) en dark mode | `[TODO]` |
| 24.10 | Sidebar — corriger badge `text-white/90 bg-white/20` illisible → texte opaque | `[TODO]` |

---

## Phase 25 — Amelioration Formulaires (Priorite MOYENNE)

| # | Tache | Statut |
|---|-------|--------|
| 25.1 | Login — migrer vers `FormGroup` avec `Validators.required`, `Validators.email` | `[TODO]` |
| 25.2 | Login — validation temps reel du format email (feedback on blur) | `[TODO]` |
| 25.3 | Login — ajouter lien "Mot de passe oublie ?" | `[TODO]` |
| 25.4 | Login — supprimer credentials pre-remplis en dur (risque securite) | `[TODO]` |
| 25.5 | Login — feedback rate-limiting apres 3 tentatives echouees | `[TODO]` |
| 25.6 | Profil — vider champs mot de passe apres changement reussi | `[TODO]` |
| 25.7 | Profil — indicateur de force du mot de passe (faible/moyen/fort) | `[TODO]` |
| 25.8 | Profil — desactiver bouton pendant soumission (eviter double-clic) | `[TODO]` |
| 25.9 | Profil — `CanDeactivate` guard pour modifications non sauvegardees | `[TODO]` |
| 25.10 | Parcelles/Visites/Taches — messages d'erreur inline sous chaque champ invalide | `[TODO]` |

---

## Phase 26 — Consistance Design System (Priorite MOYENNE)

| # | Tache | Statut |
|---|-------|--------|
| 26.1 | `tailwind.config.js` — completer palette avec nuances 300, 500, 700 pour toutes les couleurs | `[TODO]` |
| 26.2 | Standardiser padding pages : `p-4 lg:p-6` partout | `[TODO]` |
| 26.3 | Standardiser gaps grilles : `gap-3 lg:gap-4` partout | `[TODO]` |
| 26.4 | Standardiser titres de page : `text-xl font-semibold` partout | `[TODO]` |
| 26.5 | Standardiser marges entre sections : `space-y-6` partout | `[TODO]` |
| 26.6 | Creer `SearchInputComponent` reutilisable (icone, clear, debounce integre) | `[TODO]` |
| 26.7 | Creer `FilterBarComponent` responsive (collapse sur mobile en accordeon) | `[TODO]` |
| 26.8 | Creer `ChartContainerComponent` (wrapper Chart.js avec skeleton, erreur, dark mode) | `[TODO]` |
| 26.9 | Definir durees standard animations : 150ms (hover), 200ms (expand), 300ms (page) | `[TODO]` |
| 26.10 | Animer dropdowns topbar (transition-opacity + transition-transform) | `[TODO]` |

---

## Phase 27 — UX Avancee & Optimisations (Priorite BASSE)

| # | Tache | Statut |
|---|-------|--------|
| 27.1 | Pagination — ajouter selecteur "Elements par page" (10, 25, 50) | `[TODO]` |
| 27.2 | Pagination — afficher total "Affichage 1-10 sur 45 parcelles" | `[TODO]` |
| 27.3 | Pagination — champ "Aller a la page" pour grands jeux de donnees | `[TODO]` |
| 27.4 | Kanban — feedback visuel drag : ombre portee + opacite reduite sur source | `[TODO]` |
| 27.5 | Notifications — grouper par date (Aujourd'hui, Hier, Cette semaine) | `[TODO]` |
| 27.6 | Notifications — filtrer par type | `[TODO]` |
| 27.7 | Rapports PDF — barre de progression pendant generation | `[TODO]` |
| 27.8 | Rapports PDF — selection des sections a inclure | `[TODO]` |
| 27.9 | KPI cards — micro-interaction hover : `scale(1.02)` + ombre plus forte | `[TODO]` |
| 27.10 | Compteurs KPI — animation count-up au chargement du dashboard | `[TODO]` |
| 27.11 | `NgOptimizedImage` — appliquer sur toutes les images pour optimisation auto | `[TODO]` |
| 27.12 | Self-host Material Icons (supprimer CDN Google) | `[TODO]` |
| 27.13 | Virtual scrolling `@angular/cdk/scrolling` sur listes longues (parcelles, notifications) | `[TODO]` |
| 27.14 | PWA — `ng add @angular/pwa`, service worker, manifest, bandeau mise a jour | `[TODO]` |
| 27.15 | Web Vitals — integrer mesure LCP < 2.5s, FID < 100ms, CLS < 0.1 | `[TODO]` |

---

## Recapitulatif Audit UX/UI (Phases 19-27)

| Phase | Focus | Effort | Impact |
|-------|-------|--------|--------|
| Phase 19 | Performance & Chargement | 2-3 jours | Tres eleve |
| Phase 20 | Responsive Mobile | 3-4 jours | Tres eleve |
| Phase 21 | Cibles Tactiles & Mobile | 2 jours | Eleve |
| Phase 22 | Accessibilite WCAG AA | 2-3 jours | Eleve |
| Phase 23 | Etats chargement/erreur/vide | 2 jours | Eleve |
| Phase 24 | Dark Mode complet | 2 jours | Moyen |
| Phase 25 | Formulaires | 2 jours | Moyen |
| Phase 26 | Design System | 2-3 jours | Moyen |
| Phase 27 | UX Avancee & Optimisations | 4-5 jours | Moyen-Bas |
| **TOTAL** | | **~22-25 jours** | |

### Ordre d'implementation recommande

```
Phase 19 (Performance) → Phase 20 (Responsive) → Phase 21 (Tactile)
         ↓                                              ↓
Phase 22 (Accessibilite) → Phase 23 (Etats) → Phase 24 (Dark Mode)
                                                       ↓
              Phase 25 (Formulaires) → Phase 26 (Design System) → Phase 27 (UX/Optim)
```

> Les phases 19-22 sont CRITIQUES et doivent etre priorisees.
> Chaque phase est independante et peut etre implementee separement.
