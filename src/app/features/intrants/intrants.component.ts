import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IntrantService } from '../../core/services/intrant.service';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent, LoadingSkeletonComponent } from '../../shared/components/shared-components';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { Intrant, IntrantStats } from '../../core/models/intrant.model';
import { forkJoin } from 'rxjs';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-intrants',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, LoadingSkeletonComponent, StatCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Intrants" subtitle="Gestion des stocks et traçabilité">
      <button (click)="openCreate()" class="btn-primary flex items-center gap-2">
        <span class="material-icons text-[16px]" aria-hidden="true">add</span> Nouvel intrant
      </button>
    </app-page-header>

    <!-- KPI intrants -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
      <app-stat-card label="Références" [value]="globalStats.totalReferences" icon="inventory_2" color="blue"></app-stat-card>
      <app-stat-card label="Alertes stock" [value]="globalStats.alertesStock" icon="warning" color="red"></app-stat-card>
      <app-stat-card label="Expirations proches" [value]="globalStats.alertesExpiration" icon="schedule" color="yellow"></app-stat-card>
      <app-stat-card label="Valeur totale" [value]="formatFCFA(globalStats.valeurTotale)" icon="payments" color="green"></app-stat-card>
    </div>

    <!-- Alertes -->
    <div *ngIf="alertes.length || expirations.length" class="mb-6 space-y-2" aria-live="polite">
      <div *ngFor="let i of alertes" role="alert" class="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
        <span class="material-icons text-red-500 text-[18px]" aria-hidden="true">warning</span>
        <div class="flex-1">
          <span class="text-sm font-semibold text-red-800">Stock critique — {{ i.nom }}</span>
          <span class="text-xs text-red-600 ml-2">{{ i.quantiteStock }} {{ i.unite }} restants (seuil: {{ i.seuilAlerte }})</span>
        </div>
        <button (click)="dismissAlerte(i.id, 'stock')" class="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-100" aria-label="Fermer l'alerte">
          <span class="material-icons text-[16px]">close</span>
        </button>
      </div>
      <div *ngFor="let i of expirations" role="alert" class="flex items-center gap-3 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
        <span class="material-icons text-yellow-600 text-[18px]" aria-hidden="true">schedule</span>
        <div class="flex-1">
          <span class="text-sm font-semibold text-yellow-800">Expiration proche — {{ i.nom }}</span>
          <span class="text-xs text-yellow-700 ml-2">Expire le {{ i.dateExpiration | date:'dd/MM/yyyy' }}</span>
        </div>
        <button (click)="dismissAlerte(i.id, 'expiration')" class="flex-shrink-0 text-yellow-500 hover:text-yellow-700 transition-colors p-1 rounded-lg hover:bg-yellow-100" aria-label="Fermer l'alerte">
          <span class="material-icons text-[16px]">close</span>
        </button>
      </div>
    </div>

    <!-- Table stocks -->
    <div class="card overflow-hidden mb-6">
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-900">Stock actuel</h3>
        <button class="btn-secondary text-xs flex items-center gap-1">
          <span class="material-icons text-[14px]" aria-hidden="true">download</span> Export
        </button>
      </div>
      <div *ngIf="loading"><app-loading-skeleton [rows]="5"></app-loading-skeleton></div>
      <table *ngIf="!loading" class="w-full">
        <thead>
          <tr class="bg-gray-50">
            <th class="table-header">Produit</th>
            <th class="table-header">Type</th>
            <th class="table-header">Stock actuel</th>
            <th class="table-header">Niveau</th>
            <th class="table-header">Expiration</th>
            <th class="table-header">Valeur</th>
            <th class="table-header">Fournisseur</th>
            <th class="table-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let i of intrants; trackBy: trackById" class="table-row">
            <td class="table-cell">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  [class.bg-green-100]="i.type === 'semence'"
                  [class.bg-blue-100]="i.type === 'engrais'"
                  [class.bg-red-100]="i.type === 'pesticide'"
                  [class.bg-orange-100]="i.type === 'herbicide'"
                  [class.bg-purple-100]="i.type === 'fongicide'"
                >{{ typeEmoji(i.type) }}</div>
                <span class="font-medium text-gray-900 text-sm">{{ i.nom }}</span>
              </div>
            </td>
            <td class="table-cell capitalize text-xs">{{ i.type }}</td>
            <td class="table-cell">
              <span class="font-semibold" [class.text-red-600]="i.quantiteStock <= i.seuilAlerte">
                {{ i.quantiteStock }} {{ i.unite }}
              </span>
            </td>
            <td class="table-cell" style="min-width: 120px;">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-100 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all"
                    [style.width]="stockPct(i) + '%'"
                    [class.bg-red-500]="stockPct(i) < 30"
                    [class.bg-yellow-500]="stockPct(i) >= 30 && stockPct(i) < 60"
                    [class.bg-green-500]="stockPct(i) >= 60"
                  ></div>
                </div>
                <span class="text-[10px] text-gray-500">{{ stockPct(i) }}%</span>
              </div>
            </td>
            <td class="table-cell text-xs" [class.text-red-600]="isExpirationProche(i)">
              {{ i.dateExpiration | date:'dd/MM/yy' }}
              <span *ngIf="isExpirationProche(i)" class="ml-1">⚠️</span>
            </td>
            <td class="table-cell text-xs font-medium">{{ formatFCFA(i.quantiteStock * i.prixUnitaire) }}</td>
            <td class="table-cell text-xs text-gray-500">{{ i.fournisseur }}</td>
            <td class="table-cell">
              <div class="flex items-center gap-1">
                <button (click)="openMouvement(i, 'entree')" class="text-[10px] text-green-600 border border-green-200 rounded px-1.5 py-0.5 hover:bg-green-50 transition-colors" title="Entrée stock">+ Entrée</button>
                <button (click)="openMouvement(i, 'sortie')" class="text-[10px] text-red-600 border border-red-200 rounded px-1.5 py-0.5 hover:bg-red-50 transition-colors" title="Sortie stock">- Sortie</button>
                <button (click)="openEdit(i)" class="text-gray-500 hover:text-primary-600 transition-colors" title="Éditer" [attr.aria-label]="'Éditer l\\'intrant ' + i.nom">
                  <span class="material-icons text-[16px]" aria-hidden="true">edit</span>
                </button>
                <button (click)="onDelete(i)" class="text-gray-500 hover:text-red-600 transition-colors" title="Supprimer" [attr.aria-label]="'Supprimer l\\'intrant ' + i.nom">
                  <span class="material-icons text-[16px]" aria-hidden="true">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Graphique consommation 30 jours -->
    <div class="card p-5 mb-6">
      <h3 class="text-sm font-semibold text-gray-900 mb-4">Consommation par type (30 derniers jours)</h3>
      <canvas #consoChart height="100"></canvas>
    </div>

    <!-- Historique mouvements -->
    <div class="card overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="text-sm font-semibold text-gray-900">Derniers mouvements</h3>
      </div>
      <div class="divide-y divide-gray-50">
        <div *ngFor="let mv of recentsMouvements; trackBy: trackByMvId" class="flex items-center gap-4 px-5 py-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center"
            [class.bg-green-100]="mv.type === 'entree'"
            [class.bg-red-100]="mv.type === 'sortie'">
            <span class="material-icons text-[16px]" aria-hidden="true"
              [class.text-green-600]="mv.type === 'entree'"
              [class.text-red-600]="mv.type === 'sortie'">
              {{ mv.type === 'entree' ? 'add_circle' : 'remove_circle' }}
            </span>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ mv.intrantNom }}</p>
            <p class="text-xs text-gray-500">{{ mv.motif }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold" [class.text-green-600]="mv.type === 'entree'" [class.text-red-600]="mv.type === 'sortie'">
              {{ mv.type === 'entree' ? '+' : '-' }}{{ mv.quantite }} {{ mv.unite }}
            </p>
            <p class="text-xs text-gray-500">{{ mv.date | date:'dd/MM · HH:mm' }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class IntrantsComponent implements OnInit {
  @ViewChild('consoChart') consoChartRef!: ElementRef;
  loading = true;
  intrants: Intrant[] = [];
  alertes: Intrant[] = [];
  expirations: Intrant[] = [];
  recentsMouvements: any[] = [];
  globalStats: IntrantStats = { totalReferences: 0, alertesStock: 0, alertesExpiration: 0, valeurTotale: 0 };
  private dismissedAlertes = new Set<string>();

  constructor(
    private intrantService: IntrantService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    forkJoin({
      all: this.intrantService.getAll().pipe(take(1)),
      alertes: this.intrantService.getEnAlerte().pipe(take(1)),
      exp: this.intrantService.getExpirationProche().pipe(take(1)),
      stats: this.intrantService.getStats().pipe(take(1)),
      conso: this.intrantService.getConsommation30j().pipe(take(1)),
    }).subscribe(data => {
      this.intrants = data.all;
      this.alertes = data.alertes;
      this.expirations = data.exp.filter(e => !data.alertes.find(a => a.id === e.id));
      this.globalStats = data.stats;
      this.recentsMouvements = data.all.flatMap(i =>
        i.mouvements.map(m => ({ ...m, intrantNom: i.nom, unite: i.unite }))
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
      this.loading = false;
      this.cdr.markForCheck();
      setTimeout(() => this.initConsoChart(data.conso), 100);
    });
  }

  stockPct(i: Intrant): number {
    const max = Math.max(i.seuilAlerte * 3, i.quantiteStock);
    return Math.min(100, Math.round((i.quantiteStock / max) * 100));
  }

  isExpirationProche(i: Intrant): boolean {
    return new Date(i.dateExpiration) <= new Date(Date.now() + 30 * 86400000);
  }

  formatFCFA(v: number): string {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(v);
  }

  typeEmoji(t: string): string {
    return { semence: '🌱', engrais: '🌿', pesticide: '🧪', herbicide: '🌿', fongicide: '🍄' }[t] ?? '📦';
  }

  private initConsoChart(data: { type: string; quantite: number }[]): void {
    const ctx = this.consoChartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    const colors = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#a855f7'];
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.type),
        datasets: [{
          label: 'Quantité consommée',
          data: data.map(d => d.quantite),
          backgroundColor: colors.slice(0, data.length),
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
  }

  async openCreate(): Promise<void> {
    const { IntrantFormComponent } = await import('./intrant-form.component');
    const ref = this.dialogService.open(IntrantFormComponent, { data: {} });
    const result = await ref.afterClosed();
    if (result) this.reload();
  }

  async openEdit(intrant: Intrant): Promise<void> {
    const { IntrantFormComponent } = await import('./intrant-form.component');
    const ref = this.dialogService.open(IntrantFormComponent, { data: { intrant } });
    const result = await ref.afterClosed();
    if (result) this.reload();
  }

  async openMouvement(intrant: Intrant, type: 'entree' | 'sortie'): Promise<void> {
    const { MouvementFormComponent } = await import('./mouvement-form.component');
    const ref = this.dialogService.open(MouvementFormComponent, {
      data: { intrantId: intrant.id, intrantNom: intrant.nom, mouvementType: type },
    });
    const result = await ref.afterClosed();
    if (result) this.reload();
  }

  async onDelete(intrant: Intrant): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Supprimer l\'intrant',
      message: `Êtes-vous sûr de vouloir supprimer "${intrant.nom}" du stock ?`,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      confirmColor: 'danger',
    });
    if (confirmed) {
      this.intrantService.delete(intrant.id).pipe(take(1)).subscribe(() => {
        this.toastService.success(`"${intrant.nom}" supprimé du stock`);
        this.reload();
      });
    }
  }

  private reload(): void {
    forkJoin({
      all: this.intrantService.getAll().pipe(take(1)),
      alertes: this.intrantService.getEnAlerte().pipe(take(1)),
      exp: this.intrantService.getExpirationProche().pipe(take(1)),
      stats: this.intrantService.getStats().pipe(take(1)),
    }).subscribe(data => {
      this.intrants = data.all;
      this.alertes = data.alertes.filter(a => !this.dismissedAlertes.has(`stock_${a.id}`));
      this.expirations = data.exp.filter(e => !data.alertes.find(a => a.id === e.id) && !this.dismissedAlertes.has(`expiration_${e.id}`));
      this.globalStats = data.stats;
      this.recentsMouvements = data.all.flatMap(i =>
        i.mouvements.map(m => ({ ...m, intrantNom: i.nom, unite: i.unite }))
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
      this.cdr.markForCheck();
    });
  }

  dismissAlerte(id: string, type: 'stock' | 'expiration'): void {
    this.dismissedAlertes.add(`${type}_${id}`);
    if (type === 'stock') {
      this.alertes = this.alertes.filter(a => a.id !== id);
    } else {
      this.expirations = this.expirations.filter(a => a.id !== id);
    }
    this.cdr.markForCheck();
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
  trackByMvId(_: number, item: { id: string }): string { return item.id; }
}
