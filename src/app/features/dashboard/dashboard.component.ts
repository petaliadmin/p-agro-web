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
import { PullToRefreshDirective } from '../../shared/directives/pull-to-refresh.directive';
import { IrrigationService } from '../../core/services/irrigation.service';
import { PluviometrieJour } from '../../core/models/irrigation.model';
import { NdviService } from '../../core/services/ndvi.service';
import { NdviData, getNdviClasse, getNdviColor, getNdviClasseLabel } from '../../core/models/ndvi.model';

import { Chart, registerables } from 'chart.js';
import * as L from 'leaflet';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, StatusChipComponent, LoadingSkeletonComponent, PageHeaderComponent, AvatarComponent, PullToRefreshDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div (appPullToRefresh)="refresh()"></div>
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

    <!-- Santé globale NDVI -->
    <div *ngIf="ndviMoyenGlobal > 0" class="card p-4 lg:p-5 mb-4 sm:mb-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span class="material-icons text-emerald-600 text-[18px]" aria-hidden="true">satellite_alt</span>
          Santé globale des cultures (NDVI)
        </h3>
        <a routerLink="/parcelles" class="text-xs text-primary-600 hover:text-primary-800 font-medium">Voir parcelles →</a>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">NDVI moyen</p>
          <p class="text-3xl font-bold" [style.color]="getNdviColorDash(ndviMoyenGlobal)">{{ ndviMoyenGlobal | number:'1.2-2' }}</p>
          <p class="text-[10px] text-gray-500 mt-1">{{ getNdviClasseLabelDash(ndviMoyenGlobal) }}</p>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
          <p class="text-xs text-green-600 dark:text-green-400 mb-1">Sain (> 0.6)</p>
          <p class="text-3xl font-bold text-green-700 dark:text-green-300">{{ ndviSainPct }}%</p>
          <div class="w-full bg-green-200 dark:bg-green-800 rounded-full h-1.5 mt-2">
            <div class="bg-green-600 h-1.5 rounded-full" [style.width.%]="ndviSainPct"></div>
          </div>
        </div>
        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center">
          <p class="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Attention (0.3–0.6)</p>
          <p class="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{{ ndviAttentionPct }}%</p>
          <div class="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-1.5 mt-2">
            <div class="bg-yellow-500 h-1.5 rounded-full" [style.width.%]="ndviAttentionPct"></div>
          </div>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
          <p class="text-xs text-red-600 dark:text-red-400 mb-1">Stress (< 0.3)</p>
          <p class="text-3xl font-bold text-red-700 dark:text-red-300">{{ ndviStressPct }}%</p>
          <div class="w-full bg-red-200 dark:bg-red-800 rounded-full h-1.5 mt-2">
            <div class="bg-red-500 h-1.5 rounded-full" [style.width.%]="ndviStressPct"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row : Charts + Météo -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 mb-4">
      <!-- Graphique activité semaine -->
      <div class="card p-3 sm:p-5 md:col-span-2 xl:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Activité hebdomadaire</h3>
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
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Météo</h3>
          <span class="text-xs text-gray-500">{{ meteo[0].ville }}</span>
        </div>
        <!-- Aujourd'hui -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-4xl font-bold text-gray-900 dark:text-gray-100">{{ meteo[0].temperature }}°</p>
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
        <div class="border-t border-gray-100 dark:border-gray-700 pt-3 grid grid-cols-3 gap-2">
          <div *ngFor="let jour of meteo; let i = index" class="text-center">
            <p class="text-xs text-gray-500">{{ i === 0 ? 'Auj.' : i === 1 ? 'Dem.' : 'Apr.' }}</p>
            <p class="text-lg my-1">{{ conditionEmoji(jour.condition) }}</p>
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-200">{{ jour.temperature }}°</p>
            <p class="text-[10px] text-gray-500">{{ jour.temperatureMin }}°-{{ jour.temperatureMax }}°</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Widget pluviométrie 30 jours -->
    <div class="card p-3 sm:p-5 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span class="material-icons text-blue-500 text-[18px]" aria-hidden="true">water_drop</span>
          Pluviométrie (30 derniers jours)
        </h3>
        <span class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ totalPluvio30j }} mm</span>
      </div>
      <canvas #pluvioChart height="60" role="img" aria-label="Graphique de la pluviométrie des 30 derniers jours"></canvas>
    </div>

    <!-- Row : Parcelles à risque + Dernières visites -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 mb-4">
      <!-- Parcelles urgentes -->
      <div class="card lg:col-span-2">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Parcelles à risque</h3>
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
            <tr *ngFor="let p of parcellesUrgentes; trackBy: trackById" class="table-row cursor-pointer" (click)="openParcelleDetail(p)">
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
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">État des cultures</h3>
        <p class="text-xs text-gray-500 mb-4">Répartition par statut</p>
        <canvas #donutChart height="180" role="img" aria-label="Graphique en anneau montrant la répartition des cultures par statut"></canvas>
        <div class="mt-4 space-y-2">
          <div class="flex items-center justify-between" *ngFor="let item of donutLegend">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" [style.background]="item.color"></div>
              <span class="text-xs text-gray-600 dark:text-gray-400">{{ item.label }}</span>
            </div>
            <span class="text-xs font-semibold text-gray-900 dark:text-gray-100">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Problèmes terrain détectés -->
    <div *ngIf="problemesTerrain.length > 0" class="card mb-4">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span class="material-icons text-orange-500 text-[18px]" aria-hidden="true">report_problem</span>
          Problèmes terrain récents
        </h3>
        <a routerLink="/visites" class="text-xs text-primary-600 hover:text-primary-800 font-medium">Voir les visites →</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
        <div *ngFor="let pb of problemesTerrain" class="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <span class="material-icons text-orange-600 text-[18px] mt-0.5" aria-hidden="true">{{ pb.icon }}</span>
          <div class="min-w-0">
            <p class="text-sm font-medium text-orange-800 dark:text-orange-200">{{ pb.label }}</p>
            <p class="text-xs text-orange-600 dark:text-orange-400 mt-0.5">{{ pb.parcelle }} — {{ pb.date | date:'dd/MM' }}</p>
            <p *ngIf="pb.action" class="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">→ {{ pb.action }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dernières visites + Carte mini -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4">
      <!-- Feed visites -->
      <div class="card lg:col-span-1">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Dernières visites</h3>
          <a routerLink="/visites" class="text-xs text-primary-600 hover:text-primary-800 font-medium">Voir toutes →</a>
        </div>
        <div class="divide-y divide-gray-50 dark:divide-gray-700">
          <div
            *ngFor="let v of dernieresVisites; trackBy: trackById"
            class="flex gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            [routerLink]="['/visites', v.id]"
          >
            <app-avatar [nom]="getTechnicienNom(v.technicienId).split(' ')[1] || 'X'" [prenom]="getTechnicienNom(v.technicienId).split(' ')[0]" size="sm"></app-avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ getParcelleNom(v.parcelleId) }}</p>
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
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Carte des parcelles</h3>
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

    <!-- ═══ Parcelle detail slide-in panel ═══ -->
    <div *ngIf="showParcellePanel && selectedParcelle" class="fixed inset-0 z-50 flex justify-end">
      <div class="fixed inset-0 bg-black/30" (click)="closeParcellePanel()" aria-hidden="true"></div>
      <div class="relative w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto animate-slide-in-right"
        (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ selectedParcelle.nom }}</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ selectedParcelle.code }} · {{ selectedParcelle.zone }}</p>
          </div>
          <div class="flex items-center gap-2">
            <a [routerLink]="['/parcelles', selectedParcelle.id]"
              class="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 font-medium flex items-center gap-1">
              <span class="material-icons text-[14px]">open_in_new</span> Detail complet
            </a>
            <button (click)="closeParcellePanel()" class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span class="material-icons text-[18px]">close</span>
            </button>
          </div>
        </div>

        <div class="p-5 space-y-4">
          <app-status-chip [statut]="selectedParcelle.statut"></app-status-chip>

          <!-- Infos de base -->
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Culture</p><p class="font-medium capitalize mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.culture }}</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Variete</p><p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.variete || '—' }}</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Superficie</p><p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.superficie }} ha</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Stade</p><p class="font-medium capitalize mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.stade }}</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Campagne</p><p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ getPanelCampagneLabel(selectedParcelle.typeCampagne) }}</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Rendement prec.</p><p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.rendementPrecedent }} t/ha</p></div>
          </div>

          <!-- Terrain & Acces -->
          <h4 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Terrain & Acces</h4>
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Type de sol</p><p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ getPanelTypeSolLabel(selectedParcelle.typeSol) || selectedParcelle.typesSol }}</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Source d'eau</p><p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ getPanelSourceEauLabel(selectedParcelle.sourceEau) }}</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Mode d'acces</p><p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ getPanelModeAccesLabel(selectedParcelle.modeAccesTerre) }}</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Zone agroeco.</p><p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.zoneAgroecologique || '—' }}</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Localite</p><p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.localite || '—' }}</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Densite</p><p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.densite || '—' }}</p></div>
          </div>

          <!-- Exploitant & Rotation -->
          <h4 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Exploitant & Rotation</h4>
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Producteur</p><p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.producteurNom }}</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Exploitant</p><p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.exploitantNom || selectedParcelle.producteurNom }}</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Date de semis</p><p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.dateSemis ? (selectedParcelle.dateSemis | date:'dd/MM/yyyy') : '—' }}</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Culture precedente</p><p class="font-medium capitalize mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.culturePrecedente || '—' }}</p></div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-gray-400">Rotation prevue</p><p class="font-medium capitalize mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.rotationPrevue || '—' }}</p></div>
          </div>

          <!-- NDVI -->
          <div *ngIf="ndviByParcelle[selectedParcelle.id]" class="rounded-xl p-3 border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <p class="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <span class="material-icons text-[14px]">satellite_alt</span>
              NDVI : {{ ndviByParcelle[selectedParcelle.id].ndviMoyen.toFixed(2) }}
              — {{ getNdviClasseLabelDash(ndviByParcelle[selectedParcelle.id].ndviMoyen) }}
            </p>
          </div>

          <!-- Visites -->
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p class="text-xs text-gray-500 dark:text-gray-400">Derniere visite</p>
              <p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.derniereVisite | date:'dd/MM/yyyy' }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p class="text-xs text-gray-500 dark:text-gray-400">Prochaine visite</p>
              <p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ selectedParcelle.prochaineVisite | date:'dd/MM/yyyy' }}</p>
            </div>
          </div>

          <!-- Technicien -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p class="text-xs text-gray-500 dark:text-gray-400">Technicien assigne</p>
            <p class="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{{ getTechnicienNom(selectedParcelle.technicienId) }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .animate-slide-in-right { animation: slideInRight 0.25s ease-out forwards; }
  `],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('activityChart') activityChartRef!: ElementRef;
  @ViewChild('donutChart') donutChartRef!: ElementRef;
  @ViewChild('pluvioChart') pluvioChartRef?: ElementRef;
  @ViewChild('miniMap') miniMapRef!: ElementRef;

  loading = true;
  stats = { parcelles: 0, totalHa: 0, visitesDuJour: 0, visitesCompletees: 0, tachesUrgentes: 0, alertesIntrants: 0 };
  activiteSemaine: { jour: string; count: number }[] = [];
  parcellesUrgentes: Parcelle[] = [];
  dernieresVisites: Visite[] = [];
  meteo: MeteoJour[] = [];
  toutes: Parcelle[] = [];
  pluviometrie: PluviometrieJour[] = [];
  totalPluvio30j = 0;
  problemesTerrain: { icon: string; label: string; parcelle: string; date: Date; action?: string }[] = [];

  // NDVI
  ndviMoyenGlobal = 0;
  ndviSainPct = 0;
  ndviAttentionPct = 0;
  ndviStressPct = 0;
  ndviByParcelle: Record<string, NdviData> = {};

  // Parcelle detail panel
  selectedParcelle: Parcelle | null = null;
  showParcellePanel = false;

  currentWeekNumber = this.getWeekNumber();

  donutLegend = [
    { label: 'Sain', color: '#22c55e', count: 0 },
    { label: 'Attention', color: '#f59e0b', count: 0 },
    { label: 'Urgent', color: '#ef4444', count: 0 },
    { label: 'Récolte', color: '#a855f7', count: 0 },
  ];

  private activityChartInstance?: Chart;
  private donutChartInstance?: Chart;
  private pluvioChartInstance?: Chart;
  private mapInstance?: L.Map;

  constructor(
    private parcelleService: ParcelleService,
    private visiteService: VisiteService,
    private tacheService: TacheService,
    private intrantService: IntrantService,
    private meteoService: MeteoService,
    private irrigationService: IrrigationService,
    private ndviService: NdviService,
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
          this.pluvioChartInstance?.destroy();
          this.activityChartInstance = undefined;
          this.donutChartInstance = undefined;
          this.pluvioChartInstance = undefined;
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
      this.buildProblemesTerrain(data.recentes, data.parcelles);
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

    // Pluviométrie (indépendant du forkJoin principal)
    this.irrigationService.getPluviometrie30j().pipe(take(1)).subscribe(pluvio => {
      this.pluviometrie = pluvio;
      this.totalPluvio30j = Math.round(pluvio.reduce((sum, j) => sum + j.quantite, 0));
      this.cdr.markForCheck();
      afterNextRender(() => this.initPluvioChart(), { injector: this.injector });
    });

    // NDVI global
    this.ndviService.getLatestAll().pipe(take(1)).subscribe(ndviList => {
      ndviList.forEach(n => this.ndviByParcelle[n.parcelleId] = n);
      if (ndviList.length > 0) {
        this.ndviMoyenGlobal = Math.round(ndviList.reduce((s, n) => s + n.ndviMoyen, 0) / ndviList.length * 100) / 100;
        const total = ndviList.length;
        this.ndviSainPct = Math.round(ndviList.filter(n => getNdviClasse(n.ndviMoyen) === 'sain').length / total * 100);
        this.ndviAttentionPct = Math.round(ndviList.filter(n => getNdviClasse(n.ndviMoyen) === 'attention').length / total * 100);
        this.ndviStressPct = 100 - this.ndviSainPct - this.ndviAttentionPct;
      }
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    afterNextRender(() => this.initMap(), { injector: this.injector });
  }

  chartError = false;

  private getChartColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      grid: style.getPropertyValue('--chart-grid').trim() || '#f3f4f6',
      text: style.getPropertyValue('--chart-text').trim() || '#374151',
      primary: style.getPropertyValue('--chart-primary').trim() || '#1A7A4A',
      secondary: style.getPropertyValue('--chart-secondary').trim() || '#d1d5db',
    };
  }

  private initCharts(): void {
    const colors = this.getChartColors();

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
            backgroundColor: colors.primary,
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: colors.grid }, ticks: { font: { size: 11 }, color: colors.text } },
            x: { grid: { display: false }, ticks: { font: { size: 11 }, color: colors.text } }
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
            borderColor: colors.grid,
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

  private initPluvioChart(): void {
    const ctx = this.pluvioChartRef?.nativeElement?.getContext('2d');
    if (!ctx || !this.pluviometrie.length) return;

    const colors = this.getChartColors();
    const labels = this.pluviometrie.map(p => {
      const d = new Date(p.date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    this.pluvioChartInstance?.destroy();
    this.pluvioChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Pluie (mm)',
          data: this.pluviometrie.map(p => p.quantite),
          backgroundColor: this.pluviometrie.map(p => p.quantite > 30 ? '#3b82f6' : p.quantite > 10 ? '#60a5fa' : p.quantite > 0 ? '#93c5fd' : colors.secondary),
          borderRadius: 3,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (item) => `${item.raw} mm` } } },
        scales: {
          y: { beginAtZero: true, grid: { color: colors.grid }, ticks: { font: { size: 10 }, color: colors.text, callback: (v) => v + ' mm' } },
          x: { grid: { display: false }, ticks: { font: { size: 9 }, color: colors.text, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } }
        }
      }
    });
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

  getNdviColorDash(val: number): string { return getNdviColor(val); }
  getNdviClasseLabelDash(val: number): string { return getNdviClasseLabel(getNdviClasse(val)); }

  private buildProblemesTerrain(visites: Visite[], parcelles: Parcelle[]): void {
    const problems: typeof this.problemesTerrain = [];
    const getName = (id: string) => parcelles.find(p => p.id === id)?.nom || id;

    visites.forEach(v => {
      const obs = v.observations;
      if (obs.problemeSol?.length) {
        const labels: Record<string, string> = { erosion: 'Érosion', salinite: 'Salinité', compaction: 'Compaction', engorgement: 'Engorgement', acidite: 'Acidité' };
        obs.problemeSol.forEach(p => {
          problems.push({ icon: 'terrain', label: `Sol : ${labels[p] || p}`, parcelle: getName(v.parcelleId), date: v.date, action: obs.actionRecommandeeImmediate });
        });
      }
      if (obs.problemeVent) {
        problems.push({ icon: 'air', label: 'Dégâts liés au vent', parcelle: getName(v.parcelleId), date: v.date });
      }
      if (obs.problemeAnimaux) {
        problems.push({ icon: 'pets', label: `Animaux : ${obs.problemeAnimaux}`, parcelle: getName(v.parcelleId), date: v.date });
      }
      if (obs.etatGeneral && obs.etatGeneral <= 2) {
        problems.push({ icon: 'warning', label: `État critique (${obs.etatGeneral}/5)`, parcelle: getName(v.parcelleId), date: v.date, action: obs.actionRecommandeeImmediate });
      }
    });
    this.problemesTerrain = problems.slice(0, 6);
  }

  private getWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime() + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;
    return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
  }

  // ── Parcelle detail panel ──

  openParcelleDetail(p: Parcelle): void {
    this.selectedParcelle = p;
    this.showParcellePanel = true;
    this.cdr.markForCheck();
  }

  closeParcellePanel(): void {
    this.selectedParcelle = null;
    this.showParcellePanel = false;
    this.cdr.markForCheck();
  }

  getPanelTypeSolLabel(typeSol?: string): string {
    const map: Record<string, string> = {
      dior: 'Dior (sableux ferrugineux)', deck: 'Deck (argileux hydromorphe)',
      argileux: 'Argileux', sableux: 'Sableux', 'argilo-sableux': 'Argilo-sableux',
      lateritique: 'Lateritique', limoneux: 'Limoneux', 'sablo-humifere': 'Sablo-humifere',
    };
    return typeSol ? (map[typeSol] || typeSol) : '—';
  }

  getPanelSourceEauLabel(sourceEau?: string): string {
    const map: Record<string, string> = {
      pluie: 'Pluie (pluvial)', forage: 'Forage', canal: "Canal d'irrigation",
      fleuve: 'Fleuve', bassin: 'Bassin de retention', puits: 'Puits',
    };
    return sourceEau ? (map[sourceEau] || sourceEau) : '—';
  }

  getPanelModeAccesLabel(mode?: string): string {
    const map: Record<string, string> = {
      propriete: 'Propriete', pret: 'Pret', location: 'Location', communautaire: 'Communautaire',
    };
    return mode ? (map[mode] || mode) : '—';
  }

  getPanelCampagneLabel(type?: string): string {
    const map: Record<string, string> = {
      hivernage: 'Hivernage', contre_saison_froide: 'Contre-saison froide', contre_saison_chaude: 'Contre-saison chaude',
    };
    return type ? (map[type] || type) : '—';
  }
}
