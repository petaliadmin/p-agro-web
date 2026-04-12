import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { TacheService } from '../../core/services/tache.service';
import { take } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300"
      [class.w-64]="!collapsed"
      [class.w-16]="collapsed"
      style="background: #1A7A4A;"
    >
      <!-- Logo -->
      <div class="flex items-center border-b border-white/10" [class.px-4]="!collapsed" [class.px-2]="collapsed" [class.py-5]="!collapsed" [class.py-3]="collapsed" [class.justify-center]="collapsed" [class.gap-3]="!collapsed">
        <div *ngIf="!collapsed" class="flex-shrink-0 w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white" opacity="0.3"/>
            <path d="M17 8c0-2.76-2.24-5-5-5S7 5.24 7 8c0 1.5.66 2.85 1.7 3.79L12 15l3.3-3.21A4.97 4.97 0 0017 8z" fill="white"/>
          </svg>
        </div>
        <div *ngIf="!collapsed" class="overflow-hidden flex-1">
          <p class="text-white font-bold text-base leading-tight">AgroAssist</p>
          <p class="text-white/60 text-xs">Supervision agricole</p>
        </div>
        <button
          (click)="onCollapse()"
          class="text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center w-9 h-9 flex-shrink-0"
          [class.ml-auto]="!collapsed"
          [attr.aria-label]="collapsed ? 'Agrandir la barre de navigation' : 'Réduire la barre de navigation'"
          [attr.aria-expanded]="!collapsed"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" [class.rotate-180]="collapsed" class="transition-transform duration-200">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
      </div>

      <!-- User role badge -->
      <div *ngIf="!collapsed" class="px-4 py-3 border-b border-white/10">
        <div class="flex items-center gap-2">
          <img *ngIf="userAvatar" [src]="userAvatar" alt="Avatar" class="w-7 h-7 rounded-full object-cover"/>
          <div *ngIf="!userAvatar" class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
            {{ userInitials }}
          </div>
          <div class="overflow-hidden">
            <p class="text-white text-xs font-medium truncate">{{ userName }}</p>
            <span class="inline-block bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full capitalize">
              {{ userRole }}
            </span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4 overflow-y-auto scrollbar-hide">
        <div class="space-y-0.5 px-2">
          <ng-container *ngFor="let item of navItems; trackBy: trackByRoute">
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-white/15 text-white"
              #rla="routerLinkActive"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-all duration-150 group relative"
              [title]="collapsed ? item.label : ''"
              [attr.aria-label]="item.label"
              [attr.aria-current]="rla.isActive ? 'page' : null"
            >
              <span class="flex-shrink-0 material-icons text-[20px]" aria-hidden="true">{{ item.icon }}</span>
              <span *ngIf="!collapsed" class="text-sm font-medium flex-1 whitespace-nowrap">{{ item.label }}</span>
              <span
                *ngIf="item.badge && item.badge > 0 && !collapsed"
                class="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center"
              >{{ item.badge }}</span>
              <span
                *ngIf="item.badge && item.badge > 0 && collapsed"
                class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
              >{{ item.badge }}</span>
            </a>
          </ng-container>
        </div>

        <!-- Section Analyse -->
        <div *ngIf="!collapsed" class="mt-6 px-4 mb-2">
          <p class="text-white/40 text-[10px] font-semibold uppercase tracking-widest">Analyse</p>
        </div>
        <div class="space-y-0.5 px-2">
          <ng-container *ngFor="let item of analyticsItems; trackBy: trackByRoute">
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-white/15 text-white"
              #rlaAnalytics="routerLinkActive"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-all duration-150"
              [title]="collapsed ? item.label : ''"
              [attr.aria-label]="item.label"
              [attr.aria-current]="rlaAnalytics.isActive ? 'page' : null"
            >
              <span class="flex-shrink-0 material-icons text-[20px]" aria-hidden="true">{{ item.icon }}</span>
              <span *ngIf="!collapsed" class="text-sm font-medium whitespace-nowrap">{{ item.label }}</span>
            </a>
          </ng-container>
        </div>
      </nav>

      <!-- Logout -->
      <div class="p-3 border-t border-white/10">
        <button
          (click)="logout()"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Se déconnecter"
        >
          <span class="material-icons text-[20px]" aria-hidden="true">logout</span>
          <span *ngIf="!collapsed" class="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Input() urgentCount = 0;
  @Input() alerteCount = 0;
  @Output() collapsedChange = new EventEmitter<boolean>();

  notifCount = 0;

  constructor(
    private auth: AuthService,
    private notificationService: NotificationService,
    private tacheService: TacheService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.notificationService.countNonLues().subscribe(count => {
      this.notifCount = count;
      this.updateNotifBadge();
      this.cdr.markForCheck();
    });

    this.tacheService.getAll().pipe(take(1)).subscribe(taches => {
      const urgentCount = taches.filter(t =>
        t.priorite === 'urgent' && t.statut !== 'done'
      ).length;
      const tacheItem = this.navItems.find(n => n.route === '/taches');
      if (tacheItem) {
        tacheItem.badge = urgentCount;
      }
      this.cdr.markForCheck();
    });
  }

  private updateNotifBadge(): void {
    const notifItem = this.navItems.find(n => n.route === '/notifications');
    if (notifItem) {
      notifItem.badge = this.notifCount;
    }
  }

  get userName(): string {
    const u = this.auth.getCurrentUser();
    return u ? `${u.prenom} ${u.nom}` : 'Utilisateur';
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

  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard' },
    { label: 'Parcelles', icon: 'landscape', route: '/parcelles' },
    { label: 'Visites', icon: 'fact_check', route: '/visites' },
    { label: 'Tâches', icon: 'task_alt', route: '/taches' },
    { label: 'Équipes', icon: 'group', route: '/equipes' },
    { label: 'Intrants', icon: 'inventory_2', route: '/intrants' },
    { label: 'Notifications', icon: 'notifications', route: '/notifications', badge: 0 },
  ];

  analyticsItems: NavItem[] = [
    { label: 'Rapports', icon: 'bar_chart', route: '/rapports' },
  ];

  onCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  logout(): void {
    this.auth.logout();
  }

  trackByRoute(_: number, item: NavItem): string {
    return item.route;
  }
}
