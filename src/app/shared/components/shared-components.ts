import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// ============================================================
// StatusChipComponent
// ============================================================
@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [ngClass]="badgeClass" class="inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-0.5">
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass"></span>
      {{ label }}
    </span>
  `,
})
export class StatusChipComponent {
  @Input() statut: 'sain' | 'attention' | 'urgent' | 'planifie' | 'done' | 'en_cours' | 'recolte' | 'completee' | 'planifiee' | 'todo' | 'reporte' = 'sain';

  get badgeClass(): string {
    const map: Record<string, string> = {
      sain: 'bg-green-100 text-green-800',
      completee: 'bg-green-100 text-green-800',
      done: 'bg-gray-100 text-gray-700',
      attention: 'bg-yellow-100 text-yellow-800',
      en_cours: 'bg-blue-100 text-blue-800',
      urgent: 'bg-red-100 text-red-800',
      planifie: 'bg-blue-100 text-blue-800',
      planifiee: 'bg-blue-100 text-blue-800',
      recolte: 'bg-purple-100 text-purple-800',
      todo: 'bg-gray-100 text-gray-700',
      reporte: 'bg-orange-100 text-orange-800',
    };
    return map[this.statut] ?? 'bg-gray-100 text-gray-600';
  }

  get dotClass(): string {
    const map: Record<string, string> = {
      sain: 'bg-green-500', completee: 'bg-green-500',
      done: 'bg-gray-400',
      attention: 'bg-yellow-500',
      en_cours: 'bg-blue-500',
      urgent: 'bg-red-500',
      planifie: 'bg-blue-400', planifiee: 'bg-blue-400',
      recolte: 'bg-purple-500',
      todo: 'bg-gray-400',
      reporte: 'bg-orange-500',
    };
    return map[this.statut] ?? 'bg-gray-400';
  }

  get label(): string {
    const map: Record<string, string> = {
      sain: 'Sain', attention: 'Attention', urgent: 'Urgent',
      planifie: 'Planifié', planifiee: 'Planifiée', done: 'Terminé',
      en_cours: 'En cours', recolte: 'Récolte', completee: 'Complétée',
      todo: 'À faire', reporte: 'Reporté',
    };
    return map[this.statut] ?? this.statut;
  }
}

// ============================================================
// AvatarComponent
// ============================================================
@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [class]="sizeClass"
      class="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      [style.background]="bgColor"
      [title]="nom + ' ' + prenom"
    >
      {{ initials }}
    </div>
  `,
})
export class AvatarComponent {
  @Input() nom = '';
  @Input() prenom = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get initials(): string {
    return `${this.prenom[0] ?? ''}${this.nom[0] ?? ''}`.toUpperCase();
  }

  get sizeClass(): string {
    return { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }[this.size];
  }

  get bgColor(): string {
    const colors = ['#1A7A4A','#0D6B5E','#2563EB','#7C3AED','#DB2777','#EA580C','#0891B2'];
    const hash = (this.nom + this.prenom).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
}

// ============================================================
// AlertBadgeComponent
// ============================================================
@Component({
  selector: 'app-alert-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span *ngIf="count > 0"
      class="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-white text-[10px] font-bold px-1.5"
      [class.bg-red-500]="type === 'danger'"
      [class.bg-yellow-500]="type === 'warning'"
    >{{ count }}</span>
  `,
})
export class AlertBadgeComponent {
  @Input() count = 0;
  @Input() type: 'danger' | 'warning' = 'danger';
}

// ============================================================
// LoadingSkeletonComponent
// ============================================================
@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-3">
      <div *ngFor="let i of rowsArray" class="flex gap-4 items-center px-4 py-3">
        <div class="skeleton w-8 h-8 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton h-3 rounded" [style.width]="widths[i % widths.length]"></div>
          <div class="skeleton h-2.5 rounded w-1/3"></div>
        </div>
        <div class="skeleton h-5 w-16 rounded-full"></div>
        <div class="skeleton h-8 w-8 rounded-lg"></div>
      </div>
    </div>
  `,
})
export class LoadingSkeletonComponent {
  @Input() rows = 5;
  widths = ['60%', '75%', '55%', '80%', '65%'];
  get rowsArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}

// ============================================================
// LoadingOverlayComponent
// ============================================================
@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="visible" class="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 rounded-xl backdrop-blur-sm">
      <div class="flex flex-col items-center gap-2">
        <div class="animate-spin w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full"></div>
        <p *ngIf="message" class="text-sm text-gray-600 dark:text-gray-300">{{ message }}</p>
      </div>
    </div>
  `,
})
export class LoadingOverlayComponent {
  @Input() visible = false;
  @Input() message?: string;
}

// ============================================================
// EmptyStateComponent
// ============================================================
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        [class.bg-gray-100]="type === 'no-data'"
        [class.bg-yellow-50]="type === 'no-results'"
        [class.bg-red-50]="type === 'error'">
        <span class="material-icons text-[32px]" aria-hidden="true"
          [class.text-gray-500]="type === 'no-data'"
          [class.text-yellow-500]="type === 'no-results'"
          [class.text-red-500]="type === 'error'">{{ effectiveIcon }}</span>
      </div>
      <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ title }}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{{ subtitle }}</p>
      <div class="flex items-center gap-3 mt-5">
        <button
          *ngIf="type === 'no-results'"
          (click)="actionClick.emit()"
          class="btn-secondary flex items-center gap-2"
        >
          <span class="material-icons text-[16px]" aria-hidden="true">filter_list_off</span>
          Réinitialiser les filtres
        </button>
        <button
          *ngIf="type === 'error'"
          (click)="actionClick.emit()"
          class="btn-primary flex items-center gap-2"
        >
          <span class="material-icons text-[16px]" aria-hidden="true">refresh</span>
          Réessayer
        </button>
        <button
          *ngIf="actionLabel && type === 'no-data'"
          (click)="actionClick.emit()"
          class="btn-primary flex items-center gap-2"
        >
          <span class="material-icons text-[16px]" aria-hidden="true">add</span>
          {{ actionLabel }}
        </button>
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Aucun élément';
  @Input() subtitle = 'Il n\'y a rien à afficher ici.';
  @Input() type: 'no-data' | 'no-results' | 'error' = 'no-data';
  @Input() actionLabel?: string;
  @Output() actionClick = new EventEmitter<void>();

  get effectiveIcon(): string {
    if (this.icon !== 'inbox') return this.icon;
    const defaults: Record<string, string> = {
      'no-data': 'inbox',
      'no-results': 'search_off',
      'error': 'error_outline',
    };
    return defaults[this.type] ?? 'inbox';
  }
}

// ============================================================
// PageHeaderComponent
// ============================================================
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-6">
      <nav *ngIf="breadcrumbs?.length" class="flex items-center gap-1.5 mb-2">
        <ng-container *ngFor="let crumb of breadcrumbs; let last = last; let i = index">
          <span *ngIf="i > 0" class="text-gray-300 text-xs">/</span>
          <a *ngIf="!last && crumb.route" [routerLink]="crumb.route"
            class="text-xs text-primary-600 font-medium hover:text-primary-800 transition-colors cursor-pointer">{{ crumb.label }}</a>
          <span *ngIf="!last && !crumb.route" class="text-xs text-gray-500 font-medium">{{ crumb.label }}</span>
          <span *ngIf="last" class="text-xs text-gray-500">{{ crumb.label }}</span>
        </ng-container>
      </nav>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title">{{ title }}</h1>
          <p *ngIf="subtitle" class="text-sm text-gray-500 mt-0.5">{{ subtitle }}</p>
        </div>
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() breadcrumbs?: { label: string; route?: string }[];
}
