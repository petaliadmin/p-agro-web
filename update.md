# AgroAssist — Plan de complétion projet

> Dernière mise à jour : 2026-04-17 (Phases 0–43 complétées)
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
| Phase 24 | **[AUDIT UX]** Dark Mode complet | **10/10** — 100% |
| Phase 25 | **[AUDIT UX]** Formulaires | **10/10** — 100% |
| Phase 26 | **[AUDIT UX]** Design System | **10/10** — 100% |
| Phase 27 | **[AUDIT UX]** UX Avancee & Optimisations | **15/15** — 100% |
| Phase 28 | Enrichir modele Parcelle | **10/10** — 100% |
| Phase 29 | Intrants ameliores | **7/7** — 100% |
| Phase 30 | Workflow Campagne | **9/9** — 100% |
| Phase 31 | Irrigation & Pluviometrie | **7/7** — 100% |
| Phase 32 | Main-d'oeuvre & Economique | **8/8** — 100% |
| Phase 33 | Rendement & Recolte | **7/7** — 100% |
| Phase 34 | Observations Terrain | **5/5** — 100% |
| Phase 35 | Historique & Rotation | **5/5** — 100% |
| Phase 36 | Planification & Recommandations | **7/7** — 100% |
| Phase 37 | Rapports Technico-Economiques | **6/6** — 100% |
| Phase 38 | Corrections Build & Optimisations | **3/3** — 100% |
| Phase 39 | Apercu NDVI & Sante des Cultures | **12/12** — 100% |
| Phase 40 | Planification Campagne & Interventions | **14/14** — 100% |
| Phase 41 | Cycle de vie Campagne | **14/14** — 100% |
| Phase 42 | Carte Publique (Profil Public) | **19/19** — 100% |
| Phase 43 | Rapport PDF professionnel par parcelle | **24/24** — 100% |
| **TOTAL** | | **362/362** — 100% |

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
| 24.1 | Dashboard — adapter couleurs Chart.js selon theme (axes, grille, labels, fond) | `[DONE]` |
| 24.2 | Rapports — adapter tous les graphiques au dark mode | `[DONE]` |
| 24.3 | Ecouter `ThemeService` pour re-render les charts au changement de theme | `[DONE]` |
| 24.4 | Utiliser CSS custom properties pour les couleurs des charts | `[DONE]` |
| 24.5 | Login — ajouter classes `dark:` sur panneau gauche (fond, texte, stats) | `[DONE]` |
| 24.6 | Parcelles — classes `dark:` sur cartes grille et panneau carte | `[DONE]` |
| 24.7 | Taches — classes `dark:` sur colonnes Kanban et cartes de tache | `[DONE]` |
| 24.8 | Profil/Parametres — classes `dark:` sur champs et sections | `[DONE]` |
| 24.9 | Carte Leaflet — basculer sur tiles sombres (CartoDB dark_all) en dark mode | `[DONE]` |
| 24.10 | Sidebar — corriger badge `text-white/90 bg-white/20` illisible → texte opaque | `[DONE]` |

---

## Phase 25 — Amelioration Formulaires (Priorite MOYENNE)

| # | Tache | Statut |
|---|-------|--------|
| 25.1 | Login — migrer vers `FormGroup` avec `Validators.required`, `Validators.email` | `[DONE]` |
| 25.2 | Login — validation temps reel du format email (feedback on blur) | `[DONE]` |
| 25.3 | Login — ajouter lien "Mot de passe oublie ?" | `[DONE]` |
| 25.4 | Login — supprimer credentials pre-remplis en dur (risque securite) | `[DONE]` |
| 25.5 | Login — feedback rate-limiting apres 3 tentatives echouees | `[DONE]` |
| 25.6 | Profil — vider champs mot de passe apres changement reussi | `[DONE]` |
| 25.7 | Profil — indicateur de force du mot de passe (faible/moyen/fort) | `[DONE]` |
| 25.8 | Profil — desactiver bouton pendant soumission (eviter double-clic) | `[DONE]` |
| 25.9 | Profil — `CanDeactivate` guard pour modifications non sauvegardees | `[DONE]` |
| 25.10 | Parcelles/Visites/Taches — messages d'erreur inline sous chaque champ invalide | `[DONE]` |

---

## Phase 26 — Consistance Design System (Priorite MOYENNE)

| # | Tache | Statut |
|---|-------|--------|
| 26.1 | `tailwind.config.js` — completer palette avec nuances 300, 500, 700 pour toutes les couleurs | `[DONE]` |
| 26.2 | Standardiser padding pages : `p-4 lg:p-6` partout | `[DONE]` |
| 26.3 | Standardiser gaps grilles : `gap-3 lg:gap-4` partout | `[DONE]` |
| 26.4 | Standardiser titres de page : `text-xl font-semibold` partout | `[DONE]` |
| 26.5 | Standardiser marges entre sections : `space-y-6` partout | `[DONE]` |
| 26.6 | Creer `SearchInputComponent` reutilisable (icone, clear, debounce integre) | `[DONE]` |
| 26.7 | Creer `FilterBarComponent` responsive (collapse sur mobile en accordeon) | `[DONE]` |
| 26.8 | Creer `ChartContainerComponent` (wrapper Chart.js avec skeleton, erreur, dark mode) | `[DONE]` |
| 26.9 | Definir durees standard animations : 150ms (hover), 200ms (expand), 300ms (page) | `[DONE]` |
| 26.10 | Animer dropdowns topbar (transition-opacity + transition-transform) | `[DONE]` |

---

## Phase 27 — UX Avancee & Optimisations (Priorite BASSE)

| # | Tache | Statut |
|---|-------|--------|
| 27.1 | Pagination — ajouter selecteur "Elements par page" (10, 25, 50) | `[DONE]` |
| 27.2 | Pagination — afficher total "Affichage 1-10 sur 45 parcelles" | `[DONE]` |
| 27.3 | Pagination — champ "Aller a la page" pour grands jeux de donnees | `[DONE]` |
| 27.4 | Kanban — feedback visuel drag : ombre portee + opacite reduite sur source | `[DONE]` |
| 27.5 | Notifications — grouper par date (Aujourd'hui, Hier, Cette semaine) | `[DONE]` |
| 27.6 | Notifications — filtrer par type | `[DONE]` |
| 27.7 | Rapports PDF — barre de progression pendant generation | `[DONE]` |
| 27.8 | Rapports PDF — selection des sections a inclure | `[DONE]` |
| 27.9 | KPI cards — micro-interaction hover : `scale(1.02)` + ombre plus forte | `[DONE]` |
| 27.10 | Compteurs KPI — animation count-up au chargement du dashboard | `[DONE]` |
| 27.11 | `NgOptimizedImage` — N/A (images dynamiques base64 uniquement) | `[DONE]` |
| 27.12 | Self-host Material Icons (supprimer CDN Google) | `[DONE]` |
| 27.13 | Virtual scrolling — N/A (pagination par page suffisante) | `[DONE]` |
| 27.14 | PWA — service worker, manifest, bandeau mise a jour | `[DONE]` |
| 27.15 | Web Vitals — integrer mesure LCP, INP, CLS | `[DONE]` |

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

---
---

# ENRICHISSEMENT DONNEES AGRICOLES & WORKFLOW — Plan d'amelioration

> Base sur `context.md` (carnet de suivi agricole senegalais) vs etat actuel de l'application
> Phases 28 a 37 — Objectif : completer les donnees metier et ameliorer le workflow de campagne

### Analyse des ecarts context.md vs application

| Domaine context.md | Etat actuel | Manque |
|---------------------|-------------|--------|
| Identification parcelle | Basique (nom, superficie, culture, zone) | Type de sol detaille, mode acces terre, source eau, zone agroecologique, variete, campagne |
| Preparation parcelle | Non implemente | Labour, billonnage, mode travail (tracteur/attelé/manuel) |
| Gestion intrants | Bon (stock, mouvements, alertes) | Origine semences, dose recommandee, frequence application, lien parcelle |
| Irrigation/pluviometrie | Champ basique dans visite | Pas de suivi dedie, pas d'historique pluvio, pas d'evenements climatiques |
| Activites culturales | Taches generiques | Pas de workflow campagne, pas de templates par culture, manque sarclage/labour |
| Main-d'oeuvre | Membres avec role/dispo | Pas de type (familial/journalier), pas de cout journalier, pas de suivi economique |
| Observations terrain | Bon (visite multi-etapes) | Manque problemes sol/vent/animaux, note qualitative |
| Rendement/production | Rendement precedent sur parcelle | Pas de modele Recolte, pas de suivi pertes post-recolte |
| Suivi economique | Non implemente | Aucun bilan financier par parcelle (couts, revenus, marge) |
| Historique/rotation | Champ culture precedente | Pas de timeline, pas de recommandation rotation |
| Planification | Prochaine visite sur parcelle | Pas de planificateur de campagne, pas de fiches techniques |

---

## Phase 28 — Enrichir le modele Parcelle (Priorite P1)

| # | Tache | Statut |
|---|-------|--------|
| 28.1 | Ajouter au modele `Parcelle` : `exploitantNom`, `localite`, `zoneAgroecologique` (Niayes, Casamance, Vallee du Fleuve, Bassin arachidier, Senegal oriental, Zone sylvopastorale) | `[DONE]` |
| 28.2 | Ajouter : `typeSol` detaille ('dior' \| 'deck' \| 'argileux' \| 'sableux' \| 'argilo-sableux' \| 'lateritique') | `[DONE]` |
| 28.3 | Ajouter : `modeAccesTerre` ('propriete' \| 'pret' \| 'location' \| 'communautaire') | `[DONE]` |
| 28.4 | Ajouter : `sourceEau` ('pluie' \| 'forage' \| 'canal' \| 'fleuve' \| 'bassin' \| 'puits') | `[DONE]` |
| 28.5 | Ajouter : `variete` (string — ex: 55-437 pour arachide, Sahel 108 pour riz), `typeCampagne` ('hivernage' \| 'contre_saison_froide' \| 'contre_saison_chaude'), `dateSemis`, `densite` | `[DONE]` |
| 28.6 | Ajouter : `culturePrecedente`, `rotationPrevue` (culture suivante) | `[DONE]` |
| 28.7 | Mettre a jour `parcelles.mock.ts` — remplir tous les nouveaux champs avec donnees realistes senegalaises, ajouter 5+ nouvelles parcelles | `[DONE]` |
| 28.8 | Mettre a jour le formulaire `ParcelleFormComponent` — organiser en sections (Identification, Culture, Terrain, Historique), listes deroulantes avec valeurs senegalaises | `[DONE]` |
| 28.9 | Mettre a jour l'affichage parcelle-detail — afficher les nouveaux champs en sections | `[DONE]` |
| 28.10 | Ajouter filtres dans parcelles.component : zone agroecologique, type de sol, campagne, source d'eau | `[DONE]` |

---

## Phase 29 — Gestion Intrants amelioree (Priorite P1)

| # | Tache | Statut |
|---|-------|--------|
| 29.1 | Enrichir modele `Intrant` : `origine` ('marche' \| 'subvention' \| 'stock_personnel' \| 'cooperatif'), `doseRecommandee` (kg/ha), `frequenceApplication`, `cultureCible` | `[DONE]` |
| 29.2 | Lier les mouvements de sortie a une parcelle specifique (champ `parcelleId` obligatoire sur sortie) | `[DONE]` |
| 29.3 | Calculer automatiquement le cout intrants par parcelle depuis les mouvements | `[DONE]` |
| 29.4 | Afficher dans parcelle-detail : section "Intrants utilises" avec liste + cout total FCFA | `[DONE]` |
| 29.5 | Ajouter intrants typiques senegalais dans mock : uree (46-0-0), NPK 15-15-15, DAP, Decis, Karate, semences certifiees par culture | `[DONE]` |
| 29.6 | Mettre a jour formulaire intrant avec les nouveaux champs | `[DONE]` |
| 29.7 | Ajouter filtre par culture cible dans la page intrants | `[DONE]` |

---

## Phase 30 — Activites Culturales & Workflow Campagne (Priorite P1)

| # | Tache | Statut |
|---|-------|--------|
| 30.1 | Ajouter types de tache manquants : 'labour' \| 'billonnage' \| 'sarclage' \| 'preparation_sol' \| 'buttage' | `[DONE]` |
| 30.2 | Enrichir modele `Tache` : `modeTravail` ('manuel' \| 'tracteur' \| 'traction_animale'), `mainOeuvre` (nb personnes), `coutMainOeuvre` (FCFA) | `[DONE]` |
| 30.3 | Creer modele `Campagne` : id, parcelleId, culture, variete, typeCampagne, dateDebut, dateFin, statut, etapes[] | `[DONE]` |
| 30.4 | Creer templates de campagne par culture : enchainement type Preparation sol → Semis → Sarclage → Fertilisation → Traitement → Recolte | `[DONE]` |
| 30.5 | Service `CampagneService` : creer campagne depuis template, generer taches automatiquement, suivre avancement | `[DONE]` |
| 30.6 | Vue "Nouvelle campagne" : choisir parcelle + culture → generer les taches automatiquement | `[DONE]` |
| 30.7 | Barre de progression campagne dans parcelle-detail (% des etapes completees) | `[DONE]` |
| 30.8 | Vue calendrier cultural annuel — Gantt simplifie montrant les campagnes par parcelle, distinction hivernage/contre-saison | `[DONE]` |
| 30.9 | Mock data : 2-3 campagnes en cours avec taches generees | `[DONE]` |

---

## Phase 31 — Irrigation & Pluviometrie (Priorite P2)

| # | Tache | Statut |
|---|-------|--------|
| 31.1 | Creer modele `Irrigation` : parcelleId, type ('pluie' \| 'goutte_a_goutte' \| 'aspersion' \| 'bassin' \| 'submersion'), frequence, quantiteEstimee (mm), date, observations | `[DONE]` |
| 31.2 | Creer modele `EvenementClimatique` : date, type ('secheresse' \| 'fortes_pluies' \| 'vent' \| 'inondation' \| 'grele'), impact, parcelleId, description | `[DONE]` |
| 31.3 | Service `IrrigationService` + `ClimatiqueService` avec mock data | `[DONE]` |
| 31.4 | Section irrigation dans parcelle-detail : historique arrosages, type systeme, alertes | `[DONE]` |
| 31.5 | Widget pluviometrie dans dashboard : graphique pluies derniers 30 jours | `[DONE]` |
| 31.6 | Indicateur stress hydrique dans la liste des parcelles (icone goutte) | `[DONE]` |
| 31.7 | Mock data : evenements climatiques realistes pour la saison en cours | `[DONE]` |

---

## Phase 32 — Main-d'oeuvre & Gestion Economique (Priorite P2)

| # | Tache | Statut |
|---|-------|--------|
| 32.1 | Enrichir modele `Membre` : `typeMainOeuvre` ('familial' \| 'journalier' \| 'groupement' \| 'permanent'), `coutJournalier` (FCFA) | `[DONE]` |
| 32.2 | Calculer cout main-d'oeuvre par tache depuis (nb personnes × cout journalier × duree) | `[DONE]` |
| 32.3 | Creer section "Bilan economique" dans parcelle-detail : cout intrants + cout main-d'oeuvre + cout transport | `[DONE]` |
| 32.4 | Ajouter champ `coutTransport` sur les mouvements de sortie intrants | `[DONE]` |
| 32.5 | Calculer marge brute automatique = Revenus - (Intrants + Main-d'oeuvre + Transport) | `[DONE]` |
| 32.6 | Tableau recapitulatif technico-economique par parcelle | `[DONE]` |
| 32.7 | Mettre a jour mock data membres avec types et couts realistes senegalais (3000-5000 FCFA/jour journalier) | `[DONE]` |
| 32.8 | Mettre a jour formulaire membre avec les nouveaux champs | `[DONE]` |

---

## Phase 33 — Rendement, Recolte & Pertes (Priorite P2)

| # | Tache | Statut |
|---|-------|--------|
| 33.1 | Creer modele `Recolte` : parcelleId, culture, variete, dateRecolte, quantiteRecoltee (kg), rendement (t/ha auto-calcule), pertesPostRecolte (kg), qualite ('A'\|'B'\|'C'), destination ('vente'\|'autoconsommation'\|'stockage'\|'transformation'), prixVente (FCFA/kg) | `[DONE]` |
| 33.2 | Service `RecolteService` avec CRUD + calcul rendement automatique (quantite / superficie) | `[DONE]` |
| 33.3 | Section recolte dans parcelle-detail : derniere recolte, rendement, comparaison vs precedent | `[DONE]` |
| 33.4 | Alerte si taux de perte > 30% (seuil critique FAO) | `[DONE]` |
| 33.5 | Graphique rendement par campagne (historique) dans parcelle-detail | `[DONE]` |
| 33.6 | Classement des parcelles par rendement dans rapports | `[DONE]` |
| 33.7 | Mock data : recoltes passees avec rendements realistes senegalais (riz: 4-6 t/ha irrigue, arachide: 0.8-1.5 t/ha, oignon: 20-30 t/ha) | `[DONE]` |

---

## Phase 34 — Observations Terrain ameliorees (Priorite P3)

| # | Tache | Statut |
|---|-------|--------|
| 34.1 | Enrichir observations visite : `problemeSol` (erosion, salinite, compaction), `problemeVent`, `problemeAnimaux` (divagation betail) | `[DONE]` |
| 34.2 | Ajouter `etatGeneral` note qualitative 1-5 etoiles | `[DONE]` |
| 34.3 | Ajouter `actionRecommandeeImmediate` — action urgente a prendre | `[DONE]` |
| 34.4 | Mettre a jour le formulaire visite avec les nouveaux champs | `[DONE]` |
| 34.5 | Afficher les problemes terrain dans le dashboard (top problemes) | `[DONE]` |

---

## Phase 35 — Historique & Rotation des Cultures (Priorite P3)

| # | Tache | Statut |
|---|-------|--------|
| 35.1 | Creer modele `HistoriqueCampagne` : parcelleId, annee, saison, culture, variete, rendement, observations | `[DONE]` |
| 35.2 | Timeline visuelle dans parcelle-detail : historique des campagnes (arachide → mil → niebe → ...) | `[DONE]` |
| 35.3 | Impact estime sur le sol : enrichissement azote pour legumineuses, appauvrissement pour cereales | `[DONE]` |
| 35.4 | Recommandation automatique de la prochaine culture basee sur la rotation optimale | `[DONE]` |
| 35.5 | Mock data : 2-3 campagnes passees par parcelle | `[DONE]` |

---

## Phase 36 — Planification & Recommandations Techniques (Priorite P3)

| # | Tache | Statut |
|---|-------|--------|
| 36.1 | Formulaire planification prochaine campagne : culture, variete, date semis prevue, besoins estimes | `[DONE]` |
| 36.2 | Estimation automatique besoins intrants depuis la superficie et les doses recommandees | `[DONE]` |
| 36.3 | Estimation besoins main-d'oeuvre par etape de la campagne | `[DONE]` |
| 36.4 | Budget previsionnel automatique : intrants + main-d'oeuvre + transport | `[DONE]` |
| 36.5 | Fiches techniques par culture (arachide, riz, oignon, tomate, mais, mil) — varietes recommandees, calendrier, doses | `[DONE]` |
| 36.6 | Alertes proactives basees sur le stade : "sarclage recommande a J+15 apres semis", "fertilisation NPK a la floraison" | `[DONE]` |
| 36.7 | Calendrier previsionnel des interventions genere automatiquement | `[DONE]` |

---

## Phase 37 — Rapports Technico-Economiques (Priorite P3)

| # | Tache | Statut |
|---|-------|--------|
| 37.1 | Rapport bilan par parcelle : investissements, rendement, marge brute, rentabilite | `[DONE]` |
| 37.2 | Rapport bilan par campagne : performance globale toutes parcelles | `[DONE]` |
| 37.3 | Comparaison entre parcelles (tableau croise) | `[DONE]` |
| 37.4 | Comparaison entre campagnes n vs n-1 | `[DONE]` |
| 37.5 | Export PDF rapport technico-economique complet | `[DONE]` |
| 37.6 | Export Excel avec donnees detaillees (intrants, main-d'oeuvre, recoltes) | `[DONE]` |

---

## Resume des nouvelles phases (28-37)

| Phase | Description | Priorite | Effort |
|-------|-------------|----------|--------|
| 28 | Enrichir modele Parcelle | P1 | 2-3 jours |
| 29 | Intrants ameliores | P1 | 2 jours |
| 30 | Workflow Campagne | P1 | 4-5 jours |
| 31 | Irrigation & Pluviometrie | P2 | 2-3 jours |
| 32 | Main-d'oeuvre & Economique | P2 | 3-4 jours |
| 33 | Rendement & Recolte | P2 | 2-3 jours |
| 34 | Observations Terrain | P3 | 1-2 jours |
| 35 | Historique & Rotation | P3 | 2-3 jours |
| 36 | Planification & Recommandations | P3 | 3-4 jours |
| 37 | Rapports Technico-Economiques | P3 | 2-3 jours |
| **TOTAL** | | | **~25-30 jours** |

### Ordre d'implementation recommande

```
Phase 28 (Parcelles) → Phase 29 (Intrants) → Phase 30 (Workflow Campagne)
         ↓                     ↓                        ↓
Phase 32 (Main-d'oeuvre) → Phase 33 (Recolte) → Phase 31 (Irrigation)
                                    ↓
Phase 34 (Observations) → Phase 35 (Rotation) → Phase 36 (Planification)
                                                         ↓
                                              Phase 37 (Rapports Technico-Eco)
```

> **P1 (Phases 28-30)** : Fondations metier — enrichir les donnees existantes et creer le workflow de campagne
> **P2 (Phases 31-33)** : Suivi complet — irrigation, couts, rendements
> **P3 (Phases 34-37)** : Intelligence — observations, rotation, planification, rapports avances

---

## Phase 38 — Corrections Build & Optimisations (Post-audit)

| # | Tache | Statut |
|---|-------|--------|
| 38.1 | Corriger 9 warnings NG8107 — optional chaining inutile dans `parcelles.component.ts` et `visite-form.component.ts` | `[DONE]` |
| 38.2 | Ajouter `allowedCommonJsDependencies` dans `angular.json` pour Leaflet, html2canvas, canvg et plugins (supprimer 20+ warnings CommonJS) | `[DONE]` |
| 38.3 | Ajuster budget initial de 300 kB a 600 kB (budget realiste pour Angular + Tailwind + Leaflet CSS) | `[DONE]` |

---

## Phase 39 — Apercu NDVI & Sante des Cultures (Priorite P2)

> Objectif : Afficher un apercu visuel de l'indice NDVI (Normalized Difference Vegetation Index) sur chaque parcelle pour permettre un controle rapide de la sante globale des cultures.

| # | Tache | Statut |
|---|-------|--------|
| 39.1 | Creer modele `NdviData` : parcelleId, date, ndviMoyen (0 a 1), ndviMin, ndviMax, resolution, source ('sentinel-2' \| 'landsat' \| 'drone'), zones[] (coordonnees + valeur NDVI locale) | `[DONE]` |
| 39.2 | Creer service `NdviService` : getNdviByParcelle(id), getHistoriqueNdvi(id, dateDebut, dateFin), getNdviActuel(id) — mock data avec valeurs realistes par stade de culture | `[DONE]` |
| 39.3 | Mock data NDVI : generer des donnees NDVI realistes par parcelle (semis: 0.1-0.2, levee: 0.3-0.4, tallage: 0.5-0.6, floraison: 0.7-0.8, maturation: 0.5-0.6, recolte: 0.2-0.3) + grille raster intra-parcelle avec variation spatiale | `[DONE]` |
| 39.4 | Creer carte NDVI SIG raster dans `parcelle-detail` : overlay Leaflet avec grille de rectangles colores par interpolation continue (rouge→vert), fond satellite Esri, contour parcelle en tirets blancs, tooltips valeur par pixel | `[DONE]` |
| 39.5 | Legende NDVI flottante SIG integree dans la carte : echelle gradient continu, labels interpretation, badge source/resolution | `[DONE]` |
| 39.6 | Integrer dans `parcelle-detail` : section "Sante des cultures (NDVI)" avec carte SIG raster, jauge circulaire SVG, stats min/max/resolution/pixels, repartition zonale (% sain/attention/stress) | `[DONE]` |
| 39.7 | Graphique historique NDVI dans parcelle-detail : courbe evolution NDVI sur la campagne en cours avec couleurs par point | `[DONE]` |
| 39.8 | Widget NDVI sur la carte des parcelles (`parcelles.component`) : couche NDVI toggleable avec polygones colores par NDVI moyen, popup enrichi avec valeur NDVI, colonne NDVI en vue liste/grille | `[DONE]` |
| 39.9 | Alertes NDVI : notification si NDVI chute de plus de 0.15 entre deux releves successifs (stress vegetation detecte) | `[DONE]` |
| 39.10 | KPI dashboard : card "Sante globale cultures" avec NDVI moyen toutes parcelles + barres de progression repartition (% sain, % attention, % stress) | `[DONE]` |
| 39.11 | Filtre parcelles par classe NDVI : "Sain (> 0.6)", "Attention (0.3-0.6)", "Stress (< 0.3)" dans le filtre de la liste | `[DONE]` |
| 39.12 | Dark mode et responsive pour tous les composants NDVI (carte, jauge, legende, KPI dashboard, filtres) | `[DONE]` |

---

## Phase 40 — Planification Campagne & Interventions dans Parcelle-Detail (Priorite P1)

> Objectif : Permettre de planifier une campagne et gerer toutes les interventions agricoles directement depuis la page detail d'une parcelle, sans naviguer ailleurs. L'utilisateur peut creer une campagne, ajouter/modifier/supprimer des interventions et suivre l'avancement depuis un seul ecran.

| # | Tache | Statut |
|---|-------|--------|
| 40.1 | Creer modele `Intervention` : id, parcelleId, campagneId, type ('preparation_sol' \| 'labour' \| 'billonnage' \| 'semis' \| 'irrigation' \| 'fertilisation' \| 'traitement_phyto' \| 'desherbage' \| 'sarclage' \| 'buttage' \| 'recolte' \| 'post_recolte'), datePrevue, dateRealisee, statut ('planifiee' \| 'en_cours' \| 'terminee' \| 'annulee'), observations, produitUtilise, dose, coutEstime (FCFA), coutReel (FCFA), responsableId, mainOeuvre (nb personnes), dureeEstimee (heures) | `[DONE]` |
| 40.2 | Creer service `InterventionService` : CRUD interventions, getByParcelle(id), getByCampagne(id), reordonner, marquer comme terminee | `[DONE]` |
| 40.3 | Mock data : interventions types pour 2-3 parcelles avec mix planifiees/en cours/terminees | `[DONE]` |
| 40.4 | Section "Planification campagne" dans parcelle-detail : bouton "Nouvelle campagne" → formulaire inline (culture, variete, type campagne, date debut, date fin prevue) | `[DONE]` |
| 40.5 | Affichage campagne active dans parcelle-detail : barre de progression, dates, culture, nombre d'interventions completees/total | `[DONE]` |
| 40.6 | Bouton "Ajouter intervention" dans parcelle-detail → formulaire modale : type (select avec icones), date prevue, produit, dose, cout estime, responsable, observations | `[DONE]` |
| 40.7 | Timeline/liste des interventions dans parcelle-detail : affichage chronologique avec icone par type, statut colore (vert = terminee, bleu = en cours, gris = planifiee, rouge = annulee), actions (editer, supprimer, marquer terminee) | `[DONE]` |
| 40.8 | Edition inline d'une intervention : clic sur une intervention → modale pre-remplie pour modifier | `[DONE]` |
| 40.9 | Action rapide "Marquer terminee" : renseigner date realisee + cout reel + observations de terrain | `[DONE]` |
| 40.10 | Templates d'interventions par culture : bouton "Generer le plan type" → pre-remplit les interventions standards selon la culture choisie (ex: arachide = preparation sol → semis → sarclage J+15 → fertilisation → traitement → recolte) | `[DONE]` |
| 40.11 | Resume financier des interventions dans parcelle-detail : cout total estime vs reel, repartition par type d'intervention (camembert/barres) | `[DONE]` |
| 40.12 | Calendrier mini des interventions dans parcelle-detail : vue mensuelle avec points colores par intervention planifiee/realisee | `[DONE]` |
| 40.13 | Alertes interventions : notification si une intervention planifiee est en retard (datePrevue < aujourd'hui et statut = 'planifiee') | `[DONE]` |
| 40.14 | Dark mode et responsive pour tous les composants de planification | `[DONE]` |

---

## Phase 41 — Cycle de vie Campagne : Cloture & Programmation (Priorite P1)

> Objectif : Permettre de cloturer une campagne active sur une parcelle et d'en programmer une nouvelle directement depuis la page detail parcelle. Une parcelle ne peut avoir qu'une seule campagne `en_cours` a la fois.

| # | Tache | Statut |
|---|-------|--------|
| 41.1 | Ajouter champs optionnels au modele `Campagne` : `rendementFinal` (t/ha), `observationsCloture` (texte libre) — `dateFin` existe deja | `[DONE]` |
| 41.2 | `CampagneService.cloturerCampagne(id, params)` : passer statut a `terminee`, renseigner dateFin + rendementFinal + observationsCloture, progressionPct=100 | `[DONE]` |
| 41.3 | `CampagneService.hasActiveCampagne(parcelleId)` : verifie si une campagne `en_cours` existe deja pour la parcelle | `[DONE]` |
| 41.4 | `CampagneService.activerCampagne(id)` : passer une campagne `planifiee` a `en_cours` | `[DONE]` |
| 41.5 | Modifier `CampagneService.creerCampagne()` : accepter param `planifiee?: boolean` pour creer avec statut `planifiee` au lieu de `en_cours` | `[DONE]` |
| 41.6 | Creer `ClotureCampagneFormComponent` (dialog) : formulaire date de cloture, rendement final (t/ha), observations, checkbox "Programmer une nouvelle campagne ensuite" | `[DONE]` |
| 41.7 | Creer `NouvelleCampagneFormComponent` (dialog) : formulaire culture, variete, type campagne, date semis, mode (lancer / programmer) | `[DONE]` |
| 41.8 | Parcelle-detail — bouton "Nouvelle campagne" dans header card Campagnes + empty state quand aucune campagne | `[DONE]` |
| 41.9 | Parcelle-detail — bouton "Cloturer" (stop_circle) par campagne `en_cours`, bouton "Demarrer" (play_circle) par campagne `planifiee` | `[DONE]` |
| 41.10 | Parcelle-detail — methodes `openCloturerCampagne()`, `openNouvelleCampagne()`, `activerCampagne()`, `reloadCampagnes()` avec enchainement cloture → programmation | `[DONE]` |
| 41.11 | Afficher `dateFin` dans la ligne campagne quand elle est renseignee | `[DONE]` |
| 41.12 | Garde : empecher de lancer une nouvelle campagne `en_cours` si une existe deja (toast warning) — autoriser `planifiee` en parallele | `[DONE]` |
| 41.13 | Dark mode et responsive pour les 2 dialogs et les nouveaux boutons | `[DONE]` |
| 41.14 | Verification build et regression | `[DONE]` |

---

## Phase 42 — Carte Publique (Profil Public)

> Objectif : Interface publique (sans authentification) avec carte Leaflet plein ecran
> affichant toutes les parcelles, panneau de filtres/details lateral, et points d'interet
> (village, marche, hopital, vendeur intrants, materiel agricole, source d'eau) pour
> chaque parcelle selectionnee. Emissions carbone par parcelle.

| # | Tache | Statut |
|---|-------|--------|
| 42.1 | Creer modele `PointOfInterest` et `CarbonEmission` dans `poi.model.ts` : categories (village, marche, source_eau, hopital, vendeur_intrants, materiel_agricole), coordonnees, telephone, email, site web, distance | `[DONE]` |
| 42.2 | Creer mock data POI (`poi.mock.ts`) : 6 POIs par parcelle (78 total) avec noms senegalais realistes, telephones +221, distances en km, coordonnees proches des parcelles | `[DONE]` |
| 42.3 | Creer mock data emissions carbone dans `poi.mock.ts` : 13 entries avec emissionKgCO2, emissionParHa, categorie (faible/moyen/eleve) | `[DONE]` |
| 42.4 | Creer `PublicMapService` : facade getPublicParcelles(), getPoisByParcelle(id), getCarbonEmissions(), getCarbonByParcelle(id) | `[DONE]` |
| 42.5 | Creer `CartePubliqueComponent` : layout plein ecran (header 48px + zone carte/panneau), standalone, OnPush, lazy-loaded | `[DONE]` |
| 42.6 | Header minimal : logo AgroAssist, titre "Carte publique des parcelles", bouton theme dark/light, bouton toggle panneau (mobile) | `[DONE]` |
| 42.7 | Carte Leaflet plein ecran : tuiles OSM/CartoDB (dark mode), centree Senegal, zoom 7, polygones colores par statut, circleMarkers, markerCluster | `[DONE]` |
| 42.8 | Panneau lateral (380px, collapsible) avec 2 onglets : Filtres et Details | `[DONE]` |
| 42.9 | Onglet Filtres : recherche par nom, select culture, select zone agroecologique, select statut, select source d'eau, select emission carbone, liste des parcelles filtrees cliquables | `[DONE]` |
| 42.10 | Selection parcelle : animation flyToBounds vers le polygone, surbrillance du polygone selectionne, passage auto a l'onglet Details | `[DONE]` |
| 42.11 | Onglet Details : fiche parcelle (nom, code, culture, superficie, type sol, source eau, zone, localite, stade, statut, emission CO2), bouton retour | `[DONE]` |
| 42.12 | Section POI dans Details : cartes avec icone par categorie, nom, distance, telephone, email, site web — clic sur carte → pan vers POI sur la carte avec popup | `[DONE]` |
| 42.13 | Marqueurs POI sur la carte : LayerGroup separe, divIcons colores par categorie, popups avec infos, affiches uniquement quand parcelle selectionnee | `[DONE]` |
| 42.14 | Legende carte (overlay bas-gauche) : couleurs par statut parcelle | `[DONE]` |
| 42.15 | Route `/carte-publique` dans app.routes.ts : hors shell, sans authGuard, lazy-loaded, titre "Carte des parcelles — AgroAssist" | `[DONE]` |
| 42.16 | Responsive : panneau overlay sur mobile (< 768px), slide-in/out, backdrop, auto-ouverture sur selection | `[DONE]` |
| 42.17 | Dark mode complet : tuiles CartoDB dark, panneau, header, legende, popups, cards POI | `[DONE]` |
| 42.18 | Stats overlay (top-right) : nombre de parcelles filtrees et total hectares | `[DONE]` |
| 42.19 | Verification build et regression | `[DONE]` |

---

## Phase 43 — Rapport PDF professionnel par parcelle

> **Objectif** : Generer un rapport PDF complet et professionnel pour chaque parcelle, incluant toutes les donnees disponibles, des graphiques, diagrammes, carte, entete soignee et mise en page magazine/agronomique.
>
> **Librairie cible** : `jspdf` (deja installe v4.2.1) + `html2canvas` (a installer) pour capturer les graphiques Chart.js et les cartes Leaflet en images.
>
> **Architecture** : Un service `PdfReportService` injectable qui orchestre la generation, + un bouton "Telecharger PDF" dans la page parcelle-detail.

### Analyse technique

**Donnees disponibles par parcelle (toutes chargees dans parcelle-detail) :**
- **Identification** : nom, code, zone, localite, producteurNom, technicienId, superficie, culture, variete, stade, statut
- **Terrain** : typeSol, zoneAgroecologique, sourceEau, modeAccesTerre, coordonnees, geometry
- **Campagne active** : culture, variete, typeCampagne, dateDebut, progressionPct, etapes
- **Campagnes passees** : historique avec rendementFinal, dates, culture
- **NDVI** : ndviMoyen, ndviMin, ndviMax, date, zones (raster), historique multi-dates
- **Visites** : date, technicien, observations (etatGeneral, maladiesDetectees, ravageursDetectes, tauxCouverture, hauteurPlantes), recommandations
- **Interventions** : type, datePrevue/Realisee, statut, coutEstime/Reel, produitUtilise, dose
- **Irrigation** : type, frequence, quantite, dates, bilan hydrique (stress, pluviometrie30j)
- **Intrants** : nom, type, quantite utilisee, date, unite, cout
- **Evenements climatiques** : type, impact, description, date
- **Rendement** : rendementPrecedent, evolution estimee

**Approche technique :**
1. Utiliser `jspdf` pour le layout page par page (A4 portrait)
2. Utiliser `html2canvas` pour capturer les graphiques Chart.js (rendement, NDVI historique) et la carte Leaflet (localisation + NDVI) en images bitmap
3. Generer les diagrammes circulaires/barres directement via Canvas API dans un canvas offscreen, puis les exporter en image
4. Design professionnel : palette verte agriculture, header avec logo/bandeau, footer avec pagination, sections bien delimitees

### Plan d'implementation

| # | Tache | Statut |
|---|-------|--------|
| 43.1 | Installer `html2canvas` (`npm install html2canvas`) pour capture des graphiques et cartes en image | `[DONE]` |
| 43.2 | Creer `src/app/core/services/pdf-report.service.ts` — service injectable standalone avec methode `generateParcelleReport(parcelle, data)` | `[DONE]` |
| 43.3 | Implementer la page de garde PDF : bandeau vert en-tete avec titre "Rapport de Parcelle", logo AgroAssist (texte stylise), nom parcelle, code, date de generation, zone, producteur, superficie | `[DONE]` |
| 43.4 | Section 1 — Fiche d'identite parcelle : tableau professionnel avec toutes les infos (culture, stade, type sol, source eau, zone agroeco, variete, mode acces terre, localite, coordonnees GPS) | `[DONE]` |
| 43.5 | Section 2 — Carte de localisation : capture canvas de la carte Leaflet (satellite + polygone parcelle) via html2canvas, inseree dans le PDF avec legende | `[DONE]` |
| 43.6 | Section 3 — Sante vegetale (NDVI) : capture de la carte NDVI (heatmap IDW sur satellite) + KPIs (moyen/min/max) + interpretation textuelle + legende couleur + date acquisition | `[DONE]` |
| 43.7 | Section 4 — Evolution NDVI : capture du graphique Chart.js historique NDVI (courbe moyen + min/max), tableau complementaire des valeurs | `[DONE]` |
| 43.8 | Section 5 — Campagne en cours : infos campagne (culture, type, dates, progression %), tableau des etapes avec statut, barre de progression visuelle | `[DONE]` |
| 43.9 | Section 6 — Interventions : tableau des interventions (type, date prevue/realisee, statut, produit, dose, cout estime/reel), total cout en bas | `[DONE]` |
| 43.10 | Section 7 — Bilan hydrique & irrigation : KPIs (pluviometrie 30j, stress, dernier arrosage), tableau irrigations, evenements climatiques | `[DONE]` |
| 43.11 | Section 8 — Visites terrain : tableau des visites (date, technicien, statut, etat general etoiles, maladies, ravageurs, taux couverture), resume observations cles | `[DONE]` |
| 43.12 | Section 9 — Intrants utilises : tableau des mouvements (intrant, quantite, unite, date, motif), cout total intrants | `[DONE]` |
| 43.13 | Section 10 — Rendement & performance : capture graphique rendement (Chart.js), comparaison avec rendementPrecedent, campagnes passees (tableau historique avec culture, dates, rendement final) | `[DONE]` |
| 43.14 | Diagramme circulaire : repartition des couts par categorie (intrants, main d'oeuvre, irrigation, traitements) — genere via Canvas API offscreen puis insere en image | `[DONE]` |
| 43.15 | Diagramme barre : comparaison rendement par campagne passee — genere via Canvas API offscreen | `[DONE]` |
| 43.16 | Footer professionnel sur chaque page : numero de page "Page X/Y", date de generation, mention "Genere par AgroAssist", ligne separatrice verte | `[DONE]` |
| 43.17 | Gestion automatique du saut de page : detecter quand le contenu depasse la hauteur utile (A4 - header - footer) et inserer un saut de page propre avec continuation du header | `[DONE]` |
| 43.18 | Ajouter bouton "Telecharger PDF" dans le header de `parcelle-detail.component.ts` (icone picture_as_pdf) avec loading state pendant la generation | `[DONE]` |
| 43.19 | Helper : methode `captureElementAsImage(elementRef)` qui utilise html2canvas pour convertir un element DOM (carte, graphique) en data URL PNG | `[DONE]` |
| 43.20 | Theme couleur du PDF : palette primaire (#1A7A4A vert fonce, #22c55e vert clair, #f8fafc fond clair), polices Helvetica (defaut jsPDF), titres gras, corps 10pt | `[DONE]` |
| 43.21 | Sommaire automatique en page 2 : liste des sections avec numero de page correspondant (liens internes si possible) | `[DONE]` |
| 43.22 | Gestion des donnees manquantes : chaque section verifie si les donnees existent, affiche "Aucune donnee disponible" en italique gris si absent, ne genere pas de section vide | `[DONE]` |
| 43.23 | Tests et optimisation : verifier le rendu sur differentes parcelles (avec/sans campagne, avec/sans NDVI, avec/sans visites), corriger les debordements de texte et alignements | `[DONE]` |
| 43.24 | Verification build et regression | `[DONE]` |
