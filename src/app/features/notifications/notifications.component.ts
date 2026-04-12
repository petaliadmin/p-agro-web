import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeaderComponent, EmptyStateComponent } from '../../shared/components/shared-components';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/user.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Notifications" subtitle="Centre de notifications">
      <button (click)="marquerToutesLues()" class="btn-secondary text-sm flex items-center gap-2" [disabled]="!hasUnread">
        <span class="material-icons text-[16px]" aria-hidden="true">done_all</span> Tout marquer comme lu
      </button>
    </app-page-header>

    <!-- Filtres -->
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <div class="flex items-center bg-gray-100 rounded-lg p-1">
        <button *ngFor="let f of filtres" (click)="filtreActif = f.id; applyFilters()"
          class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          [class.bg-white]="filtreActif === f.id" [class.shadow-sm]="filtreActif === f.id">
          {{ f.label }}
          <span *ngIf="f.count > 0" class="ml-1 bg-primary-100 text-primary-700 rounded-full px-1.5 py-0.5 text-[10px] font-bold">{{ f.count }}</span>
        </button>
      </div>
      <select [(ngModel)]="filtreType" (ngModelChange)="applyFilters()"
        class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
        <option value="">Tous les types</option>
        <option value="alerte">Alertes</option>
        <option value="info">Informations</option>
        <option value="succes">Succès</option>
        <option value="avertissement">Avertissements</option>
      </select>
    </div>

    <!-- Liste -->
    <div class="card overflow-hidden">
      <div *ngIf="!filtered.length" class="py-12">
        <app-empty-state icon="notifications_off" title="Aucune notification" subtitle="Vous êtes à jour !"></app-empty-state>
      </div>
      <div class="divide-y divide-gray-50">
        <div *ngFor="let n of filtered; trackBy: trackById"
          (click)="marquerLue(n)"
          class="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
          [class.bg-primary-50]="!n.lue">
          <div class="flex-shrink-0 mt-0.5">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-white"
              [class.bg-red-500]="n.type === 'alerte'"
              [class.bg-yellow-500]="n.type === 'avertissement'"
              [class.bg-primary-600]="n.type === 'info'"
              [class.bg-green-500]="n.type === 'succes'">
              <span class="material-icons text-[18px]" aria-hidden="true">{{ iconForType(n.type) }}</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-gray-900" [class.font-semibold]="!n.lue">{{ n.titre }}</p>
              <span class="text-[10px] rounded-full px-2 py-0.5 font-medium capitalize"
                [class.bg-red-100]="n.type === 'alerte'" [class.text-red-700]="n.type === 'alerte'"
                [class.bg-yellow-100]="n.type === 'avertissement'" [class.text-yellow-700]="n.type === 'avertissement'"
                [class.bg-blue-100]="n.type === 'info'" [class.text-blue-700]="n.type === 'info'"
                [class.bg-green-100]="n.type === 'succes'" [class.text-green-700]="n.type === 'succes'">
                {{ n.type }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mt-0.5">{{ n.message }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ n.date | date:'dd/MM/yyyy · HH:mm' }}</p>
          </div>
          <div class="flex-shrink-0 mt-2 flex items-center gap-2">
            <div *ngIf="!n.lue" class="w-2.5 h-2.5 rounded-full bg-primary-600"></div>
            <span *ngIf="n.lienType && n.lienId" class="material-icons text-[16px] text-gray-400" aria-hidden="true">chevron_right</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filtered: Notification[] = [];
  filtreActif = 'toutes';
  filtreType = '';

  get hasUnread(): boolean {
    return this.notifications.some(n => !n.lue);
  }

  filtres = [
    { id: 'toutes', label: 'Toutes', count: 0 },
    { id: 'non_lues', label: 'Non lues', count: 0 },
    { id: 'lues', label: 'Lues', count: 0 },
  ];

  constructor(
    private notifService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.notifService.getAll().subscribe(notifs => {
      this.notifications = notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.updateCounts();
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }

  updateCounts(): void {
    this.filtres[0].count = this.notifications.length;
    this.filtres[1].count = this.notifications.filter(n => !n.lue).length;
    this.filtres[2].count = this.notifications.filter(n => n.lue).length;
  }

  applyFilters(): void {
    let result = [...this.notifications];
    if (this.filtreActif === 'non_lues') result = result.filter(n => !n.lue);
    if (this.filtreActif === 'lues') result = result.filter(n => n.lue);
    if (this.filtreType) result = result.filter(n => n.type === this.filtreType);
    this.filtered = result;
  }

  marquerLue(n: Notification): void {
    if (!n.lue) {
      this.notifService.marquerLue(n.id);
      n.lue = true;
      this.updateCounts();
      this.cdr.markForCheck();
    }
    this.navigateToEntity(n);
  }

  private navigateToEntity(n: Notification): void {
    if (!n.lienType || !n.lienId) return;
    const routes: Record<string, string> = {
      parcelle: '/parcelles',
      visite: '/visites',
      tache: '/taches',
      intrant: '/intrants',
    };
    const base = routes[n.lienType];
    if (base) {
      this.router.navigate([base, n.lienId]);
    }
  }

  marquerToutesLues(): void {
    this.notifService.marquerToutesLues();
    this.notifications.forEach(n => n.lue = true);
    this.updateCounts();
    this.applyFilters();
    this.cdr.markForCheck();
  }

  iconForType(type: string): string {
    switch (type) {
      case 'alerte': return 'warning';
      case 'succes': return 'check_circle';
      case 'avertissement': return 'info';
      default: return 'info';
    }
  }

  trackById(_: number, item: Notification): string { return item.id; }
}
