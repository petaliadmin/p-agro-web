import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ParcelleService } from '../../core/services/parcelle.service';
import { VisiteService } from '../../core/services/visite.service';
import { IntrantService } from '../../core/services/intrant.service';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusChipComponent, PageHeaderComponent, LoadingSkeletonComponent, AvatarComponent } from '../../shared/components/shared-components';
import { Parcelle } from '../../core/models/parcelle.model';
import { Visite } from '../../core/models/visite.model';
import { Intrant } from '../../core/models/intrant.model';
import { MOCK_MEMBRES } from '../../../assets/mock-data/taches.mock';
import { take } from 'rxjs/operators';

import * as L from 'leaflet';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-parcelle-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusChipComponent, PageHeaderComponent, LoadingSkeletonComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="parcelle?.nom || 'Parcelle'" [breadcrumbs]="[{label:'Parcelles',route:'/parcelles'},{label:parcelle?.code || ''}]">
      <div class="flex gap-2">
        <button (click)="onDelete()" class="text-sm px-3 py-1.5 rounded-lg font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1.5">
          <span class="material-icons text-[14px]" aria-hidden="true">delete</span> Supprimer
        </button>
        <button (click)="openEdit()" class="btn-secondary text-sm">Éditer</button>
        <button (click)="openNewVisite()" class="btn-primary text-sm flex items-center gap-1.5"><span class="material-icons text-[14px]" aria-hidden="true">add</span> Nouvelle visite</button>
      </div>
    </app-page-header>

    <app-loading-skeleton *ngIf="!parcelle" [rows]="4"></app-loading-skeleton>

    <div *ngIf="parcelle" class="space-y-5">
      <!-- Row 1 : Info + Carte -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Infos principales -->
        <div class="card p-5 lg:col-span-2">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-gray-900">{{ parcelle.nom }}</h2>
              <p class="text-sm text-gray-500">{{ parcelle.code }} · {{ parcelle.zone }}</p>
            </div>
            <app-status-chip [statut]="parcelle.statut"></app-status-chip>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Culture</p><p class="font-medium capitalize mt-0.5">{{ parcelle.culture }}</p></div>
            <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Superficie</p><p class="font-medium mt-0.5">{{ parcelle.superficie }} ha</p></div>
            <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Stade</p><p class="font-medium capitalize mt-0.5">{{ parcelle.stade }}</p></div>
            <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Type de sol</p><p class="font-medium mt-0.5">{{ parcelle.typesSol }}</p></div>
            <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Producteur</p><p class="font-medium mt-0.5">{{ parcelle.producteurNom }}</p></div>
            <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Rendement préc.</p><p class="font-medium mt-0.5">{{ parcelle.rendementPrecedent }} t/ha</p></div>
          </div>
        </div>
        <!-- Carte Leaflet -->
        <div class="card overflow-hidden" style="min-height: 250px;">
          <div #mapContainer style="height: 100%; min-height: 250px;" class="z-0"></div>
        </div>
      </div>

      <!-- Prochaine visite -->
      <div class="card p-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-1">Prochaine visite planifiée</h3>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-700">{{ parcelle.prochaineVisite | date:'dd/MM/yyyy' }}</span>
              <span class="text-xs text-gray-500">·</span>
              <div class="flex items-center gap-1.5">
                <app-avatar [nom]="getTechNom(parcelle.technicienId).split(' ')[1] || ''" [prenom]="getTechNom(parcelle.technicienId).split(' ')[0]" size="sm"></app-avatar>
                <span class="text-sm text-gray-700">{{ getTechNom(parcelle.technicienId) }}</span>
              </div>
            </div>
          </div>
          <span class="material-icons text-primary-600" aria-hidden="true">event</span>
        </div>
      </div>

      <!-- Timeline visites -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900">Historique des visites</h3>
          <a routerLink="/visites" class="text-xs text-primary-600 hover:text-primary-800 font-medium">Voir toutes →</a>
        </div>
        <div *ngIf="!visites.length" class="px-5 py-8 text-center text-sm text-gray-500">Aucune visite enregistrée.</div>
        <div class="divide-y divide-gray-50">
          <div *ngFor="let v of visites; trackBy: trackById" class="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors" [routerLink]="['/visites', v.id]">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center"
              [class.bg-green-100]="v.statut === 'completee'"
              [class.bg-blue-100]="v.statut === 'en_cours'"
              [class.bg-gray-100]="v.statut === 'planifiee'">
              <span class="material-icons text-[18px]" aria-hidden="true"
                [class.text-green-600]="v.statut === 'completee'"
                [class.text-blue-600]="v.statut === 'en_cours'"
                [class.text-gray-500]="v.statut === 'planifiee'">
                {{ v.statut === 'completee' ? 'check_circle' : v.statut === 'en_cours' ? 'pending' : 'schedule' }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-gray-900">Visite du {{ v.date | date:'dd/MM/yyyy' }}</p>
                <app-status-chip [statut]="v.statut"></app-status-chip>
              </div>
              <p class="text-xs text-gray-500">{{ getTechNom(v.technicienId) }} · {{ v.duree }} min</p>
              <div *ngIf="v.observations.maladiesDetectees.length" class="flex gap-1 mt-1">
                <span *ngFor="let m of v.observations.maladiesDetectees" class="badge-urgent text-[10px]">{{ m }}</span>
              </div>
            </div>
            <span class="material-icons text-gray-300 text-[18px]" aria-hidden="true">chevron_right</span>
          </div>
        </div>
      </div>

      <!-- Historique intrants -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-gray-900">Intrants utilisés sur cette parcelle</h3>
        </div>
        <div *ngIf="!mouvementsParcelle.length" class="px-5 py-8 text-center text-sm text-gray-500">Aucun mouvement enregistré.</div>
        <div *ngIf="mouvementsParcelle.length" class="divide-y divide-gray-50">
          <div *ngFor="let mv of mouvementsParcelle" class="flex items-center gap-4 px-5 py-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100">
              <span class="material-icons text-red-600 text-[16px]" aria-hidden="true">remove_circle</span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ mv.intrantNom }}</p>
              <p class="text-xs text-gray-500">{{ mv.motif }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-red-600">-{{ mv.quantite }} {{ mv.unite }}</p>
              <p class="text-xs text-gray-500">{{ mv.date | date:'dd/MM/yy' }}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- Graphique rendement -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Évolution du rendement (t/ha)</h3>
        <canvas #rendementChart height="80"></canvas>
      </div>
    </div>
  `,
})
export class ParcelleDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('rendementChart') rendementChartRef?: ElementRef;

  parcelle: Parcelle | undefined;
  visites: Visite[] = [];
  mouvementsParcelle: any[] = [];

  constructor(
    private parcelleService: ParcelleService,
    private visiteService: VisiteService,
    private intrantService: IntrantService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = window.location.pathname.split('/').pop() ?? '';

    this.parcelleService.getById(id).pipe(take(1)).subscribe(p => {
      this.parcelle = p;
      this.cdr.markForCheck();
      setTimeout(() => { this.initMap(); }, 100);
    });

    this.visiteService.getByParcelle(id).pipe(take(1)).subscribe(v => {
      this.visites = v;
      this.cdr.markForCheck();
      setTimeout(() => this.initRendementChart(), 100);
    });

    this.intrantService.getAll().pipe(take(1)).subscribe(intrants => {
      this.mouvementsParcelle = intrants.flatMap(i =>
        i.mouvements
          .filter(m => m.parcelleId === id)
          .map(m => ({ ...m, intrantNom: i.nom, unite: i.unite }))
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {}

  private initRendementChart(): void {
    if (!this.rendementChartRef?.nativeElement || !this.parcelle) return;
    const base = this.parcelle.rendementPrecedent;

    // Build data from real visits grouped by month
    const visitesCompletees = this.visites
      .filter(v => v.statut === 'completee' && v.observations)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let data: { label: string; val: number }[];

    if (visitesCompletees.length >= 2) {
      // Group by month and compute average yield estimate from observations
      const parMois: Record<string, { totalCouverture: number; totalHauteur: number; count: number }> = {};
      visitesCompletees.forEach(v => {
        const d = new Date(v.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!parMois[key]) parMois[key] = { totalCouverture: 0, totalHauteur: 0, count: 0 };
        parMois[key].totalCouverture += v.observations.tauxCouverture || 0;
        parMois[key].totalHauteur += v.observations.hauteurPlantes || 0;
        parMois[key].count++;
      });

      const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      data = Object.entries(parMois).map(([key, v]) => {
        const [year, month] = key.split('-');
        const avgCouverture = v.totalCouverture / v.count;
        const avgHauteur = v.totalHauteur / v.count;
        // Estimate yield: base * (couverture/100 * 0.6 + hauteur_normalized * 0.4)
        const hauteurNorm = Math.min(avgHauteur / 150, 1);
        const rendement = +(base * (avgCouverture / 100 * 0.6 + hauteurNorm * 0.4)).toFixed(1);
        return { label: `${moisNoms[parseInt(month) - 1]} ${year}`, val: rendement };
      });
    } else {
      // Fallback: generate trend from base value
      data = [
        { label: '2022-23', val: +(base * 0.88).toFixed(1) },
        { label: '2023-24', val: +(base * 0.95).toFixed(1) },
        { label: '2024-25', val: base },
      ];
    }

    const ctx = this.rendementChartRef.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: 'Rendement (t/ha)',
          data: data.map(d => d.val),
          borderColor: '#1A7A4A',
          backgroundColor: 'rgba(26, 122, 74, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#1A7A4A',
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, grid: { color: '#f3f4f6' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  private initMap(): void {
    if (!this.mapContainer?.nativeElement || !this.parcelle) return;
    const { lat, lng } = this.parcelle.coordonnees;
    const map = L.map(this.mapContainer.nativeElement, { zoomControl: true, scrollWheelZoom: false })
      .setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    const color = this.parcelle.statut === 'urgent' ? '#ef4444' : this.parcelle.statut === 'attention' ? '#f59e0b' : '#22c55e';
    const popupContent = `<b>${this.parcelle.nom}</b><br/>${this.parcelle.culture} · ${this.parcelle.superficie} ha`;

    // Toujours afficher le point de repère
    L.circleMarker([lat, lng], {
      radius: 12, fillColor: color, color: 'white', weight: 2, opacity: 1, fillOpacity: 0.9
    }).addTo(map).bindPopup(popupContent).openPopup();

    // Afficher le polygone en plus si geometry existe
    if (this.parcelle.geometry && this.parcelle.geometry.length >= 3) {
      const latlngs = this.parcelle.geometry.map(c => [c.lat, c.lng] as L.LatLngTuple);
      const polygon = L.polygon(latlngs, { color, weight: 2, fillColor: color, fillOpacity: 0.2 })
        .addTo(map);
      map.fitBounds(polygon.getBounds(), { padding: [30, 30] });
    }
  }

  async openNewVisite(): Promise<void> {
    if (!this.parcelle) return;
    const { VisiteFormComponent } = await import('../visites/visite-form.component');
    const ref = this.dialogService.open(VisiteFormComponent, {
      data: { parcelleId: this.parcelle.id },
    });
    const result = await ref.afterClosed();
    if (result) {
      this.visiteService.getByParcelle(this.parcelle!.id).pipe(take(1)).subscribe(v => {
        this.visites = v;
        this.cdr.markForCheck();
      });
    }
  }

  async openEdit(): Promise<void> {
    if (!this.parcelle) return;
    const { ParcelleFormComponent } = await import('./parcelle-form.component');
    const ref = this.dialogService.open(ParcelleFormComponent, {
      data: { parcelle: this.parcelle },
    });
    const result = await ref.afterClosed();
    if (result) {
      this.parcelle = result;
      this.cdr.markForCheck();
    }
  }

  async onDelete(): Promise<void> {
    if (!this.parcelle) return;
    const confirmed = await this.dialogService.confirm({
      title: 'Supprimer la parcelle',
      message: `Êtes-vous sûr de vouloir supprimer la parcelle "${this.parcelle.nom}" ? Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      confirmColor: 'danger',
    });
    if (confirmed) {
      this.parcelleService.delete(this.parcelle.id).pipe(take(1)).subscribe(() => {
        this.toastService.success(`Parcelle "${this.parcelle!.nom}" supprimée`);
        this.router.navigate(['/parcelles']);
      });
    }
  }

  getTechNom(id: string): string {
    const m = MOCK_MEMBRES.find(m => m.id === id);
    return m ? `${m.prenom} ${m.nom}` : id;
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
}
