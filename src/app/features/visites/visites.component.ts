import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { VisiteService } from '../../core/services/visite.service';
import { ParcelleService } from '../../core/services/parcelle.service';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusChipComponent, LoadingSkeletonComponent, PageHeaderComponent } from '../../shared/components/shared-components';
import { Visite } from '../../core/models/visite.model';
import { Parcelle } from '../../core/models/parcelle.model';
import { MOCK_MEMBRES } from '../../../assets/mock-data/taches.mock';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-visites',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusChipComponent, LoadingSkeletonComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Visites" subtitle="Suivi des visites terrain">
      <button (click)="openCreate()" class="btn-primary flex items-center gap-2 text-sm">
        <span class="material-icons text-[16px]" aria-hidden="true">add</span> Nouvelle visite
      </button>
    </app-page-header>

    <!-- Filtres -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <div class="relative flex-1 min-w-[200px] max-w-sm">
        <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]" aria-hidden="true">search</span>
        <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()"
          placeholder="Rechercher parcelle, technicien…"
          class="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent" />
      </div>
      <select [(ngModel)]="filtreStatut" (ngModelChange)="applyFilters()" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
        <option value="">Tous les statuts</option>
        <option value="planifiee">Planifiée</option>
        <option value="en_cours">En cours</option>
        <option value="completee">Complétée</option>
      </select>
      <select [(ngModel)]="filtreTechnicien" (ngModelChange)="applyFilters()" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
        <option value="">Tous les techniciens</option>
        <option *ngFor="let t of techniciens" [value]="t.id">{{ t.prenom }} {{ t.nom }}</option>
      </select>
      <select [(ngModel)]="filtreParcelle" (ngModelChange)="applyFilters()" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
        <option value="">Toutes les parcelles</option>
        <option *ngFor="let p of parcelles" [value]="p.id">{{ p.nom }}</option>
      </select>
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-gray-500">Du</span>
        <input type="date" [(ngModel)]="filtreDateFrom" (ngModelChange)="applyFilters()" class="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"/>
        <span class="text-xs text-gray-500">au</span>
        <input type="date" [(ngModel)]="filtreDateTo" (ngModelChange)="applyFilters()" class="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"/>
      </div>
    </div>

    <div class="card overflow-hidden">
      <div *ngIf="loading"><app-loading-skeleton [rows]="6"></app-loading-skeleton></div>

      <!-- Desktop table -->
      <div *ngIf="!loading && !isMobile" class="overflow-x-auto">
      <table class="w-full min-w-[700px]">
        <thead>
          <tr class="bg-gray-50">
            <th class="table-header">Parcelle</th>
            <th class="table-header">Technicien</th>
            <th class="table-header">Date</th>
            <th class="table-header">Durée</th>
            <th class="table-header">Statut</th>
            <th class="table-header">Problèmes</th>
            <th class="table-header"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let v of filteredVisites; trackBy: trackById" class="table-row cursor-pointer" [routerLink]="['/visites', v.id]">
            <td class="table-cell font-medium">{{ getParcelleNom(v.parcelleId) }}</td>
            <td class="table-cell text-xs">{{ getTechNom(v.technicienId) }}</td>
            <td class="table-cell text-xs">{{ v.date | date:'dd/MM/yy HH:mm' }}</td>
            <td class="table-cell text-xs">{{ v.duree ? v.duree + ' min' : '—' }}</td>
            <td class="table-cell"><app-status-chip [statut]="v.statut"></app-status-chip></td>
            <td class="table-cell">
              <div *ngIf="v.observations.maladiesDetectees.length || v.observations.ravageursDetectes.length" class="flex flex-wrap gap-1">
                <span *ngFor="let m of v.observations.maladiesDetectees" class="badge-urgent text-[10px]">{{ m }}</span>
                <span *ngFor="let r of v.observations.ravageursDetectes" class="badge-attention text-[10px]">{{ r }}</span>
              </div>
              <span *ngIf="!v.observations.maladiesDetectees.length && !v.observations.ravageursDetectes.length" class="text-xs text-gray-500">Aucun</span>
            </td>
            <td class="table-cell">
              <div class="flex items-center gap-1">
                <button [routerLink]="['/visites', v.id]" class="text-gray-500 hover:text-primary-600 transition-colors" title="Voir" aria-label="Voir la visite" (click)="$event.stopPropagation()">
                  <span class="material-icons text-[16px]" aria-hidden="true">visibility</span>
                </button>
                <button (click)="openEdit(v); $event.stopPropagation()" class="text-gray-500 hover:text-primary-600 transition-colors" title="Éditer" aria-label="Éditer la visite">
                  <span class="material-icons text-[16px]" aria-hidden="true">edit</span>
                </button>
                <button (click)="deleteVisite(v); $event.stopPropagation()" class="text-gray-500 hover:text-red-600 transition-colors" title="Supprimer" aria-label="Supprimer la visite">
                  <span class="material-icons text-[16px]" aria-hidden="true">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <!-- Mobile card view -->
      <div *ngIf="!loading && isMobile" class="divide-y divide-gray-100">
        <div *ngFor="let v of filteredVisites; trackBy: trackById"
          class="p-4 hover:bg-gray-50 transition-colors cursor-pointer" [routerLink]="['/visites', v.id]">
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ getParcelleNom(v.parcelleId) }}</p>
              <p class="text-xs text-gray-500">{{ getTechNom(v.technicienId) }}</p>
            </div>
            <app-status-chip [statut]="v.statut"></app-status-chip>
          </div>
          <div class="flex items-center gap-3 text-xs text-gray-500 mb-2">
            <span class="flex items-center gap-1"><span class="material-icons text-[12px]" aria-hidden="true">calendar_today</span> {{ v.date | date:'dd/MM/yy HH:mm' }}</span>
            <span *ngIf="v.duree" class="flex items-center gap-1"><span class="material-icons text-[12px]" aria-hidden="true">schedule</span> {{ v.duree }} min</span>
          </div>
          <div *ngIf="v.observations.maladiesDetectees.length || v.observations.ravageursDetectes.length" class="flex flex-wrap gap-1 mb-2">
            <span *ngFor="let m of v.observations.maladiesDetectees" class="badge-urgent text-[10px]">{{ m }}</span>
            <span *ngFor="let r of v.observations.ravageursDetectes" class="badge-attention text-[10px]">{{ r }}</span>
          </div>
          <div class="flex items-center gap-2 pt-2 border-t border-gray-50">
            <button [routerLink]="['/visites', v.id]" class="flex-1 text-xs text-center py-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors" (click)="$event.stopPropagation()" aria-label="Voir la visite">Voir</button>
            <button (click)="openEdit(v); $event.stopPropagation()" class="flex-1 text-xs text-center py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Éditer la visite">Éditer</button>
            <button (click)="deleteVisite(v); $event.stopPropagation()" class="flex-1 text-xs text-center py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors" aria-label="Supprimer la visite">Supprimer</button>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !filteredVisites.length" class="py-12 text-center">
        <span class="material-icons text-gray-300 text-[40px]" aria-hidden="true">search_off</span>
        <p class="text-sm text-gray-500 mt-2">Aucune visite ne correspond aux filtres.</p>
      </div>
    </div>
  `,
})
export class VisitesComponent implements OnInit, OnDestroy {
  loading = true;
  isMobile = false;
  private bpSub?: Subscription;
  visites: Visite[] = [];
  filteredVisites: Visite[] = [];
  parcelles: Parcelle[] = [];
  techniciens = MOCK_MEMBRES.filter(m => m.role === 'technicien' || m.role === 'chef_equipe');

  searchQuery = '';
  filtreStatut = '';
  filtreTechnicien = '';
  filtreParcelle = '';
  filtreDateFrom = '';
  filtreDateTo = '';

  constructor(
    private visiteService: VisiteService,
    private parcelleService: ParcelleService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnDestroy(): void {
    this.bpSub?.unsubscribe();
  }

  ngOnInit(): void {
    this.bpSub = this.breakpointObserver.observe('(max-width: 767px)').subscribe(result => {
      this.isMobile = result.matches;
      this.cdr.markForCheck();
    });
    forkJoin({
      visites: this.visiteService.getAll().pipe(take(1)),
      parcelles: this.parcelleService.getAll().pipe(take(1)),
    }).subscribe(data => {
      this.visites = data.visites;
      this.parcelles = data.parcelles;
      this.applyFilters();
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  applyFilters(): void {
    let result = [...this.visites];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(v =>
        this.getParcelleNom(v.parcelleId).toLowerCase().includes(q) ||
        this.getTechNom(v.technicienId).toLowerCase().includes(q)
      );
    }
    if (this.filtreStatut) result = result.filter(v => v.statut === this.filtreStatut);
    if (this.filtreTechnicien) result = result.filter(v => v.technicienId === this.filtreTechnicien);
    if (this.filtreParcelle) result = result.filter(v => v.parcelleId === this.filtreParcelle);
    if (this.filtreDateFrom) {
      const from = new Date(this.filtreDateFrom);
      result = result.filter(v => new Date(v.date) >= from);
    }
    if (this.filtreDateTo) {
      const to = new Date(this.filtreDateTo);
      to.setHours(23, 59, 59);
      result = result.filter(v => new Date(v.date) <= to);
    }
    this.filteredVisites = result;
  }

  getParcelleNom(id: string): string {
    return this.parcelles.find(p => p.id === id)?.nom ?? id;
  }

  getTechNom(id: string): string {
    const m = MOCK_MEMBRES.find(m => m.id === id);
    return m ? `${m.prenom} ${m.nom}` : id;
  }

  async openEdit(visite: Visite): Promise<void> {
    const { VisiteFormComponent } = await import('./visite-form.component');
    const ref = this.dialogService.open(VisiteFormComponent, { data: { visite } });
    const result = await ref.afterClosed();
    if (result) this.reloadVisites();
  }

  async deleteVisite(visite: Visite): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Supprimer la visite',
      message: 'Êtes-vous sûr de vouloir supprimer cette visite ?',
      confirmLabel: 'Supprimer', cancelLabel: 'Annuler', confirmColor: 'danger',
    });
    if (confirmed) {
      this.visiteService.delete(visite.id).pipe(take(1)).subscribe(() => {
        this.toastService.success('Visite supprimée');
        this.reloadVisites();
      });
    }
  }

  async openCreate(): Promise<void> {
    const { VisiteFormComponent } = await import('./visite-form.component');
    const ref = this.dialogService.open(VisiteFormComponent, { data: {} });
    const result = await ref.afterClosed();
    if (result) {
      this.reloadVisites();
    }
  }

  private reloadVisites(): void {
    this.visiteService.getAll().pipe(take(1)).subscribe(data => {
      this.visites = data;
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
}
