import {
  Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef,
  ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ParcelleService } from '../../core/services/parcelle.service';
import { VisiteService } from '../../core/services/visite.service';
import { IntrantService } from '../../core/services/intrant.service';
import { IrrigationService } from '../../core/services/irrigation.service';
import { NdviService } from '../../core/services/ndvi.service';
import { CampagneService } from '../../core/services/campagne.service';
import { InterventionService } from '../../core/services/intervention.service';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { ThemeService } from '../../core/services/theme.service';
import { PdfReportService } from '../../core/services/pdf-report.service';
import {
  StatusChipComponent, PageHeaderComponent, LoadingSkeletonComponent, AvatarComponent
} from '../../shared/components/shared-components';
import { Parcelle } from '../../core/models/parcelle.model';
import { Visite } from '../../core/models/visite.model';
import { BilanHydrique, Irrigation, EvenementClimatique } from '../../core/models/irrigation.model';
import { NdviData, NdviClasse, getNdviColor, getNdviColorSmooth, getNdviClasse, getNdviClasseLabel } from '../../core/models/ndvi.model';
import { Campagne } from '../../core/models/campagne.model';
import { Intervention, INTERVENTION_ICONS, INTERVENTION_LABELS, STATUT_COLORS } from '../../core/models/intervention.model';
import { MOCK_MEMBRES } from '../../../assets/mock-data/taches.mock';
import { take } from 'rxjs/operators';

import * as L from 'leaflet';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

type TabId = 'overview' | 'campagne' | 'visites' | 'intrants' | 'rendement';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-parcelle-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusChipComponent, PageHeaderComponent, LoadingSkeletonComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="parcelle?.nom || 'Parcelle'" [breadcrumbs]="[{label:'Parcelles',route:'/parcelles'},{label:parcelle?.code || ''}]">
      <div class="flex gap-2">
        <button (click)="onDelete()" class="text-sm px-3 py-1.5 rounded-lg font-medium text-red-600 border border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5">
          <span class="material-icons text-[14px]" aria-hidden="true">delete</span> Supprimer
        </button>
        <button (click)="downloadPdf()" [disabled]="generatingPdf"
          class="text-sm px-3 py-1.5 rounded-lg font-medium text-primary-700 border border-primary-200 hover:bg-primary-50 dark:text-primary-300 dark:border-primary-800 dark:hover:bg-primary-900/20 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Télécharger le rapport PDF">
          <span class="material-icons text-[14px]" aria-hidden="true">{{ generatingPdf ? 'hourglass_empty' : 'picture_as_pdf' }}</span>
          {{ generatingPdf ? 'Génération…' : 'Télécharger PDF' }}
        </button>
        <button (click)="openEdit()" class="btn-secondary text-sm">Modifier</button>
        <button (click)="openNewVisite()" class="btn-primary text-sm flex items-center gap-1.5">
          <span class="material-icons text-[14px]" aria-hidden="true">add</span> Nouvelle visite
        </button>
      </div>
    </app-page-header>

    <app-loading-skeleton *ngIf="!parcelle" [rows]="4"></app-loading-skeleton>

    <div *ngIf="parcelle" class="space-y-5">

      <!-- ═══ TABS ═══ -->
      <div class="card overflow-hidden">
        <div class="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto scrollbar-hide">
          <button *ngFor="let tab of tabs"
            (click)="setTab(tab.id)"
            class="flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
            [ngClass]="activeTab === tab.id
              ? 'border-primary-600 text-primary-700 dark:text-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'">
            <span class="material-icons text-[16px]" aria-hidden="true">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- ═══ TAB : VUE D'ENSEMBLE ═══ -->
      <div [hidden]="activeTab !== 'overview'">
        <!-- KPIs -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="card p-4 text-center">
            <div class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 mb-2">
              <span class="material-icons text-primary-600 dark:text-primary-400 text-[18px]" aria-hidden="true">straighten</span>
            </div>
            <p class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ parcelle.superficie }} ha</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Superficie</p>
          </div>
          <div class="card p-4 text-center">
            <div class="inline-flex items-center justify-center w-9 h-9 rounded-lg mb-2"
              [ngClass]="ndviLatest ? (getNdviClasse(ndviLatest.ndviMoyen) === 'sain' ? 'bg-green-100 dark:bg-green-900/30' : getNdviClasse(ndviLatest.ndviMoyen) === 'attention' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30') : 'bg-gray-100 dark:bg-gray-700'">
              <span class="material-icons text-[18px]" aria-hidden="true"
                [ngClass]="ndviLatest ? (getNdviClasse(ndviLatest.ndviMoyen) === 'sain' ? 'text-green-600 dark:text-green-400' : getNdviClasse(ndviLatest.ndviMoyen) === 'attention' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400') : 'text-gray-400'">satellite_alt</span>
            </div>
            <p class="text-xl font-bold" [style.color]="ndviLatest ? getNdviColor(ndviLatest.ndviMoyen) : '#9ca3af'">
              {{ ndviLatest ? (ndviLatest.ndviMoyen | number:'1.2-2') : '--' }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">NDVI</p>
          </div>
          <div class="card p-4 text-center">
            <div class="inline-flex items-center justify-center w-9 h-9 rounded-lg mb-2"
              [ngClass]="bilanHydrique?.stressHydrique ? (bilanHydrique?.niveauStress === 'severe' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30') : 'bg-blue-100 dark:bg-blue-900/30'">
              <span class="material-icons text-[18px]" aria-hidden="true"
                [ngClass]="bilanHydrique?.stressHydrique ? (bilanHydrique?.niveauStress === 'severe' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400') : 'text-blue-600 dark:text-blue-400'">water_drop</span>
            </div>
            <p class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ bilanHydrique?.pluviometrie30j || 0 }} mm</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Pluie 30j</p>
          </div>
          <div class="card p-4 text-center">
            <div class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-2">
              <span class="material-icons text-purple-600 dark:text-purple-400 text-[18px]" aria-hidden="true">trending_up</span>
            </div>
            <p class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ activeCampagne ? activeCampagne.progressionPct : 0 }}%</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Campagne</p>
          </div>
        </div>

        <!-- Row : Infos + Cartes -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
          <div class="card p-5 lg:col-span-2">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ parcelle.nom }}</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ parcelle.code }} · {{ parcelle.zone }}</p>
              </div>
              <app-status-chip [statut]="parcelle.statut"></app-status-chip>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Culture</p>
                <p class="font-medium capitalize mt-0.5 dark:text-gray-100">{{ parcelle.culture }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Superficie</p>
                <p class="font-medium mt-0.5 dark:text-gray-100">{{ parcelle.superficie }} ha</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Stade</p>
                <p class="font-medium capitalize mt-0.5 dark:text-gray-100">{{ parcelle.stade }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Type de sol</p>
                <p class="font-medium mt-0.5 dark:text-gray-100">{{ parcelle.typesSol || parcelle.typeSol || '--' }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Producteur</p>
                <p class="font-medium mt-0.5 dark:text-gray-100">{{ parcelle.producteurNom }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Rendement prec.</p>
                <p class="font-medium mt-0.5 dark:text-gray-100">{{ parcelle.rendementPrecedent }} t/ha</p>
              </div>
            </div>
            <!-- Champs enrichis (si renseignes) -->
            <div *ngIf="parcelle.zoneAgroecologique || parcelle.sourceEau || parcelle.variete || parcelle.modeAccesTerre"
              class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div *ngIf="parcelle.zoneAgroecologique" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Zone agroeco.</p>
                <p class="font-medium mt-0.5 dark:text-gray-100 text-sm">{{ parcelle.zoneAgroecologique }}</p>
              </div>
              <div *ngIf="parcelle.sourceEau" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Source d'eau</p>
                <p class="font-medium capitalize mt-0.5 dark:text-gray-100">{{ parcelle.sourceEau }}</p>
              </div>
              <div *ngIf="parcelle.variete" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Variete</p>
                <p class="font-medium mt-0.5 dark:text-gray-100">{{ parcelle.variete }}</p>
              </div>
              <div *ngIf="parcelle.modeAccesTerre" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Acces terre</p>
                <p class="font-medium capitalize mt-0.5 dark:text-gray-100">{{ parcelle.modeAccesTerre }}</p>
              </div>
              <div *ngIf="parcelle.localite" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p class="text-xs text-gray-500 dark:text-gray-400">Localite</p>
                <p class="font-medium mt-0.5 dark:text-gray-100">{{ parcelle.localite }}</p>
              </div>
            </div>
          </div>
          <!-- Carte localisation -->
          <div class="card overflow-hidden flex flex-col" style="min-height: 280px;">
            <div class="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Localisation</span>
              <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                <button (click)="setMapView('satellite')"
                  class="px-2 py-1 text-[10px] font-medium rounded-md transition-colors"
                  [ngClass]="mapViewMode === 'satellite' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'">
                  Satellite
                </button>
                <button (click)="setMapView('plan')"
                  class="px-2 py-1 text-[10px] font-medium rounded-md transition-colors"
                  [ngClass]="mapViewMode === 'plan' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'">
                  Plan
                </button>
              </div>
            </div>
            <div #mapContainer class="flex-1 z-0" style="min-height: 240px;"></div>
          </div>
        </div>

        <!-- Carte NDVI -->
        <div [hidden]="!ndviLatest || !parcelle.geometry || parcelle.geometry.length < 3" class="card overflow-hidden">
          <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span class="material-icons text-[16px] text-green-600 dark:text-green-400" aria-hidden="true">satellite_alt</span>
              Indice de vegetation (NDVI)
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ ndviLatest?.date | date:'dd/MM/yyyy' }}</span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                [style.background]="getNdviColor(ndviLatest?.ndviMoyen || 0) + '18'"
                [style.color]="getNdviColor(ndviLatest?.ndviMoyen || 0)">
                {{ ndviLatest?.ndviMoyen | number:'1.2-2' }} · {{ getNdviClasseLabel(getNdviClasse(ndviLatest?.ndviMoyen || 0)) }}
              </span>
            </div>
          </div>
          <div class="relative">
            <div #ndviMapContainer style="height: 320px;" class="z-0"></div>
            <!-- Legende NDVI -->
            <div class="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 px-3 py-2">
              <p class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">NDVI</p>
              <div class="flex items-center gap-1">
                <span class="text-[10px] text-gray-500 dark:text-gray-400">0</span>
                <div class="flex h-2.5 rounded-full overflow-hidden" style="width: 120px;">
                  <div class="flex-1" style="background: #d73027;"></div>
                  <div class="flex-1" style="background: #f46d43;"></div>
                  <div class="flex-1" style="background: #fdae61;"></div>
                  <div class="flex-1" style="background: #fee08b;"></div>
                  <div class="flex-1" style="background: #d9ef8b;"></div>
                  <div class="flex-1" style="background: #a6d96a;"></div>
                  <div class="flex-1" style="background: #66bd63;"></div>
                  <div class="flex-1" style="background: #1a9850;"></div>
                </div>
                <span class="text-[10px] text-gray-500 dark:text-gray-400">1</span>
              </div>
              <div class="flex justify-between mt-1 text-[9px] text-gray-400 dark:text-gray-500" style="padding: 0 14px;">
                <span>Stress</span>
                <span>Attention</span>
                <span>Sain</span>
              </div>
            </div>
            <!-- NDVI zones info -->
            <div *ngIf="ndviLatest && ndviLatest.zones && ndviLatest.zones.length > 1"
              class="absolute top-3 right-3 z-[1000] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 px-3 py-2 min-w-[140px]">
              <p class="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Zones</p>
              <div class="space-y-1">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-xs text-gray-600 dark:text-gray-300">Moyen</span>
                  <span class="text-xs font-bold" [style.color]="getNdviColor(ndviLatest?.ndviMoyen || 0)">{{ ndviLatest?.ndviMoyen | number:'1.2-2' }}</span>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span class="text-xs text-gray-600 dark:text-gray-300">Min</span>
                  <span class="text-xs font-bold" [style.color]="getNdviColor(ndviLatest?.ndviMin || 0)">{{ ndviLatest?.ndviMin | number:'1.2-2' }}</span>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span class="text-xs text-gray-600 dark:text-gray-300">Max</span>
                  <span class="text-xs font-bold" [style.color]="getNdviColor(ndviLatest?.ndviMax || 0)">{{ ndviLatest?.ndviMax | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Prochaine visite -->
        <div class="card p-5">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Prochaine visite planifiee</h3>
              <div class="flex items-center gap-3">
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ parcelle.prochaineVisite | date:'dd/MM/yyyy' }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-600">·</span>
                <div class="flex items-center gap-1.5">
                  <app-avatar [nom]="getTechNom(parcelle.technicienId).split(' ')[1] || ''" [prenom]="getTechNom(parcelle.technicienId).split(' ')[0]" size="sm"></app-avatar>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ getTechNom(parcelle.technicienId) }}</span>
                </div>
              </div>
            </div>
            <span class="material-icons text-primary-600 dark:text-primary-400" aria-hidden="true">event</span>
          </div>
        </div>

        <!-- Stress hydrique alert -->
        <div *ngIf="bilanHydrique?.stressHydrique" class="card p-4 border-l-4"
          [ngClass]="bilanHydrique?.niveauStress === 'severe' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' : bilanHydrique?.niveauStress === 'modere' ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10' : 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'">
          <div class="flex items-center gap-3">
            <span class="material-icons text-[20px]" aria-hidden="true"
              [ngClass]="bilanHydrique?.niveauStress === 'severe' ? 'text-red-600' : bilanHydrique?.niveauStress === 'modere' ? 'text-orange-600' : 'text-yellow-600'">warning</span>
            <div>
              <p class="text-sm font-medium" [ngClass]="bilanHydrique?.niveauStress === 'severe' ? 'text-red-800 dark:text-red-200' : bilanHydrique?.niveauStress === 'modere' ? 'text-orange-800 dark:text-orange-200' : 'text-yellow-800 dark:text-yellow-200'">
                Stress hydrique {{ bilanHydrique?.niveauStress }}
              </p>
              <p class="text-xs mt-0.5" [ngClass]="bilanHydrique?.niveauStress === 'severe' ? 'text-red-600 dark:text-red-300' : bilanHydrique?.niveauStress === 'modere' ? 'text-orange-600 dark:text-orange-300' : 'text-yellow-600 dark:text-yellow-300'">
                Pluviometrie 30j : {{ bilanHydrique?.pluviometrie30j }} mm
                <span *ngIf="bilanHydrique?.dernierArrosage"> · Dernier arrosage : {{ bilanHydrique?.dernierArrosage | date:'dd/MM' }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ TAB : CAMPAGNE ═══ -->
      <ng-container *ngIf="activeTab === 'campagne'">
        <!-- Campagne active -->
        <div *ngIf="activeCampagne" class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span class="material-icons text-[16px] text-primary-600 dark:text-primary-400" aria-hidden="true">flag</span>
                Campagne en cours
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                {{ activeCampagne.culture }} {{ activeCampagne.variete ? '(' + activeCampagne.variete + ')' : '' }}
                · {{ activeCampagne.typeCampagne?.replace('_', ' ') }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button (click)="openClotureCampagne()" class="text-xs px-3 py-1.5 rounded-lg font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center gap-1">
                <span class="material-icons text-[14px]" aria-hidden="true">stop_circle</span> Cloturer
              </button>
            </div>
          </div>
          <!-- Progress bar -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs text-gray-500 dark:text-gray-400">Progression</span>
              <span class="text-sm font-bold text-primary-700 dark:text-primary-400">{{ activeCampagne.progressionPct }}%</span>
            </div>
            <div class="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-primary-600 dark:bg-primary-500 rounded-full transition-all duration-500"
                [style.width.%]="activeCampagne.progressionPct"></div>
            </div>
          </div>
          <!-- Dates -->
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p class="text-xs text-gray-500 dark:text-gray-400">Debut</p>
              <p class="font-medium dark:text-gray-100">{{ activeCampagne.dateDebut | date:'dd/MM/yyyy' }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p class="text-xs text-gray-500 dark:text-gray-400">Date de semis</p>
              <p class="font-medium dark:text-gray-100">{{ parcelle.dateSemis ? (parcelle.dateSemis | date:'dd/MM/yyyy') : '--' }}</p>
            </div>
          </div>
        </div>

        <!-- No campagne -->
        <div *ngIf="!activeCampagne" class="card p-8 text-center">
          <span class="material-icons text-[40px] text-gray-300 dark:text-gray-600 mb-3" aria-hidden="true">event_busy</span>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Aucune campagne active</p>
          <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">Lancez une nouvelle campagne pour suivre les interventions</p>
          <button (click)="openNouvelleCampagne()" class="btn-primary text-sm mt-4 inline-flex items-center gap-1.5">
            <span class="material-icons text-[14px]" aria-hidden="true">add</span> Nouvelle campagne
          </button>
        </div>

        <!-- Interventions -->
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Interventions</h3>
            <button *ngIf="activeCampagne" (click)="openNewIntervention()" class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 font-medium flex items-center gap-1">
              <span class="material-icons text-[14px]" aria-hidden="true">add</span> Ajouter
            </button>
          </div>
          <div *ngIf="!interventions.length" class="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Aucune intervention enregistree.</div>
          <div *ngIf="interventions.length" class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <div *ngFor="let iv of interventions; trackBy: trackById" class="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center"
                [ngClass]="getInterventionStatusBg(iv.statut)">
                <span class="material-icons text-[16px]" aria-hidden="true"
                  [ngClass]="getInterventionStatusText(iv.statut)">{{ getInterventionIcon(iv.type) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ iv.label }}</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ safeDate(iv.datePrevue) | date:'dd/MM' }}</span>
                  <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                    [ngClass]="getInterventionStatusBg(iv.statut) + ' ' + getInterventionStatusText(iv.statut)">
                    {{ iv.statut === 'planifiee' ? 'Planifiee' : iv.statut === 'en_cours' ? 'En cours' : iv.statut === 'terminee' ? 'Terminee' : 'Annulee' }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ (iv.coutReel || iv.coutEstime) | number }} FCFA</p>
                <p *ngIf="iv.coutReel && iv.coutReel !== iv.coutEstime" class="text-[10px] text-gray-400">est. {{ iv.coutEstime | number }}</p>
              </div>
              <button *ngIf="iv.statut === 'planifiee'" (click)="completeIntervention(iv)" class="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-0.5">
                <span class="material-icons text-[14px]" aria-hidden="true">check</span>
              </button>
            </div>
          </div>
          <!-- Cout total -->
          <div *ngIf="interventions.length" class="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Cout total</span>
            <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ totalCoutInterventions | number }} FCFA</span>
          </div>
        </div>

        <!-- Campagnes passees -->
        <div *ngIf="campagnesTerminees.length" class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Campagnes precedentes</h3>
          </div>
          <div class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <div *ngFor="let c of campagnesTerminees" class="flex items-center gap-4 px-5 py-3">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <span class="material-icons text-[16px] text-gray-500 dark:text-gray-400" aria-hidden="true">history</span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{{ c.culture }} {{ c.variete ? '(' + c.variete + ')' : '' }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ c.dateDebut | date:'MM/yyyy' }} - {{ c.dateFin | date:'MM/yyyy' }}</p>
              </div>
              <div *ngIf="c.rendementFinal" class="text-right">
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ c.rendementFinal }} t/ha</p>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ═══ TAB : VISITES ═══ -->
      <ng-container *ngIf="activeTab === 'visites'">
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Historique des visites</h3>
            <button (click)="openNewVisite()" class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 font-medium flex items-center gap-1">
              <span class="material-icons text-[14px]" aria-hidden="true">add</span> Nouvelle visite
            </button>
          </div>
          <div *ngIf="!visites.length" class="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Aucune visite enregistree.</div>
          <div class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <div *ngFor="let v of visites; trackBy: trackById"
              class="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
              [routerLink]="['/visites', v.id]">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                [ngClass]="v.statut === 'completee' ? 'bg-green-100 dark:bg-green-900/30' : v.statut === 'en_cours' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'">
                <span class="material-icons text-[18px]" aria-hidden="true"
                  [class.text-green-600]="v.statut === 'completee'"
                  [class.text-blue-600]="v.statut === 'en_cours'"
                  [class.text-gray-500]="v.statut === 'planifiee'">
                  {{ v.statut === 'completee' ? 'check_circle' : v.statut === 'en_cours' ? 'pending' : 'schedule' }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Visite du {{ v.date | date:'dd/MM/yyyy' }}</p>
                  <app-status-chip [statut]="v.statut"></app-status-chip>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ getTechNom(v.technicienId) }} · {{ v.duree }} min</p>
                <div *ngIf="v.observations?.maladiesDetectees?.length" class="flex gap-1 mt-1">
                  <span *ngFor="let m of v.observations.maladiesDetectees" class="badge-urgent text-[10px]">{{ m }}</span>
                </div>
                <div *ngIf="v.observations?.ravageursDetectes?.length" class="flex gap-1 mt-1">
                  <span *ngFor="let r of v.observations.ravageursDetectes" class="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-medium">{{ r }}</span>
                </div>
              </div>
              <div class="text-right">
                <p *ngIf="v.observations?.etatGeneral" class="text-sm">
                  <span *ngFor="let s of [1,2,3,4,5]" class="text-[12px]" [ngClass]="s <= (v.observations?.etatGeneral || 0) ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'">&#9733;</span>
                </p>
                <p *ngIf="v.observations?.tauxCouverture" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Couv. {{ v.observations.tauxCouverture }}%</p>
              </div>
              <span class="material-icons text-gray-300 dark:text-gray-600 text-[18px]" aria-hidden="true">chevron_right</span>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ═══ TAB : INTRANTS & IRRIGATION ═══ -->
      <ng-container *ngIf="activeTab === 'intrants'">
        <!-- Bilan hydrique -->
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span class="material-icons text-[16px] text-blue-600 dark:text-blue-400" aria-hidden="true">water_drop</span>
            Bilan hydrique
          </h3>
          <div *ngIf="bilanHydrique" class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <p class="text-xs text-blue-600 dark:text-blue-400">Pluviometrie 30j</p>
              <p class="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">{{ bilanHydrique?.pluviometrie30j }} mm</p>
            </div>
            <div class="rounded-lg p-3 text-center"
              [ngClass]="bilanHydrique?.stressHydrique ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'">
              <p class="text-xs" [ngClass]="bilanHydrique?.stressHydrique ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'">Stress hydrique</p>
              <p class="text-lg font-bold mt-1 capitalize" [ngClass]="bilanHydrique?.stressHydrique ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'">
                {{ bilanHydrique?.stressHydrique ? bilanHydrique?.niveauStress : 'Aucun' }}
              </p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-500 dark:text-gray-400">Dernier arrosage</p>
              <p class="text-lg font-bold text-gray-700 dark:text-gray-300 mt-1">{{ bilanHydrique?.dernierArrosage ? (bilanHydrique?.dernierArrosage | date:'dd/MM') : '--' }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-500 dark:text-gray-400">Source d'eau</p>
              <p class="text-lg font-bold text-gray-700 dark:text-gray-300 mt-1 capitalize">{{ parcelle.sourceEau || '--' }}</p>
            </div>
          </div>
          <div *ngIf="!bilanHydrique" class="text-center py-4 text-sm text-gray-500 dark:text-gray-400">Chargement...</div>
        </div>

        <!-- Irrigations -->
        <div *ngIf="irrigations.length" class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Historique irrigations</h3>
          </div>
          <div class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <div *ngFor="let ir of irrigations" class="flex items-center gap-4 px-5 py-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                <span class="material-icons text-blue-600 dark:text-blue-400 text-[16px]" aria-hidden="true">opacity</span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{{ ir.type.replace('_', ' ') || 'Irrigation' }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ ir.observations || '' }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-blue-600 dark:text-blue-400">{{ ir.quantiteEstimee }} mm</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ ir.date | date:'dd/MM/yy' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Evenements climatiques -->
        <div *ngIf="evenementsClimatiques.length" class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span class="material-icons text-[16px] text-orange-500" aria-hidden="true">thunderstorm</span>
              Evenements climatiques
            </h3>
          </div>
          <div class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <div *ngFor="let ev of evenementsClimatiques" class="flex items-center gap-4 px-5 py-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                [ngClass]="ev.impact === 'critique' || ev.impact === 'severe' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'">
                <span class="material-icons text-[16px]" aria-hidden="true"
                  [ngClass]="ev.impact === 'critique' || ev.impact === 'severe' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'">warning</span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{{ ev.type.replace('_', ' ') }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ ev.description }}</p>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium capitalize"
                  [ngClass]="ev.impact === 'critique' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : ev.impact === 'severe' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ev.impact === 'moyen' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'">
                  {{ ev.impact }}
                </span>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ ev.date | date:'dd/MM/yy' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Intrants -->
        <div class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Intrants utilises sur cette parcelle</h3>
          </div>
          <div *ngIf="!mouvementsParcelle.length" class="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Aucun mouvement enregistre.</div>
          <div *ngIf="mouvementsParcelle.length" class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <div *ngFor="let mv of mouvementsParcelle" class="flex items-center gap-4 px-5 py-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                <span class="material-icons text-red-600 dark:text-red-400 text-[16px]" aria-hidden="true">remove_circle</span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ mv.intrantNom }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ mv.motif }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-red-600 dark:text-red-400">-{{ mv.quantite }} {{ mv.unite }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ mv.date | date:'dd/MM/yy' }}</p>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ═══ TAB : RENDEMENT & NDVI ═══ -->
      <ng-container *ngIf="activeTab === 'rendement'">
        <!-- NDVI actuel -->
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span class="material-icons text-[16px] text-green-600 dark:text-green-400" aria-hidden="true">satellite_alt</span>
            Indice de vegetation (NDVI)
          </h3>
          <div *ngIf="ndviLatest" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div class="rounded-lg p-3 text-center" [style.background]="getNdviColor(ndviLatest.ndviMoyen) + '15'">
              <p class="text-xs" [style.color]="getNdviColor(ndviLatest.ndviMoyen)">NDVI Moyen</p>
              <p class="text-2xl font-bold mt-1" [style.color]="getNdviColor(ndviLatest.ndviMoyen)">{{ ndviLatest.ndviMoyen | number:'1.2-2' }}</p>
              <p class="text-xs mt-1" [style.color]="getNdviColor(ndviLatest.ndviMoyen)">{{ getNdviClasseLabel(getNdviClasse(ndviLatest.ndviMoyen)) }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-500 dark:text-gray-400">NDVI Min</p>
              <p class="text-lg font-bold text-gray-700 dark:text-gray-300 mt-1">{{ ndviLatest.ndviMin | number:'1.2-2' }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-500 dark:text-gray-400">NDVI Max</p>
              <p class="text-lg font-bold text-gray-700 dark:text-gray-300 mt-1">{{ ndviLatest.ndviMax | number:'1.2-2' }}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-500 dark:text-gray-400">Date</p>
              <p class="text-lg font-bold text-gray-700 dark:text-gray-300 mt-1">{{ ndviLatest.date | date:'dd/MM' }}</p>
            </div>
          </div>
          <div *ngIf="!ndviLatest" class="text-center py-4 text-sm text-gray-500 dark:text-gray-400">Aucune donnee NDVI disponible.</div>
        </div>

        <!-- NDVI historique chart -->
        <div *ngIf="ndviHistory.length > 1" class="card p-5">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Evolution NDVI</h3>
          <canvas #ndviChart height="70"></canvas>
        </div>

        <!-- Rendement chart -->
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Evolution du rendement (t/ha)</h3>
          <canvas #rendementChart height="80"></canvas>
        </div>

        <!-- NDVI historique table -->
        <div *ngIf="ndviHistory.length" class="card overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Historique NDVI</h3>
          </div>
          <div class="divide-y divide-gray-50 dark:divide-gray-700/50">
            <div *ngFor="let n of ndviHistory" class="flex items-center gap-4 px-5 py-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center"
                [style.background]="getNdviColor(n.ndviMoyen) + '20'">
                <span class="w-3 h-3 rounded-full" [style.background]="getNdviColor(n.ndviMoyen)"></span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium" [style.color]="getNdviColor(n.ndviMoyen)">{{ n.ndviMoyen | number:'1.3-3' }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ getNdviClasseLabel(getNdviClasse(n.ndviMoyen)) }} · {{ n.source }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ n.date | date:'dd/MM/yyyy' }}</p>
                <p *ngIf="n.cloudCoverage !== undefined" class="text-[10px] text-gray-400">Nuages: {{ n.cloudCoverage }}%</p>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

    </div>
  `,
})
export class ParcelleDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('ndviMapContainer') ndviMapContainer?: ElementRef;
  @ViewChild('rendementChart') rendementChartRef?: ElementRef;
  @ViewChild('ndviChart') ndviChartRef?: ElementRef;

  private mapInstance: L.Map | null = null;
  private ndviMapInstance: L.Map | null = null;
  private rendementChartInstance: Chart | null = null;
  private ndviChartInstance: Chart | null = null;
  private ndviMapReady = false;
  private mapTileLayer: L.TileLayer | null = null;
  mapViewMode: 'satellite' | 'plan' = 'satellite';

  // Data
  parcelle: Parcelle | undefined;
  visites: Visite[] = [];
  mouvementsParcelle: any[] = [];
  bilanHydrique: BilanHydrique | undefined;
  ndviLatest: NdviData | undefined;
  ndviHistory: NdviData[] = [];
  irrigations: Irrigation[] = [];
  evenementsClimatiques: EvenementClimatique[] = [];
  activeCampagne: Campagne | undefined;
  campagnesTerminees: Campagne[] = [];
  interventions: Intervention[] = [];

  // Tabs
  activeTab: TabId = 'overview';
  tabs: Tab[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'dashboard' },
    { id: 'campagne', label: 'Campagne', icon: 'flag' },
    { id: 'visites', label: 'Visites', icon: 'event' },
    { id: 'intrants', label: 'Intrants & Irrigation', icon: 'water_drop' },
    { id: 'rendement', label: 'Rendement & NDVI', icon: 'satellite_alt' },
  ];

  private parcelleId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parcelleService: ParcelleService,
    private visiteService: VisiteService,
    private intrantService: IntrantService,
    private irrigationService: IrrigationService,
    private ndviService: NdviService,
    private campagneService: CampagneService,
    private interventionService: InterventionService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private themeService: ThemeService,
    private pdfReportService: PdfReportService,
    private cdr: ChangeDetectorRef,
  ) {}

  // État génération PDF
  generatingPdf = false;

  /** Protège le pipe date contre les valeurs invalides (string non parseable, null, etc.). */
  safeDate(value: Date | string | undefined | null): Date | null {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  async downloadPdf(): Promise<void> {
    if (!this.parcelle || this.generatingPdf) return;
    this.generatingPdf = true;
    this.cdr.markForCheck();

    try {
      // Capturer la carte active (priorité onglet Vue d'ensemble)
      const mapEl = this.mapContainer?.nativeElement as HTMLElement | undefined;
      const ndviMapEl = this.ndviMapContainer?.nativeElement as HTMLElement | undefined;
      const rendChart = this.rendementChartRef?.nativeElement as HTMLCanvasElement | undefined;
      const ndviChart = this.ndviChartRef?.nativeElement as HTMLCanvasElement | undefined;

      await this.pdfReportService.generateParcelleReport({
        parcelle: this.parcelle,
        visites: this.visites,
        activeCampagne: this.activeCampagne,
        campagnesTerminees: this.campagnesTerminees,
        interventions: this.interventions,
        ndviLatest: this.ndviLatest,
        ndviHistory: this.ndviHistory,
        irrigations: this.irrigations,
        evenementsClimatiques: this.evenementsClimatiques,
        bilanHydrique: this.bilanHydrique,
        mouvementsParcelle: this.mouvementsParcelle,
        mapElement: mapEl,
        ndviMapElement: ndviMapEl,
        rendementChartCanvas: rendChart,
        ndviChartCanvas: ndviChart,
      });

      this.toastService.success('Rapport PDF généré');
    } catch (err) {
      console.error('[parcelle-detail] PDF error', err);
      this.toastService.error('Erreur lors de la génération du PDF');
    } finally {
      this.generatingPdf = false;
      this.cdr.markForCheck();
    }
  }

  ngOnInit(): void {
    this.parcelleId = this.route.snapshot.params['id'] || window.location.pathname.split('/').pop() || '';

    // Load parcelle
    this.parcelleService.getById(this.parcelleId).pipe(take(1)).subscribe(p => {
      this.parcelle = p;
      this.cdr.markForCheck();
      setTimeout(() => this.initMap(), 100);
    });

    // Load visites
    this.visiteService.getByParcelle(this.parcelleId).pipe(take(1)).subscribe(v => {
      this.visites = v;
      this.cdr.markForCheck();
    });

    // Load intrants mouvements
    this.intrantService.getAll().pipe(take(1)).subscribe(intrants => {
      this.mouvementsParcelle = intrants.flatMap(i =>
        i.mouvements
          .filter(m => m.parcelleId === this.parcelleId)
          .map(m => ({ ...m, intrantNom: i.nom, unite: i.unite }))
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.cdr.markForCheck();
    });

    // Load bilan hydrique
    this.irrigationService.getBilanHydrique(this.parcelleId).pipe(take(1)).subscribe(bh => {
      this.bilanHydrique = bh;
      this.cdr.markForCheck();
    });

    // Load irrigations
    this.irrigationService.getByParcelle(this.parcelleId).pipe(take(1)).subscribe(irr => {
      this.irrigations = irr;
      this.cdr.markForCheck();
    });

    // Load evenements climatiques
    this.irrigationService.getEvenementsByParcelle(this.parcelleId).pipe(take(1)).subscribe(ev => {
      this.evenementsClimatiques = ev;
      this.cdr.markForCheck();
    });

    // Load NDVI
    this.ndviService.getLatestByParcelle(this.parcelleId).pipe(take(1)).subscribe(n => {
      this.ndviLatest = n;
      this.cdr.markForCheck();
      if (n) setTimeout(() => this.initNdviMap(), 200);
    });
    this.ndviService.getByParcelle(this.parcelleId).pipe(take(1)).subscribe(list => {
      this.ndviHistory = list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      this.cdr.markForCheck();
    });

    // Load campagnes
    this.campagneService.getByParcelle(this.parcelleId).pipe(take(1)).subscribe(camps => {
      this.activeCampagne = camps.find(c => c.statut === 'en_cours');
      this.campagnesTerminees = camps.filter(c => c.statut === 'terminee');
      this.cdr.markForCheck();

      // Load interventions for active campagne
      if (this.activeCampagne) {
        this.interventionService.getByCampagne(this.activeCampagne.id).pipe(take(1)).subscribe(ivs => {
          this.interventions = ivs;
          this.cdr.markForCheck();
        });
      } else {
        // Fallback: load all interventions for parcelle
        this.interventionService.getByParcelle(this.parcelleId).pipe(take(1)).subscribe(ivs => {
          this.interventions = ivs;
          this.cdr.markForCheck();
        });
      }
    });
  }

  ngAfterViewInit(): void {
    // Charts are initialized lazily when tabs are switched
  }

  ngOnDestroy(): void {
    if (this.mapInstance) { this.mapInstance.remove(); this.mapInstance = null; }
    if (this.ndviMapInstance) { this.ndviMapInstance.remove(); this.ndviMapInstance = null; }
    if (this.rendementChartInstance) { this.rendementChartInstance.destroy(); this.rendementChartInstance = null; }
    if (this.ndviChartInstance) { this.ndviChartInstance.destroy(); this.ndviChartInstance = null; }
  }

  setTab(val: TabId): void {
    this.activeTab = val;
    if (val === 'overview') {
      setTimeout(() => {
        this.mapInstance?.invalidateSize();
        this.ndviMapInstance?.invalidateSize();
        if (!this.ndviMapReady) this.initNdviMap();
      }, 50);
    }
    if (val === 'rendement') {
      setTimeout(() => {
        this.initRendementChart();
        this.initNdviChart();
      }, 100);
    }
  }

  get totalCoutInterventions(): number {
    return this.interventions.reduce((s, iv) => s + (iv.coutReel || iv.coutEstime || 0), 0);
  }

  // ── Map ──

  private initMap(): void {
    if (!this.mapContainer?.nativeElement || !this.parcelle) return;
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
    const { lat, lng } = this.parcelle.coordonnees;

    this.mapInstance = L.map(this.mapContainer.nativeElement, { zoomControl: true, scrollWheelZoom: false })
      .setView([lat, lng], 13);

    this.mapTileLayer = this.createTileLayer(this.mapViewMode);
    this.mapTileLayer.addTo(this.mapInstance);

    const color = this.parcelle.statut === 'urgent' ? '#ef4444' : this.parcelle.statut === 'attention' ? '#f59e0b' : '#22c55e';
    const popupContent = `<b>${this.parcelle.nom}</b><br/>${this.parcelle.culture} · ${this.parcelle.superficie} ha`;

    L.circleMarker([lat, lng], {
      radius: 12, fillColor: color, color: 'white', weight: 2, opacity: 1, fillOpacity: 0.9
    }).addTo(this.mapInstance).bindPopup(popupContent).openPopup();

    if (this.parcelle.geometry && this.parcelle.geometry.length >= 3) {
      const latlngs = this.parcelle.geometry.map(c => [c.lat, c.lng] as L.LatLngTuple);
      const polygon = L.polygon(latlngs, { color, weight: 2, fillColor: color, fillOpacity: 0.2 })
        .addTo(this.mapInstance);
      this.mapInstance.fitBounds(polygon.getBounds(), { padding: [30, 30] });
    }
  }

  private createTileLayer(mode: 'satellite' | 'plan'): L.TileLayer {
    if (mode === 'satellite') {
      return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19, attribution: '',
      });
    }
    return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '',
    });
  }

  setMapView(mode: 'satellite' | 'plan'): void {
    if (mode === this.mapViewMode) return;
    this.mapViewMode = mode;
    if (this.mapInstance && this.mapTileLayer) {
      this.mapInstance.removeLayer(this.mapTileLayer);
      this.mapTileLayer = this.createTileLayer(mode);
      this.mapTileLayer.addTo(this.mapInstance);
    }
  }

  // ── NDVI Map ──

  private initNdviMap(): void {
    if (!this.parcelle || !this.ndviLatest) return;
    const geom = this.parcelle.geometry;
    if (!geom || geom.length < 3) return;

    // Container may not be in DOM yet — retry
    if (!this.ndviMapContainer?.nativeElement) {
      setTimeout(() => this.initNdviMap(), 100);
      return;
    }
    if (this.ndviMapReady) return;

    this.ndviMapReady = true;

    if (this.ndviMapInstance) {
      this.ndviMapInstance.remove();
      this.ndviMapInstance = null;
    }

    this.ndviMapInstance = L.map(this.ndviMapContainer.nativeElement, {
      zoomControl: true, scrollWheelZoom: false,
    });

    // ESRI Satellite tiles (reliable, no API key needed)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, attribution: '',
    }).addTo(this.ndviMapInstance);

    const latlngs = geom.map(c => L.latLng(c.lat, c.lng));
    const bounds = L.latLngBounds(latlngs);

    // Render smooth NDVI gradient via canvas overlay
    if (this.ndviLatest.zones && this.ndviLatest.zones.length > 1) {
      this.renderNdviCanvasOverlay(this.ndviMapInstance, latlngs, this.ndviLatest);
    } else {
      // Single value: smooth filled polygon with mean color
      const meanColor = getNdviColorSmooth(this.ndviLatest.ndviMoyen);
      L.polygon(latlngs as L.LatLngExpression[], {
        color: meanColor, weight: 2.5, fillColor: meanColor, fillOpacity: 0.55,
      }).addTo(this.ndviMapInstance)
        .bindPopup(`<b>NDVI moyen : ${this.ndviLatest.ndviMoyen.toFixed(2)}</b><br/>${getNdviClasseLabel(getNdviClasse(this.ndviLatest.ndviMoyen) as NdviClasse)}`);
    }

    // Parcel outline
    L.polygon(latlngs as L.LatLngExpression[], {
      color: '#ffffff', weight: 2, fillOpacity: 0, interactive: false,
    }).addTo(this.ndviMapInstance);

    this.ndviMapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    setTimeout(() => this.ndviMapInstance?.invalidateSize(), 100);
  }

  /** Render a smooth NDVI heatmap on the polygon using a canvas overlay */
  private renderNdviCanvasOverlay(map: L.Map, polygon: L.LatLng[], ndvi: NdviData): void {
    const zones = ndvi.zones;
    if (!zones || zones.length === 0) return;

    const zoneData = zones.map(z => ({ lat: z.coordonnees.lat, lng: z.coordonnees.lng, val: z.valeur }));

    const CanvasOverlay = L.Layer.extend({
      onAdd(m: L.Map) {
        (this as any)._map = m;
        const canvas = L.DomUtil.create('canvas', 'leaflet-layer') as HTMLCanvasElement;
        canvas.style.position = 'absolute';
        (this as any)._canvas = canvas;
        const pane = m.getPane('overlayPane');
        if (pane) pane.appendChild(canvas);
        m.on('moveend zoomend resize', (this as any)._reset, this);
        (this as any)._reset();
      },
      onRemove(m: L.Map) {
        const canvas = (this as any)._canvas as HTMLCanvasElement;
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        m.off('moveend zoomend resize', (this as any)._reset, this);
      },
      _reset() {
        const m = (this as any)._map as L.Map;
        const canvas = (this as any)._canvas as HTMLCanvasElement;
        if (!m || !canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = m.getSize();
        const topLeft = m.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(canvas, topLeft);
        canvas.width = size.x;
        canvas.height = size.y;

        const polyPts = ((this as any)._polygon as L.LatLng[]).map((ll: L.LatLng) => m.latLngToContainerPoint(ll));
        const zPx = ((this as any)._zoneData as { lat: number; lng: number; val: number }[]).map(z => {
          const pt = m.latLngToContainerPoint(L.latLng(z.lat, z.lng));
          return { px: pt.x, py: pt.y, val: z.val };
        });

        // Bounding box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        polyPts.forEach(pt => {
          minX = Math.min(minX, pt.x); minY = Math.min(minY, pt.y);
          maxX = Math.max(maxX, pt.x); maxY = Math.max(maxY, pt.y);
        });
        minX = Math.max(0, Math.floor(minX)); minY = Math.max(0, Math.floor(minY));
        maxX = Math.min(canvas.width - 1, Math.ceil(maxX)); maxY = Math.min(canvas.height - 1, Math.ceil(maxY));
        const bw = maxX - minX + 1;
        const bh = maxY - minY + 1;
        if (bw <= 0 || bh <= 0) return;

        // Render IDW to offscreen canvas
        const offscreen = document.createElement('canvas');
        offscreen.width = bw;
        offscreen.height = bh;
        const offCtx = offscreen.getContext('2d');
        if (!offCtx) return;

        const step = 4;
        const imgData = offCtx.createImageData(bw, bh);
        for (let y = 0; y < bh; y += step) {
          for (let x = 0; x < bw; x += step) {
            const cx = minX + x, cy = minY + y;
            let wSum = 0, vSum = 0;
            for (const z of zPx) {
              const dx = cx - z.px, dy = cy - z.py;
              const d2 = dx * dx + dy * dy;
              const w = 1 / (d2 + 1);
              wSum += w;
              vSum += w * z.val;
            }
            const val = vSum / wSum;
            const c = getNdviColorSmooth(val);
            const r = parseInt(c.slice(1, 3), 16);
            const g = parseInt(c.slice(3, 5), 16);
            const b = parseInt(c.slice(5, 7), 16);
            for (let sy = 0; sy < step && y + sy < bh; sy++) {
              for (let sx = 0; sx < step && x + sx < bw; sx++) {
                const idx = ((y + sy) * bw + (x + sx)) * 4;
                imgData.data[idx] = r;
                imgData.data[idx + 1] = g;
                imgData.data[idx + 2] = b;
                imgData.data[idx + 3] = 170;
              }
            }
          }
        }
        offCtx.putImageData(imgData, 0, 0);

        // Draw clipped onto main canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.beginPath();
        polyPts.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(offscreen, minX, minY);
        ctx.restore();
      },
    });

    const overlay = new (CanvasOverlay as any)();
    overlay._polygon = polygon;
    overlay._zoneData = zoneData;
    overlay.addTo(map);
  }

  // ── Charts ──

  private initRendementChart(): void {
    if (!this.rendementChartRef?.nativeElement || !this.parcelle) return;
    if (this.rendementChartInstance) {
      this.rendementChartInstance.destroy();
      this.rendementChartInstance = null;
    }

    const base = this.parcelle.rendementPrecedent;
    const visitesCompletees = this.visites
      .filter(v => v.statut === 'completee' && v.observations)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let data: { label: string; val: number }[];

    if (visitesCompletees.length >= 2) {
      const parMois: Record<string, { totalCouverture: number; totalHauteur: number; count: number }> = {};
      visitesCompletees.forEach(v => {
        const d = new Date(v.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!parMois[key]) parMois[key] = { totalCouverture: 0, totalHauteur: 0, count: 0 };
        parMois[key].totalCouverture += v.observations.tauxCouverture || 0;
        parMois[key].totalHauteur += v.observations.hauteurPlantes || 0;
        parMois[key].count++;
      });
      const moisNoms = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = Object.entries(parMois).map(([key, v]) => {
        const [year, month] = key.split('-');
        const avgCouverture = v.totalCouverture / v.count;
        const avgHauteur = v.totalHauteur / v.count;
        const hauteurNorm = Math.min(avgHauteur / 150, 1);
        const rendement = +(base * (avgCouverture / 100 * 0.6 + hauteurNorm * 0.4)).toFixed(1);
        return { label: `${moisNoms[parseInt(month) - 1]} ${year}`, val: rendement };
      });
    } else {
      data = [
        { label: '2022-23', val: +(base * 0.88).toFixed(1) },
        { label: '2023-24', val: +(base * 0.95).toFixed(1) },
        { label: '2024-25', val: base },
      ];
    }

    const ctx = this.rendementChartRef.nativeElement.getContext('2d');
    this.rendementChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: 'Rendement (t/ha)',
          data: data.map(d => d.val),
          borderColor: '#1A7A4A',
          backgroundColor: 'rgba(26, 122, 74, 0.1)',
          fill: true, tension: 0.3, pointRadius: 5, pointBackgroundColor: '#1A7A4A',
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

  private initNdviChart(): void {
    if (!this.ndviChartRef?.nativeElement || this.ndviHistory.length < 2) return;
    if (this.ndviChartInstance) {
      this.ndviChartInstance.destroy();
      this.ndviChartInstance = null;
    }

    const ctx = this.ndviChartRef.nativeElement.getContext('2d');
    this.ndviChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.ndviHistory.map(n => {
          const d = new Date(n.date);
          return `${d.getDate()}/${d.getMonth() + 1}`;
        }),
        datasets: [{
          label: 'NDVI Moyen',
          data: this.ndviHistory.map(n => n.ndviMoyen),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#22c55e',
        }, {
          label: 'NDVI Min',
          data: this.ndviHistory.map(n => n.ndviMin),
          borderColor: '#ef4444',
          borderDash: [4, 4],
          fill: false, tension: 0.3, pointRadius: 2, borderWidth: 1,
        }, {
          label: 'NDVI Max',
          data: this.ndviHistory.map(n => n.ndviMax),
          borderColor: '#1A7A4A',
          borderDash: [4, 4],
          fill: false, tension: 0.3, pointRadius: 2, borderWidth: 1,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        },
        scales: {
          y: { min: 0, max: 1, grid: { color: '#f3f4f6' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // ── NDVI helpers ──

  getNdviColor(val: number): string { return getNdviColor(val); }
  getNdviClasse(val: number): string { return getNdviClasse(val); }
  getNdviClasseLabel(classe: string): string { return getNdviClasseLabel(classe as NdviClasse); }

  // ── Intervention helpers ──

  getInterventionIcon(type: string): string {
    return INTERVENTION_ICONS[type as keyof typeof INTERVENTION_ICONS] || 'build';
  }

  getInterventionStatusBg(statut: string): string {
    const s = STATUT_COLORS[statut as keyof typeof STATUT_COLORS];
    return s ? s.bg : 'bg-gray-100 dark:bg-gray-700';
  }

  getInterventionStatusText(statut: string): string {
    const s = STATUT_COLORS[statut as keyof typeof STATUT_COLORS];
    return s ? s.text : 'text-gray-600 dark:text-gray-400';
  }

  // ── Actions ──

  async openNewVisite(): Promise<void> {
    if (!this.parcelle) return;
    const { VisiteFormComponent } = await import('../visites/visite-form.component');
    const ref = this.dialogService.open(VisiteFormComponent, {
      data: { parcelleId: this.parcelle.id },
    });
    const result = await ref.afterClosed();
    if (result) {
      this.visiteService.getByParcelle(this.parcelleId).pipe(take(1)).subscribe(v => {
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
      // Reinitialize maps to reflect geometry / data changes
      if (this.mapInstance) { this.mapInstance.remove(); this.mapInstance = null; }
      if (this.ndviMapInstance) { this.ndviMapInstance.remove(); this.ndviMapInstance = null; }
      this.ndviMapReady = false;
      setTimeout(() => {
        this.initMap();
        this.initNdviMap();
      }, 150);
    }
  }

  async onDelete(): Promise<void> {
    if (!this.parcelle) return;
    const confirmed = await this.dialogService.confirm({
      title: 'Supprimer la parcelle',
      message: `Etes-vous sur de vouloir supprimer la parcelle "${this.parcelle.nom}" ? Cette action est irreversible.`,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      confirmColor: 'danger',
    });
    if (confirmed) {
      this.parcelleService.delete(this.parcelle.id).pipe(take(1)).subscribe(() => {
        this.toastService.success(`Parcelle "${this.parcelle!.nom}" supprimee`);
        this.router.navigate(['/parcelles']);
      });
    }
  }

  async openNewIntervention(): Promise<void> {
    if (!this.parcelle || !this.activeCampagne) return;
    const { InterventionFormComponent } = await import('./intervention-form.component');
    const ref = this.dialogService.open(InterventionFormComponent, {
      data: { parcelleId: this.parcelleId, campagneId: this.activeCampagne.id },
    });
    const result = await ref.afterClosed();
    if (result?.action === 'create' && result.intervention) {
      this.interventionService.create({
        ...result.intervention,
        parcelleId: this.parcelleId,
        campagneId: this.activeCampagne.id,
      }).pipe(take(1)).subscribe(created => {
        this.interventions = [...this.interventions, created];
        this.toastService.success('Intervention ajoutee');
        this.cdr.markForCheck();
      });
    }
  }

  async completeIntervention(iv: Intervention): Promise<void> {
    const { InterventionFormComponent } = await import('./intervention-form.component');
    const ref = this.dialogService.open(InterventionFormComponent, {
      data: { intervention: iv, completeMode: true },
    });
    const result = await ref.afterClosed();
    if (result?.action === 'complete') {
      this.interventionService.marquerTerminee(iv.id, result.dateRealisee, result.coutReel, result.observations)
        .pipe(take(1)).subscribe(updated => {
          this.interventions = this.interventions.map(i => i.id === updated.id ? updated : i);
          this.toastService.success('Intervention terminee');
          this.cdr.markForCheck();
        });
    }
  }

  async openClotureCampagne(): Promise<void> {
    if (!this.activeCampagne) return;
    const { ClotureCampagneFormComponent } = await import('./cloture-campagne-form.component');
    const ref = this.dialogService.open(ClotureCampagneFormComponent, {
      data: { campagne: this.activeCampagne },
    });
    const result = await ref.afterClosed();
    if (result?.action === 'cloture') {
      this.campagneService.cloturerCampagne(this.activeCampagne!.id, {
        dateFin: result.dateFin,
        rendementFinal: result.rendementFinal,
        observationsCloture: result.observationsCloture,
      }).pipe(take(1)).subscribe(updated => {
        if (updated) {
          this.campagnesTerminees = [updated, ...this.campagnesTerminees];
        }
        this.activeCampagne = undefined;
        this.interventions = [];
        this.toastService.success('Campagne cloturee');
        this.cdr.markForCheck();

        if (result.programmerNouvelle) {
          setTimeout(() => this.openNouvelleCampagne(), 300);
        }
      });
    }
  }

  async openNouvelleCampagne(): Promise<void> {
    if (!this.parcelle) return;
    const { NouvelleCampagneFormComponent } = await import('./nouvelle-campagne-form.component');
    const ref = this.dialogService.open(NouvelleCampagneFormComponent, {
      data: {
        parcelleId: this.parcelleId,
        suggestedCulture: this.parcelle.rotationPrevue || this.parcelle.culture,
      },
    });
    const result = await ref.afterClosed();
    if (result?.action === 'create') {
      this.campagneService.creerCampagne({
        parcelleId: this.parcelleId,
        culture: result.culture,
        variete: result.variete,
        typeCampagne: result.typeCampagne,
        dateSemis: result.dateSemis,
        equipeId: this.parcelle!.technicienId || '',
      }).pipe(take(1)).subscribe(newCamp => {
        if (!result.planifiee) {
          this.campagneService.activerCampagne(newCamp.id).pipe(take(1)).subscribe(activated => {
            this.activeCampagne = activated;
            this.toastService.success('Campagne lancee');
            this.cdr.markForCheck();
          });
        } else {
          this.toastService.success('Campagne programmee');
          this.cdr.markForCheck();
        }
      });
    }
  }

  // ── Helpers ──

  getTechNom(id: string): string {
    const m = MOCK_MEMBRES.find(m => m.id === id);
    return m ? `${m.prenom} ${m.nom}` : id;
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
}
