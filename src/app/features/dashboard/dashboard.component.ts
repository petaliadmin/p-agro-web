import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef, afterNextRender, Injector, effect, untracked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ParcelleService } from '../../core/services/parcelle.service';
import { VisiteService } from '../../core/services/visite.service';
import { TacheService } from '../../core/services/tache.service';
import { IntrantService } from '../../core/services/intrant.service';
import { MeteoService } from '../../core/services/notification.service';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { StatusChipComponent, LoadingSkeletonComponent, PageHeaderComponent, AvatarComponent } from '../../shared/components/shared-components';
import { Parcelle } from '../../core/models/parcelle.model';
import { Visite } from '../../core/models/visite.model';
import { MeteoJour } from '../../core/models/user.model';
import { MOCK_MEMBRES } from '../../../assets/mock-data/taches.mock';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { ThemeService } from '../../core/services/theme.service';

import { Chart, registerables } from 'chart.js';
import * as L from 'leaflet';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, StatusChipComponent, LoadingSkeletonComponent, PageHeaderComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Tableau de bord"
      subtitle="Vue d'ensemble de la campagne 2024-2025"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-500">Mis à jour il y a 2 min</span>
        <button (click)="refresh()" class="btn-secondary flex items-center gap-1.5 text-xs" [disabled]="loading">
          <span class="material-icons text-[14px]" aria-hidden="true" [class.animate-spin]="loading">refresh</span> {{ loading ? 'Chargement…' : 'Actualiser' }}
        </button>
      </div>
    </app-page-header>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6" aria-live="polite" aria-label="Indicateurs clés de performance">
      <ng-container *ngIf="!loading; else kpiSkeleton">
        <app-stat-card
          label="Parcelles actives"
          [value]="stats.parcelles"
          icon="agriculture"
          color="green"
          subtitle="{{ stats.totalHa }} hectares couverts"
          [trend]="{ value: 8, direction: 'up' }"
        ></app-stat-card>
        <app-stat-card
          label="Visites du jour"
          [value]="stats.visitesDuJour"
          icon="fact_check"
          color="blue"
          subtitle="{{ stats.visitesCompletees }} complétées"
        ></app-stat-card>
        <app-stat-card
          label="Tâches urgentes"
          [value]="stats.tachesUrgentes"
          icon="priority_high"
          color="red"
          subtitle="Requièrent intervention"
          [trend]="stats.tachesUrgentes > 2 ? { value: -2, direction: 'down' } : undefined"
        ></app-stat-card>
        <app-stat-card
          label="Alertes intrants"
          [value]="stats.alertesIntrants"
          icon="inventory_2"
          color="yellow"
          subtitle="Stocks critiques + expirations"
        ></app-stat-card>
      </ng-container>
      <ng-template #kpiSkeleton>
        <div *ngFor="let i of [0,1,2,3]" class="card p-5">
          <div class="skeleton h-3 w-1/2 mb-3"></div>
          <div class="skeleton h-8 w-2/3 mb-2"></div>
          <div class="skeleton h-2.5 w-1/3"></div>
        </div>
      </ng-template>
    </div>

    <!-- Row : Charts + Météo -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 mb-4">
      <!-- Graphique activité semaine -->
      <div class="card p-3 sm:p-5 md:col-span-2 xl:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900">Activité hebdomadaire</h3>
            <p class="text-xs text-gray-500 mt-0.5">Visites réalisées par jour</p>
          </div>
          <span class="badge-planifie">Semaine {{ currentWeekNumber }}</span>
        </div>
        <canvas *ngIf="!chartError" #activityChart height="120" role="img" aria-label="Graphique de l'activité hebdomadaire montrant le nombre de visites par jour"></canvas>
        <div *ngIf="chartError" class="flex items-center justify-center h-32 text-sm text-gray-500">
          <span class="material-icons text-gray-400 mr-2" aria-hidden="true">error_outline</span> Impossible de charger le graphique
        </div>
      </div>

      <!-- Widget météo -->
      <div class="card p-5" *ngIf="meteo?.length" aria-live="polite" aria-label="Prévisions météo">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-900">Météo</h3>
          <span class="text-xs text-gray-500">{{ meteo[0].ville }}</span>
        </div>
        <!-- Aujourd'hui -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-4xl font-bold text-gray-900">{{ meteo[0].temperature }}°</p>
            <p class="text-sm text-gray-500 mt-1">{{ conditionLabel(meteo[0].condition) }}</p>
            <div class="flex items-center gap-3 mt-2">
              <span class="text-xs text-gray-500 flex items-center gap-0.5">
                <span class="material-icons text-[12px]" aria-hidden="true">air</span> {{ meteo[0].vent }} km/h
              </span>
              <span class="text-xs text-gray-500 flex items-center gap-0.5">
                <span class="material-icons text-[12px]" aria-hidden="true">water_drop</span> {{ meteo[0].humidite }}%
              </span>
            </div>
          </div>
          <div class="text-5xl">{{ conditionEmoji(meteo[0].condition) }}</div>
        </div>
        <!-- Prévisions 3 jours -->
        <div class="border-t border-gray-100 pt-3 grid grid-cols-3 gap-2">
          <div *ngFor="let jour of meteo; let i = index" class="text-center">
            <p class="text-xs text-gray-500">{{ i === 0 ? 'Auj.' : i === 1 ? 'Dem.' : 'Apr.' }}</p>
            <p class="text-lg my-1">{{ conditionEmoji(jour.condition) }}</p>
            <p class="text-xs font-semibold text-gray-700">{{ jour.temperature }}°</p>
            <p class="text-[10px] text-gray-500">{{ jour.temperatureMin }}°-{{ jour.temperatureMax }}°</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Row : Parcelles à risque + Dernières visites -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 mb-4">
      <!-- Parcelles urgentes -->
      <div class="card lg:col-span-2">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-gray-900">Parcelles à risque</h3>
          <a routerLink="/parcelles" class="text-xs text-primary-600 hover:text-primary-800 font-medium">Voir toutes →</a>
        </div>
        <div *ngIf="loading"><app-loading-skeleton [rows]="3"></app-loading-skeleton></div>
        <div *ngIf="!loading" class="overflow-x-auto">
        <table class="w-full min-w-[500px]">
          <thead>
            <tr class="bg-gray-50">
              <th class="table-header">Parcelle</th>
              <th class="table-header">Culture</th>
              <th class="table-header">Statut</th>
              <th class="table-header">Technicien</th>
              <th class="table-header">Dernière visite</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of parcellesUrgentes; trackBy: trackById" class="table-row cursor-pointer" [routerLink]="['/parcelles', p.id]">
              <td class="table-cell">
                <div>
                  <p class="font-medium text-gray-900">{{ p.nom }}</p>
                  <p class="text-xs text-gray-500">{{ p.code }} · {{ p.superficie }} ha</p>
                </div>
              </td>
              <td class="table-cell capitalize">
                <span class="flex items-center gap-1">
                  <span>{{ cultureEmoji(p.culture) }}</span> {{ p.culture }}
                </span>
              </td>
              <td class="table-cell"><app-status-chip [statut]="p.statut"></app-status-chip></td>
              <td class="table-cell">{{ getTechnicienNom(p.technicienId) }}</td>
              <td class="table-cell">{{ p.derniereVisite | date:'dd/MM/yy' }}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      <!-- Graphique donut état cultures -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-1">État des cultures</h3>
        <p class="text-xs text-gray-500 mb-4">Répartition par statut</p>
        <canvas #donutChart height="180" role="img" aria-label="Graphique en anneau montrant la répartition des cultures par statut"></canvas>
        <div class="mt-4 space-y-2">
          <div class="flex items-center justify-between" *ngFor="let item of donutLegend">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" [style.background]="item.color"></div>
              <span class="text-xs text-gray-600">{{ item.label }}</span>
            </div>
            <span class="text-xs font-semibold text-gray-900">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dernières visites + Carte mini -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
      <!-- Feed visites -->
      <div class="card lg:col-span-1">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-gray-900">Dernières visites</h3>
          <a routerLink="/visites" class="text-xs text-primary-600 hover:text-primary-800 font-medium">Voir toutes →</a>
        </div>
        <div class="divide-y divide-gray-50">
          <div
            *ngFor="let v of dernieresVisites; trackBy: trackById"
            class="flex gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
            [routerLink]="['/visites', v.id]"
          >
            <app-avatar [nom]="getTechnicienNom(v.technicienId).split(' ')[1] || 'X'" [prenom]="getTechnicienNom(v.technicienId).split(' ')[0]" size="sm"></app-avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ getParcelleNom(v.parcelleId) }}</p>
              <p class="text-xs text-gray-500 truncate">{{ getTechnicienNom(v.technicienId) }}</p>
              <div class="flex items-center gap-2 mt-1">
                <app-status-chip [statut]="v.statut"></app-status-chip>
                <span class="text-[10px] text-gray-500">{{ v.date | date:'dd/MM · HH:mm' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Carte mini -->
      <div class="card lg:col-span-2 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-gray-900">Carte des parcelles</h3>
          <a routerLink="/parcelles" class="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1">
            <span class="material-icons text-[14px]" aria-hidden="true">open_in_full</span> Vue complète
          </a>
        </div>
        <div #miniMap class="z-0 h-[200px] md:h-[300px]"></div>
        <div *ngIf="mapError" class="absolute bottom-2 left-2 right-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700 flex items-center gap-1.5 z-10">
          <span class="material-icons text-[14px]" aria-hidden="true">warning</span> Erreur de chargement des tuiles cartographiques
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('activityChart') activityChartRef!: ElementRef;
  @ViewChild('donutChart') donutChartRef!: ElementRef;
  @ViewChild('miniMap') miniMapRef!: ElementRef;

  loading = true;
  stats = { parcelles: 0, totalHa: 0, visitesDuJour: 0, visitesCompletees: 0, tachesUrgentes: 0, alertesIntrants: 0 };
  activiteSemaine: { jour: string; count: number }[] = [];
  parcellesUrgentes: Parcelle[] = [];
  dernieresVisites: Visite[] = [];
  meteo: MeteoJour[] = [];
  toutes: Parcelle[] = [];

  currentWeekNumber = this.getWeekNumber();

  donutLegend = [
    { label: 'Sain', color: '#22c55e', count: 0 },
    { label: 'Attention', color: '#f59e0b', count: 0 },
    { label: 'Urgent', color: '#ef4444', count: 0 },
    { label: 'Récolte', color: '#a855f7', count: 0 },
  ];

  private activityChartInstance?: Chart;
  private donutChartInstance?: Chart;
  private mapInstance?: L.Map;

  constructor(
    private parcelleService: ParcelleService,
    private visiteService: VisiteService,
    private tacheService: TacheService,
    private intrantService: IntrantService,
    private meteoService: MeteoService,
    private cdr: ChangeDetectorRef,
    private injector: Injector,
    private themeService: ThemeService,
  ) {
    // Re-render charts on theme change
    effect(() => {
      this.themeService.isDark();
      if (!this.loading) {
        untracked(() => {
          this.activityChartInstance?.destroy();
          this.donutChartInstance?.destroy();
          this.activityChartInstance = undefined;
          this.donutChartInstance = undefined;
          afterNextRender(() => this.initCharts(), { injector: this.injector });
        });
      }
    });
  }

  ngOnInit(): void {
    forkJoin({
      parcellesStats: this.parcelleService.getStats().pipe(take(1)),
      parcelles: this.parcelleService.getAll().pipe(take(1)),
      urgentes: this.parcelleService.getUrgentes().pipe(take(1)),
      visitesStats: this.visiteService.getStats().pipe(take(1)),
      recentes: this.visiteService.getRecentes(5).pipe(take(1)),
      activiteSemaine: this.visiteService.getActiviteSemaine().pipe(take(1)),
      tachesStats: this.tacheService.getStats().pipe(take(1)),
      intrantsStats: this.intrantService.getStats().pipe(take(1)),
      meteo: this.meteoService.getMeteo().pipe(take(1)),
    }).subscribe(data => {
      this.stats.parcelles = data.parcellesStats.total;
      this.stats.totalHa = data.parcellesStats.totalHa;
      this.stats.visitesDuJour = data.visitesStats.total;
      this.stats.visitesCompletees = data.visitesStats.completees;
      this.stats.tachesUrgentes = data.tachesStats.urgentes;
      this.stats.alertesIntrants = data.intrantsStats.alertesStock + data.intrantsStats.alertesExpiration;
      this.activiteSemaine = data.activiteSemaine;
      this.parcellesUrgentes = data.urgentes.slice(0, 5);
      this.dernieresVisites = data.recentes;
      this.toutes = data.parcelles;
      this.meteo = data.meteo;
      // Donut data
      this.donutLegend[0].count = data.parcelles.filter(p => p.statut === 'sain').length;
      this.donutLegend[1].count = data.parcelles.filter(p => p.statut === 'attention').length;
      this.donutLegend[2].count = data.parcelles.filter(p => p.statut === 'urgent').length;
      this.donutLegend[3].count = data.parcelles.filter(p => p.statut === 'recolte').length;
      this.loading = false;
      this.cdr.markForCheck();
      afterNextRender(() => this.initCharts(), { injector: this.injector });
    });
  }

  ngAfterViewInit(): void {
    afterNextRender(() => this.initMap(), { injector: this.injector });
  }

  chartError = false;

  private initCharts(): void {
    const dark = this.themeService.isDark();
    const gridColor = dark ? '#374151' : '#f3f4f6';
    const textColor = dark ? '#d1d5db' : undefined;

    try {
    // Bar chart
    const actCtx = this.activityChartRef?.nativeElement?.getContext('2d');
    if (actCtx) {
      this.activityChartInstance = new Chart(actCtx, {
        type: 'bar',
        data: {
          labels: this.activiteSemaine.map(a => a.jour),
          datasets: [{
            label: 'Visites',
            data: this.activiteSemaine.map(a => a.count),
            backgroundColor: '#1A7A4A',
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { font: { size: 11 }, color: textColor } },
            x: { grid: { display: false }, ticks: { font: { size: 11 }, color: textColor } }
          }
        }
      });
    }
    // Donut chart
    const donutCtx = this.donutChartRef?.nativeElement?.getContext('2d');
    if (donutCtx) {
      this.donutChartInstance = new Chart(donutCtx, {
        type: 'doughnut',
        data: {
          labels: this.donutLegend.map(d => d.label),
          datasets: [{
            data: this.donutLegend.map(d => d.count),
            backgroundColor: this.donutLegend.map(d => d.color),
            borderWidth: 0,
            hoverOffset: 6,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          cutout: '72%',
        }
      });
    }
    } catch (e) {
      this.chartError = true;
      this.cdr.markForCheck();
    }
  }

  mapError = false;

  private initMap(): void {
    if (!this.miniMapRef?.nativeElement) return;
    const map = L.map(this.miniMapRef.nativeElement, { zoomControl: true, scrollWheelZoom: false })
      .setView([14.5, -15.5], 6);
    const tileUrl = this.themeService.isDark()
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileLayer = L.tileLayer(tileUrl, {
      attribution: '© OpenStreetMap © CartoDB'
    }).addTo(map);
    tileLayer.on('tileerror', () => {
      this.mapError = true;
      this.cdr.markForCheck();
    });

    this.toutes.forEach(p => {
      const color = p.statut === 'urgent' ? '#ef4444' : p.statut === 'attention' ? '#f59e0b' : '#22c55e';
      const marker = L.circleMarker([p.coordonnees.lat, p.coordonnees.lng], {
        radius: 8, fillColor: color, color: 'white', weight: 2, opacity: 1, fillOpacity: 0.9
      }).addTo(map);
      marker.bindPopup(`<b>${p.nom}</b><br/>${p.culture} · ${p.superficie} ha`);
    });
  }

  getTechnicienNom(id: string): string {
    const m = MOCK_MEMBRES.find(m => m.id === id);
    return m ? `${m.prenom} ${m.nom}` : id;
  }

  getParcelleNom(id: string): string {
    return this.toutes.find(p => p.id === id)?.nom ?? id;
  }

  conditionLabel(c?: string): string {
    return { soleil: 'Ensoleillé', nuageux: 'Nuageux', pluie: 'Pluvieux', orage: 'Orageux', vent: 'Venteux' }[c ?? ''] ?? c ?? '';
  }

  conditionEmoji(c?: string): string {
    return { soleil: '☀️', nuageux: '⛅', pluie: '🌧️', orage: '⛈️', vent: '💨' }[c ?? ''] ?? '🌤️';
  }

  cultureEmoji(c: string): string {
    return { riz: '🌾', mais: '🌽', mil: '🌿', arachide: '🥜', oignon: '🧅', tomate: '🍅' }[c] ?? '🌱';
  }

  refresh(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.ngOnInit();
  }

  trackById(_: number, item: { id: string }): string { return item.id; }

  private getWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime() + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;
    return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
  }
}
