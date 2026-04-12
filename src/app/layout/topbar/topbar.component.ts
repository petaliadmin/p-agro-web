import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, signal, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ParcelleService } from '../../core/services/parcelle.service';
import { VisiteService } from '../../core/services/visite.service';
import { TacheService } from '../../core/services/tache.service';
import { EquipeService } from '../../core/services/equipe.service';
import { IntrantService } from '../../core/services/intrant.service';
import { Notification } from '../../core/models/user.model';
import { Parcelle } from '../../core/models/parcelle.model';
import { Visite } from '../../core/models/visite.model';
import { Tache } from '../../core/models/tache.model';
import { Equipe } from '../../core/models/membre.model';
import { Intrant } from '../../core/models/intrant.model';
import { take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="fixed top-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm flex items-center px-6 transition-all duration-300"
      [style.left]="sidebarWidth + 'px'"
      style="height: 64px;"
    >
      <!-- Mobile hamburger -->
      <button
        *ngIf="isMobile"
        (click)="menuToggle.emit()"
        class="mr-4 text-gray-500 hover:text-gray-900"
        aria-label="Ouvrir le menu"
      >
        <span class="material-icons" aria-hidden="true">menu</span>
      </button>

      <!-- Mobile search button -->
      <div *ngIf="isMobile && !mobileSearchOpen" class="flex-1 flex items-center">
        <button (click)="openMobileSearch()" class="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 p-1" aria-label="Rechercher">
          <span class="material-icons text-[22px]" aria-hidden="true">search</span>
        </button>
      </div>

      <!-- Desktop search / Mobile full-screen search -->
      <div class="flex-1" [class.hidden]="isMobile && !mobileSearchOpen" [class.fixed]="isMobile && mobileSearchOpen"
        [class.inset-0]="isMobile && mobileSearchOpen" [class.z-50]="isMobile && mobileSearchOpen"
        [class.bg-white]="isMobile && mobileSearchOpen" [class.dark:bg-gray-800]="isMobile && mobileSearchOpen"
        [class.p-4]="isMobile && mobileSearchOpen">
        <div *ngIf="isMobile && mobileSearchOpen" class="flex items-center gap-2 mb-3">
          <button (click)="closeMobileSearch()" class="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100" aria-label="Fermer la recherche">
            <span class="material-icons text-[22px]" aria-hidden="true">arrow_back</span>
          </button>
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Rechercher</span>
        </div>
        <div class="relative" [class.max-w-md]="!isMobile">
          <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-[18px]" aria-hidden="true">search</span>
          <input
            #mobileSearchInput
            type="text"
            role="combobox"
            aria-label="Rechercher parcelle, visite, tâche"
            [attr.aria-expanded]="showSearchResults"
            aria-autocomplete="list"
            aria-controls="search-results-listbox"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
            (focus)="showSearchResults = searchQuery.length >= 2"
            (keydown)="onSearchKeydown($event)"
            placeholder="Rechercher parcelle, visite, tâche…"
            class="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
          />
          <!-- Loading indicator -->
          <div *ngIf="searching"
            class="absolute left-0 top-11 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 py-6 text-center">
            <div class="animate-spin w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p class="text-sm text-gray-500">Recherche en cours...</p>
          </div>
          <!-- Search results dropdown -->
          <div *ngIf="!searching && showSearchResults && (searchParcelles.length || searchVisites.length || searchTaches.length || searchEquipes.length || searchIntrants.length)"
            id="search-results-listbox" role="listbox" aria-label="Résultats de recherche"
            class="absolute left-0 top-11 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden max-h-96 overflow-y-auto">
            <!-- Parcelles -->
            <div *ngIf="searchParcelles.length">
              <p class="text-[10px] font-semibold text-gray-500 uppercase px-4 pt-3 pb-1">Parcelles</p>
              <div *ngFor="let p of searchParcelles" (click)="goTo('/parcelles/' + p.id)"
                class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <span class="material-icons text-green-600 text-[16px]" aria-hidden="true">agriculture</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ p.nom }}</p>
                  <p class="text-xs text-gray-500">{{ p.code }} · {{ p.culture }} · {{ p.superficie }} ha</p>
                </div>
              </div>
            </div>
            <!-- Visites -->
            <div *ngIf="searchVisites.length">
              <p class="text-[10px] font-semibold text-gray-500 uppercase px-4 pt-3 pb-1">Visites</p>
              <div *ngFor="let v of searchVisites" (click)="goTo('/visites/' + v.id)"
                class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <span class="material-icons text-blue-600 text-[16px]" aria-hidden="true">visibility</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">Visite du {{ v.date | date:'dd/MM/yyyy' }}</p>
                  <p class="text-xs text-gray-500">{{ getParcelleNom(v.parcelleId) }} · {{ v.statut }}</p>
                </div>
              </div>
            </div>
            <!-- Tâches -->
            <div *ngIf="searchTaches.length">
              <p class="text-[10px] font-semibold text-gray-500 uppercase px-4 pt-3 pb-1">Tâches</p>
              <div *ngFor="let t of searchTaches" (click)="goTo('/taches')"
                class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <span class="material-icons text-orange-600 text-[16px]" aria-hidden="true">task_alt</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ t.titre }}</p>
                  <p class="text-xs text-gray-500">{{ t.type }} · {{ t.priorite }}</p>
                </div>
              </div>
            </div>
            <!-- Équipes -->
            <div *ngIf="searchEquipes.length">
              <p class="text-[10px] font-semibold text-gray-500 uppercase px-4 pt-3 pb-1">Équipes</p>
              <div *ngFor="let e of searchEquipes" (click)="goTo('/equipes')"
                class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <span class="material-icons text-purple-600 text-[16px]" aria-hidden="true">group</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ e.nom }}</p>
                  <p class="text-xs text-gray-500">{{ e.zone }} · {{ e.membres.length }} membres</p>
                </div>
              </div>
            </div>
            <!-- Intrants -->
            <div *ngIf="searchIntrants.length">
              <p class="text-[10px] font-semibold text-gray-500 uppercase px-4 pt-3 pb-1">Intrants</p>
              <div *ngFor="let i of searchIntrants" (click)="goTo('/intrants')"
                class="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <span class="material-icons text-teal-600 text-[16px]" aria-hidden="true">inventory_2</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ i.nom }}</p>
                  <p class="text-xs text-gray-500">{{ i.type }} · {{ i.quantiteStock }} {{ i.unite }}</p>
                </div>
              </div>
            </div>
          </div>
          <!-- No results -->
          <div *ngIf="!searching && showSearchResults && searchQuery.length >= 2 && !searchParcelles.length && !searchVisites.length && !searchTaches.length && !searchEquipes.length && !searchIntrants.length"
            class="absolute left-0 top-11 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 py-6 text-center">
            <span class="material-icons text-gray-300 text-[24px] block mb-1" aria-hidden="true">search_off</span>
            <p class="text-sm text-gray-500">Aucun résultat pour « {{ searchQuery }} »</p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 ml-4">
        <!-- Notifications -->
        <div class="relative">
          <button
            (click)="toggleNotifs()"
            class="relative w-11 h-11 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Notifications"
          >
            <span class="material-icons text-[20px]" aria-hidden="true">notifications</span>
            <span
              *ngIf="notifCount() > 0"
              class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
            >{{ notifCount() }}</span>
          </button>

          <!-- Dropdown notifications -->
          <div
            *ngIf="showNotifs"
            class="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
          >
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
              <button (click)="marquerToutesLues()" class="text-xs text-primary-600 hover:text-primary-800 font-medium" aria-label="Marquer toutes les notifications comme lues">
                Tout lire
              </button>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div
                *ngFor="let notif of notifications; trackBy: trackById"
                (click)="onNotifClick(notif)"
                class="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-700"
                [class.bg-primary-50]="!notif.lue"
              >
                <div class="flex-shrink-0 mt-0.5">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-[13px]"
                    [class.bg-red-500]="notif.type === 'alerte'"
                    [class.bg-yellow-500]="notif.type === 'avertissement'"
                    [class.bg-primary-600]="notif.type === 'info'"
                    [class.bg-green-500]="notif.type === 'succes'"
                  >
                    <span class="material-icons text-[14px]" aria-hidden="true">
                      {{ notif.type === 'alerte' ? 'warning' : notif.type === 'succes' ? 'check_circle' : notif.type === 'avertissement' ? 'info' : 'info' }}
                    </span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight" [class.font-semibold]="!notif.lue">{{ notif.titre }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{{ notif.message }}</p>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{{ notif.date | date:'dd/MM · HH:mm' }}</p>
                </div>
                <div class="flex-shrink-0 mt-2 flex items-center gap-1">
                  <div *ngIf="!notif.lue" class="w-2 h-2 rounded-full bg-primary-600"></div>
                  <span *ngIf="notif.lienType && notif.lienId" class="material-icons text-[14px] text-gray-400" aria-hidden="true">chevron_right</span>
                </div>
              </div>
            </div>
            <a routerLink="/notifications" (click)="showNotifs = false"
              class="block text-center text-xs text-primary-600 hover:text-primary-800 font-medium py-3 border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Voir toutes les notifications
            </a>
          </div>
        </div>

        <!-- Divider -->
        <div class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

        <!-- User menu -->
        <div class="relative">
          <button
            (click)="toggleUserMenu()"
            class="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2 py-1.5 transition-colors"
            aria-label="Menu utilisateur"
          >
            <img *ngIf="userAvatar" [src]="userAvatar" alt="Avatar" class="w-8 h-8 rounded-full object-cover"/>
            <div *ngIf="!userAvatar" class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
              {{ userInitials }}
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">{{ userName }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ userRole }}</p>
            </div>
            <span class="material-icons text-gray-500 text-[16px] hidden md:block" aria-hidden="true">expand_more</span>
          </button>

          <div *ngIf="showUserMenu" class="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 py-1">
            <a routerLink="/profil" (click)="showUserMenu = false" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
              <span class="material-icons text-[16px] text-gray-500 dark:text-gray-400" aria-hidden="true">person</span> Mon profil
            </a>
            <a routerLink="/parametres" (click)="showUserMenu = false" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
              <span class="material-icons text-[16px] text-gray-500 dark:text-gray-400" aria-hidden="true">settings</span> Paramètres
            </a>
            <div class="border-t border-gray-100 dark:border-gray-700 my-1"></div>
            <button (click)="logout()" class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="Se déconnecter">
              <span class="material-icons text-[16px]" aria-hidden="true">logout</span> Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Backdrop fermeture dropdowns -->
    <div *ngIf="showNotifs || showUserMenu || showSearchResults" (click)="closeAll()" class="fixed inset-0 z-40"></div>
  `,
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Input() sidebarWidth = 256;
  @Input() isMobile = false;
  @Output() menuToggle = new EventEmitter<void>();
  @ViewChild('mobileSearchInput') mobileSearchInput?: ElementRef<HTMLInputElement>;

  searchQuery = '';
  showNotifs = false;
  showUserMenu = false;
  showSearchResults = false;
  mobileSearchOpen = false;
  searchActiveIndex = -1;
  notifications: Notification[] = [];
  notifCount = signal(0);

  searching = false;
  private searchSubject$ = new Subject<string>();
  private searchSub?: Subscription;
  private allParcelles: Parcelle[] = [];
  private allVisites: Visite[] = [];
  private allTaches: Tache[] = [];
  private allEquipes: Equipe[] = [];
  private allIntrants: Intrant[] = [];
  searchParcelles: Parcelle[] = [];
  searchVisites: Visite[] = [];
  searchTaches: Tache[] = [];
  searchEquipes: Equipe[] = [];
  searchIntrants: Intrant[] = [];

  constructor(
    private notifService: NotificationService,
    private auth: AuthService,
    private parcelleService: ParcelleService,
    private visiteService: VisiteService,
    private tacheService: TacheService,
    private equipeService: EquipeService,
    private intrantService: IntrantService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.notifService.getAll().subscribe(n => {
      this.notifications = n;
      this.cdr.markForCheck();
    });
    this.notifService.countNonLues().subscribe(c => {
      this.notifCount.set(c);
      this.cdr.markForCheck();
    });
    forkJoin({
      parcelles: this.parcelleService.getAll().pipe(take(1)),
      visites: this.visiteService.getAll().pipe(take(1)),
      taches: this.tacheService.getAll().pipe(take(1)),
      equipes: this.equipeService.getAll().pipe(take(1)),
      intrants: this.intrantService.getAll().pipe(take(1)),
    }).subscribe(data => {
      this.allParcelles = data.parcelles;
      this.allVisites = data.visites;
      this.allTaches = data.taches;
      this.allEquipes = data.equipes;
      this.allIntrants = data.intrants;
    });

    // Debounced search
    this.searchSub = this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(q => this.executeSearch(q));
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  get userName(): string {
    const u = this.auth.getCurrentUser();
    return u ? `${u.prenom} ${u.nom}` : '';
  }

  get userInitials(): string {
    const u = this.auth.getCurrentUser();
    return u ? `${u.prenom[0]}${u.nom[0]}`.toUpperCase() : 'U';
  }

  get userAvatar(): string | undefined {
    return this.auth.getCurrentUser()?.avatar;
  }

  get userRole(): string {
    return this.auth.getRole();
  }

  toggleNotifs(): void {
    this.showNotifs = !this.showNotifs;
    this.showUserMenu = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifs = false;
  }

  closeAll(): void {
    this.showNotifs = false;
    this.showUserMenu = false;
    this.showSearchResults = false;
    this.mobileSearchOpen = false;
  }

  openMobileSearch(): void {
    this.mobileSearchOpen = true;
    this.cdr.markForCheck();
    setTimeout(() => this.mobileSearchInput?.nativeElement?.focus(), 50);
  }

  closeMobileSearch(): void {
    this.mobileSearchOpen = false;
    this.searchQuery = '';
    this.showSearchResults = false;
    this.searchParcelles = [];
    this.searchVisites = [];
    this.searchTaches = [];
    this.searchEquipes = [];
    this.searchIntrants = [];
    this.cdr.markForCheck();
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.showSearchResults = false;
      this.mobileSearchOpen = false;
      this.cdr.markForCheck();
      return;
    }
    if (!this.showSearchResults) return;
    const allResults = [
      ...this.searchParcelles.map(p => '/parcelles/' + p.id),
      ...this.searchVisites.map(v => '/visites/' + v.id),
      ...this.searchTaches.map(() => '/taches'),
      ...this.searchEquipes.map(() => '/equipes'),
      ...this.searchIntrants.map(() => '/intrants'),
    ];
    if (!allResults.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.searchActiveIndex = Math.min(this.searchActiveIndex + 1, allResults.length - 1);
      this.cdr.markForCheck();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.searchActiveIndex = Math.max(this.searchActiveIndex - 1, 0);
      this.cdr.markForCheck();
    } else if (event.key === 'Enter' && this.searchActiveIndex >= 0) {
      event.preventDefault();
      this.goTo(allResults[this.searchActiveIndex]);
    }
  }

  onSearch(): void {
    this.searching = true;
    this.searchActiveIndex = -1;
    this.cdr.markForCheck();
    this.searchSubject$.next(this.searchQuery);
  }

  private executeSearch(raw: string): void {
    const q = raw.trim().toLowerCase();
    if (q.length < 2) {
      this.showSearchResults = false;
      this.searching = false;
      this.searchParcelles = [];
      this.searchVisites = [];
      this.searchTaches = [];
      this.searchEquipes = [];
      this.searchIntrants = [];
      this.cdr.markForCheck();
      return;
    }
    this.showSearchResults = true;

    this.searchParcelles = this.allParcelles.filter(p =>
      p.nom.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.culture.toLowerCase().includes(q)
    ).slice(0, 5);
    this.searchVisites = this.allVisites.filter(v => {
      const parcelle = this.allParcelles.find(p => p.id === v.parcelleId);
      return parcelle?.nom.toLowerCase().includes(q) || v.parcelleId.toLowerCase().includes(q);
    }).slice(0, 5);
    this.searchTaches = this.allTaches.filter(t =>
      t.titre.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.type.toLowerCase().includes(q)
    ).slice(0, 5);
    this.searchEquipes = this.allEquipes.filter(e =>
      e.nom.toLowerCase().includes(q) || e.zone.toLowerCase().includes(q)
    ).slice(0, 5);
    this.searchIntrants = this.allIntrants.filter(i =>
      i.nom.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)
    ).slice(0, 5);
    this.searching = false;
    this.cdr.markForCheck();
  }

  getParcelleNom(id: string): string {
    return this.allParcelles.find(p => p.id === id)?.nom ?? id;
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
    this.searchQuery = '';
    this.showSearchResults = false;
    this.mobileSearchOpen = false;
    this.searchParcelles = [];
    this.searchVisites = [];
    this.searchTaches = [];
    this.searchEquipes = [];
    this.searchIntrants = [];
  }

  marquerLue(notif: Notification): void {
    this.notifService.marquerLue(notif.id);
  }

  onNotifClick(notif: Notification): void {
    this.marquerLue(notif);
    this.showNotifs = false;
    if (notif.lienType && notif.lienId) {
      const routes: Record<string, string> = {
        parcelle: '/parcelles',
        visite: '/visites',
        tache: '/taches',
        intrant: '/intrants',
      };
      const base = routes[notif.lienType];
      if (base) {
        this.router.navigate([base, notif.lienId]);
      }
    }
  }

  marquerToutesLues(): void {
    this.notifService.marquerToutesLues();
    this.showNotifs = false;
  }

  logout(): void {
    this.auth.logout();
  }

  trackById(_: number, item: Notification): string {
    return item.id;
  }
}
