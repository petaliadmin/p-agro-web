import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicMapService } from '../../core/services/public-map.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { Parcelle, Coordonnees, CultureType, StatutParcelle, ZoneAgroecologique, SourceEau } from '../../core/models/parcelle.model';
import { PointOfInterest, CarbonEmission, PoiCategory, POI_ICONS, POI_LABELS, POI_COLORS } from '../../core/models/poi.model';
import { SentinelHubService } from '../../core/services/sentinelhub.service';
import { extractGeometryFromLayer, estimateZoneFromCoords, DrawGeometryResult } from '../../core/services/leaflet-draw.util';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-draw';

@Component({
  selector: 'app-carte-publique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-screen w-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">

      <!-- ═══ HEADER 48px ═══ -->
      <header class="h-12 flex-shrink-0 flex items-center justify-between px-4
                      bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm z-50">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M17 8c0-2.76-2.24-5-5-5S7 5.24 7 8c0 1.5.66 2.85 1.7 3.79L12 15l3.3-3.21A4.97 4.97 0 0017 8z" fill="white"/>
            </svg>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-gray-900 dark:text-white text-sm">Petalia Farm OS</span>
            <span class="hidden sm:inline text-xs text-gray-400 dark:text-gray-500 border-l border-gray-200 dark:border-gray-600 pl-2">
              Carte publique des parcelles
            </span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button (click)="toggleDarkMode()" type="button" aria-label="Basculer le mode sombre"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span class="material-icons text-[18px]">{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</span>
          </button>
          <button (click)="togglePanel()" type="button" aria-label="Ouvrir/fermer le panneau"
            class="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span class="material-icons text-[18px]">{{ panelOpen() ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </header>

      <!-- ═══ MAIN AREA ═══ -->
      <div class="flex-1 flex relative overflow-hidden">

        <!-- Mobile backdrop -->
        <div *ngIf="panelOpen() && isMobile" (click)="togglePanel()"
          class="fixed inset-0 bg-black/40 z-30 md:hidden" aria-hidden="true"></div>

        <!-- ─── SIDE PANEL ─── -->
        <aside class="flex-shrink-0 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 z-40 transition-all duration-300 overflow-hidden"
          [ngClass]="{
            'w-[380px]': panelOpen() && !isMobile,
            'w-0': !panelOpen() && !isMobile,
            'fixed inset-y-12 left-0 w-[85vw] max-w-[380px] shadow-2xl': isMobile,
            '-translate-x-full': isMobile && !panelOpen(),
            'translate-x-0': isMobile && panelOpen()
          }"
          role="navigation" aria-label="Panneau de filtres et détails">

          <!-- Panel tabs -->
          <div class="flex border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
            <button (click)="panelTab.set('filters')" type="button"
              class="flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
              [ngClass]="panelTab() === 'filters'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'">
              <span class="flex items-center justify-center gap-1.5">
                <span class="material-icons text-[14px]">filter_list</span> Filtres
              </span>
            </button>
            <button (click)="panelTab.set('details')" type="button"
              [disabled]="!selectedParcelle()"
              class="flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-30"
              [ngClass]="panelTab() === 'details'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'">
              <span class="flex items-center justify-center gap-1.5">
                <span class="material-icons text-[14px]">info</span> Détails
              </span>
            </button>
            <button *ngIf="drawnGeometry()" (click)="panelTab.set('drawn')" type="button"
              class="flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
              [ngClass]="panelTab() === 'drawn'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'">
              <span class="flex items-center justify-center gap-1.5">
                <span class="material-icons text-[14px]">draw</span> Nouvelle
              </span>
            </button>
          </div>

          <!-- ═══ FILTERS TAB ═══ -->
          <div *ngIf="panelTab() === 'filters'" class="flex-1 overflow-y-auto p-4 space-y-4">

            <!-- Search -->
            <div class="relative">
              <span class="material-icons text-[16px] text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">search</span>
              <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" placeholder="Rechercher une parcelle..."
                class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
            </div>

            <!-- Filter selects -->
            <div class="space-y-3">
              <div>
                <label class="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Culture</label>
                <select [(ngModel)]="filterCulture" (ngModelChange)="applyFilters()"
                  class="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Toutes les cultures</option>
                  <option *ngFor="let c of cultureOptions" [value]="c.value">{{ c.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Zone agroécologique</label>
                <select [(ngModel)]="filterZone" (ngModelChange)="applyFilters()"
                  class="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Toutes les zones</option>
                  <option *ngFor="let z of zoneOptions" [value]="z">{{ z }}</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Statut</label>
                <select [(ngModel)]="filterStatut" (ngModelChange)="applyFilters()"
                  class="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Tous les statuts</option>
                  <option *ngFor="let s of statutOptions" [value]="s.value">{{ s.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Source d'eau</label>
                <select [(ngModel)]="filterSourceEau" (ngModelChange)="applyFilters()"
                  class="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Toutes</option>
                  <option *ngFor="let se of sourceEauOptions" [value]="se.value">{{ se.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Émission carbone</label>
                <select [(ngModel)]="filterCarbon" (ngModelChange)="applyFilters()"
                  class="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Toutes</option>
                  <option value="faible">Faible (&lt; 20 kg/ha)</option>
                  <option value="moyen">Moyen (20-40 kg/ha)</option>
                  <option value="eleve">Élevé (&gt; 40 kg/ha)</option>
                </select>
              </div>
            </div>

            <!-- Active filters / Reset -->
            <div *ngIf="hasActiveFilters()" class="flex items-center justify-between">
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ filtered.length }}/{{ parcelles.length }} parcelles</span>
              <button (click)="resetFilters()" type="button"
                class="text-xs text-red-500 hover:text-red-600 dark:text-red-400 flex items-center gap-1">
                <span class="material-icons text-[12px]">close</span> Réinitialiser
              </button>
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-100 dark:border-gray-700"></div>

            <!-- Parcelle list -->
            <div class="space-y-2">
              <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Parcelles ({{ filtered.length }})
              </p>
              <div *ngIf="loading" class="flex items-center justify-center py-8">
                <div class="w-6 h-6 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
              <button *ngFor="let p of filtered; trackBy: trackById" (click)="selectParcelle(p)" type="button"
                class="w-full text-left p-3 rounded-xl border transition-all duration-200 hover:shadow-md"
                [ngClass]="selectedParcelle()?.id === p.id
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-300 dark:ring-primary-600'
                  : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600'">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{{ p.nom }}</span>
                  <span class="flex-shrink-0 w-2.5 h-2.5 rounded-full" [style.background]="getStatutColor(p.statut)"></span>
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{{ getCultureEmoji(p.culture) }} {{ p.culture }}</span>
                  <span class="text-gray-300 dark:text-gray-600">·</span>
                  <span>{{ p.superficie }} ha</span>
                  <span *ngIf="p.localite" class="text-gray-300 dark:text-gray-600">·</span>
                  <span *ngIf="p.localite" class="truncate">{{ p.localite }}</span>
                </div>
              </button>

              <div *ngIf="!loading && filtered.length === 0" class="text-center py-8">
                <span class="material-icons text-[32px] text-gray-300 dark:text-gray-600">search_off</span>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Aucune parcelle trouvée</p>
              </div>
            </div>
          </div>

          <!-- ═══ DETAILS TAB ═══ -->
          <div *ngIf="panelTab() === 'details' && selectedParcelle()" class="flex-1 overflow-y-auto">

            <!-- Back button -->
            <button (click)="clearSelection()" type="button"
              class="flex items-center gap-1.5 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors w-full border-b border-gray-100 dark:border-gray-700">
              <span class="material-icons text-[16px]">arrow_back</span> Retour aux filtres
            </button>

            <!-- Parcelle info card -->
            <div class="p-4 space-y-4">
              <div>
                <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ selectedParcelle()!.nom }}</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ selectedParcelle()!.code }} · {{ selectedParcelle()!.localite || 'Non renseigné' }}</p>
              </div>

              <!-- Info grid -->
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                  <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Culture</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{{ getCultureEmoji(selectedParcelle()!.culture) }} {{ selectedParcelle()!.culture }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                  <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Superficie</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{{ selectedParcelle()!.superficie }} ha</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                  <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Type de sol</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{{ selectedParcelle()!.typeSol || 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                  <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Source d'eau</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{{ selectedParcelle()!.sourceEau || 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                  <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Zone</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{{ selectedParcelle()!.zoneAgroecologique || selectedParcelle()!.zone }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                  <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Stade</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{{ selectedParcelle()!.stade }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                  <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Statut</p>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="w-2 h-2 rounded-full" [style.background]="getStatutColor(selectedParcelle()!.statut)"></span>
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ selectedParcelle()!.statut }}</span>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                  <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Accès terre</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{{ selectedParcelle()!.modeAccesTerre || 'N/A' }}</p>
                </div>
              </div>

              <!-- Carbon emission -->
              <div *ngIf="selectedCarbon()" class="rounded-xl p-3 border"
                [ngClass]="{
                  'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800': selectedCarbon()!.categorie === 'faible',
                  'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800': selectedCarbon()!.categorie === 'moyen',
                  'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800': selectedCarbon()!.categorie === 'eleve'
                }">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-[16px]"
                    [ngClass]="{
                      'text-green-600 dark:text-green-400': selectedCarbon()!.categorie === 'faible',
                      'text-yellow-600 dark:text-yellow-400': selectedCarbon()!.categorie === 'moyen',
                      'text-red-600 dark:text-red-400': selectedCarbon()!.categorie === 'eleve'
                    }">eco</span>
                  <div>
                    <p class="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Émission carbone : {{ selectedCarbon()!.emissionKgCO2 }} kg CO2
                    </p>
                    <p class="text-[10px] text-gray-500 dark:text-gray-400">
                      {{ selectedCarbon()!.emissionParHa }} kg/ha ·
                      <span class="font-semibold"
                        [ngClass]="{
                          'text-green-600 dark:text-green-400': selectedCarbon()!.categorie === 'faible',
                          'text-yellow-600 dark:text-yellow-400': selectedCarbon()!.categorie === 'moyen',
                          'text-red-600 dark:text-red-400': selectedCarbon()!.categorie === 'eleve'
                        }">
                        {{ selectedCarbon()!.categorie === 'faible' ? 'Faible' : selectedCarbon()!.categorie === 'moyen' ? 'Moyen' : 'Élevé' }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <!-- Satellite imagery info -->
              <div *ngIf="satelliteInfo()" class="rounded-xl p-3 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <div class="flex items-center gap-2 mb-2">
                  <span class="material-icons text-[16px] text-blue-600 dark:text-blue-400">satellite_alt</span>
                  <p class="text-xs font-semibold text-blue-700 dark:text-blue-300">Imagerie satellite</p>
                </div>
                <div class="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Derniere image</p>
                    <p class="font-semibold text-gray-800 dark:text-gray-100">{{ satelliteInfo()!.lastDate | date:'dd/MM/yyyy' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Source</p>
                    <p class="font-semibold text-gray-800 dark:text-gray-100">{{ satelliteInfo()!.source }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Prochaine estimee</p>
                    <p class="font-semibold text-gray-800 dark:text-gray-100">{{ satelliteInfo()!.nextEstimate | date:'dd/MM/yyyy' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Couverture nuageuse</p>
                    <p class="font-semibold text-gray-800 dark:text-gray-100">{{ satelliteInfo()!.cloudCoverage }}%</p>
                  </div>
                </div>
              </div>
              <div *ngIf="loadingSatellite" class="rounded-xl p-3 border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <div class="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span class="text-xs text-gray-500 dark:text-gray-400">Chargement imagerie satellite...</span>
              </div>
            </div>

            <!-- POI section -->
            <div class="px-4 pb-4">
              <h3 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span class="material-icons text-[14px]">place</span> Points d'intérêt à proximité
              </h3>
              <div *ngIf="loadingPois" class="flex items-center justify-center py-6">
                <div class="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
              <div class="space-y-2">
                <button *ngFor="let poi of selectedPois()" (click)="showPoiOnMap(poi)" type="button"
                  class="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200">
                  <div class="flex items-start gap-3">
                    <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      [style.background]="getPoiColor(poi.categorie)">
                      <span class="material-icons text-white text-[16px]">{{ getPoiIcon(poi.categorie) }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">{{ getPoiLabel(poi.categorie) }}</p>
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ poi.nom }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <span class="material-icons text-[11px] align-text-bottom">near_me</span> {{ poi.distance }} km
                      </p>
                      <div class="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                        <span *ngIf="poi.telephone" class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <span class="material-icons text-[11px]">phone</span> {{ poi.telephone }}
                        </span>
                        <span *ngIf="poi.email" class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <span class="material-icons text-[11px]">email</span> {{ poi.email }}
                        </span>
                        <a *ngIf="poi.siteWeb" [href]="poi.siteWeb" target="_blank" rel="noopener"
                          class="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline"
                          (click)="$event.stopPropagation()">
                          <span class="material-icons text-[11px]">language</span> Site web
                        </a>
                      </div>
                      <p *ngIf="poi.horaires" class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                        <span class="material-icons text-[10px] align-text-bottom">schedule</span> {{ poi.horaires }}
                      </p>
                      <p *ngIf="poi.description" class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 italic">{{ poi.description }}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- ═══ DRAWN TAB ═══ -->
          <div *ngIf="panelTab() === 'drawn' && drawnGeometry()" class="flex-1 overflow-y-auto">
            <button (click)="clearDrawing()" type="button"
              class="flex items-center gap-1.5 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors w-full border-b border-gray-100 dark:border-gray-700">
              <span class="material-icons text-[16px]">arrow_back</span> Retour aux filtres
            </button>

            <div class="p-4 space-y-4">
              <div>
                <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Nouvelle surface</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Surface dessinee sur la carte</p>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5">
                  <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Superficie</p>
                  <p class="text-sm font-bold text-green-700 dark:text-green-400 mt-0.5">{{ drawnSuperficie() }} ha</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                  <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Centre</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{{ drawnCentroid()?.lat }}, {{ drawnCentroid()?.lng }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                  <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Sommets</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{{ drawnGeometry()?.length }} points</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5">
                  <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Zone estimee</p>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{{ drawnEstimatedZone() || 'Inconnue' }}</p>
                </div>
              </div>

              <div class="border-t border-gray-100 dark:border-gray-700"></div>

              <button (click)="convertirEnParcelle()" type="button"
                class="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors
                       bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
                <span class="material-icons text-[16px]">add_circle</span>
                Convertir en parcelle
              </button>

              <p class="text-[10px] text-gray-400 dark:text-gray-500 text-center">
                {{ authService.isAuthenticated() ? 'Vous serez redirige vers le formulaire de creation' : 'Connexion requise pour creer une parcelle' }}
              </p>

              <button (click)="clearDrawing()" type="button"
                class="w-full py-2 rounded-lg text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1.5">
                <span class="material-icons text-[14px]">delete_outline</span>
                Effacer le trace
              </button>
            </div>
          </div>
        </aside>

        <!-- ─── MAP CONTAINER ─── -->
        <div class="flex-1 relative">
          <div #mapContainer class="absolute inset-0 z-0"></div>

          <!-- Legend overlay -->
          <div class="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-100 dark:border-gray-700 text-xs space-y-1.5">
            <p class="font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Légende</p>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-[#22c55e]"></div>
              <span class="text-gray-600 dark:text-gray-300">Sain</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
              <span class="text-gray-600 dark:text-gray-300">Attention</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-[#ef4444]"></div>
              <span class="text-gray-600 dark:text-gray-300">Urgent</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-[#a855f7]"></div>
              <span class="text-gray-600 dark:text-gray-300">Récolte</span>
            </div>
          </div>

          <!-- Panel toggle (desktop) -->
          <button *ngIf="!isMobile" (click)="togglePanel()" type="button" aria-label="Afficher/masquer le panneau"
            class="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors">
            <span class="material-icons text-[18px]">{{ panelOpen() ? 'chevron_left' : 'chevron_right' }}</span>
          </button>

          <!-- Draw mode toggle -->
          <button (click)="toggleDrawingMode()" type="button"
            class="absolute top-4 z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border text-sm font-medium transition-colors"
            [ngStyle]="{'right': panelOpen() && !isMobile ? '10rem' : '10rem'}"
            [ngClass]="isDrawingMode()
              ? 'border-primary-400 text-primary-600 dark:text-primary-400 bg-primary-50/90 dark:bg-primary-900/30'
              : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'">
            <span class="material-icons text-[16px]">{{ isDrawingMode() ? 'close' : 'edit' }}</span>
            <span class="hidden sm:inline">{{ isDrawingMode() ? 'Quitter le dessin' : 'Dessiner une parcelle' }}</span>
          </button>

          <!-- Stats overlay (top-right) -->
          <div class="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-gray-100 dark:border-gray-700 text-xs flex items-center gap-3">
            <div class="text-center">
              <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ filtered.length }}</p>
              <p class="text-gray-400 dark:text-gray-500">parcelles</p>
            </div>
            <div class="w-px h-6 bg-gray-200 dark:bg-gray-600"></div>
            <div class="text-center">
              <p class="font-bold text-gray-900 dark:text-gray-100 text-sm">{{ totalHectares }}</p>
              <p class="text-gray-400 dark:text-gray-500">hectares</p>
            </div>
          </div>

          <!-- Map layer switcher (bottom-right) -->
          <div class="absolute bottom-4 right-4 z-10">
            <div class="relative">
              <button (click)="layerMenuOpen = !layerMenuOpen" type="button"
                class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                <span class="material-icons text-[14px]">layers</span>
                {{ getActiveLayerLabel() }}
                <span class="material-icons text-[14px]">{{ layerMenuOpen ? 'expand_less' : 'expand_more' }}</span>
              </button>
              <div *ngIf="layerMenuOpen"
                class="absolute bottom-full right-0 mb-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <button *ngFor="let layer of mapLayers" (click)="setMapLayer(layer.id)" type="button"
                  class="w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 transition-colors"
                  [ngClass]="activeLayerId === layer.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'">
                  <span class="material-icons text-[14px]">{{ layer.icon }}</span>
                  {{ layer.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CartePubliqueComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapRef!: ElementRef;

  // Services
  constructor(
    private publicMapService: PublicMapService,
    private sentinelHub: SentinelHubService,
    public themeService: ThemeService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  // Data
  parcelles: Parcelle[] = [];
  filtered: Parcelle[] = [];
  carbonEmissions: CarbonEmission[] = [];
  loading = true;
  loadingPois = false;

  // Selection
  selectedParcelle = signal<Parcelle | null>(null);
  selectedPois = signal<PointOfInterest[]>([]);
  selectedCarbon = signal<CarbonEmission | null>(null);

  // Satellite imagery
  satelliteInfo = signal<{ lastDate: Date; nextEstimate: Date; source: string; cloudCoverage: number } | null>(null);
  loadingSatellite = false;

  // UI
  panelOpen = signal(true);
  panelTab = signal<'filters' | 'details' | 'drawn'>('filters');
  isMobile = false;

  // Drawing
  drawnGeometry = signal<Coordonnees[] | null>(null);
  drawnSuperficie = signal<number>(0);
  drawnCentroid = signal<Coordonnees | null>(null);
  drawnEstimatedZone = signal<string | null>(null);
  isDrawingMode = signal(false);
  private drawnItems: L.FeatureGroup | null = null;
  private currentDrawnLayer: L.Layer | null = null;
  private drawControl: any = null;

  // Filters
  searchQuery = '';
  filterCulture: CultureType | '' = '';
  filterZone: ZoneAgroecologique | '' = '';
  filterStatut: StatutParcelle | '' = '';
  filterSourceEau: SourceEau | '' = '';
  filterCarbon: 'faible' | 'moyen' | 'eleve' | '' = '';

  // Filter options
  cultureOptions = [
    { value: 'riz', label: 'Riz' },
    { value: 'mais', label: 'Maïs' },
    { value: 'mil', label: 'Mil' },
    { value: 'arachide', label: 'Arachide' },
    { value: 'oignon', label: 'Oignon' },
    { value: 'tomate', label: 'Tomate' },
  ];
  zoneOptions: ZoneAgroecologique[] = [
    'Niayes', 'Casamance', 'Vallée du Fleuve Sénégal', 'Bassin Arachidier', 'Sénégal Oriental', 'Zone Sylvopastorale',
  ];
  statutOptions = [
    { value: 'sain', label: 'Sain' },
    { value: 'attention', label: 'Attention' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'recolte', label: 'Récolte' },
  ];
  sourceEauOptions = [
    { value: 'pluie', label: 'Pluie' },
    { value: 'forage', label: 'Forage' },
    { value: 'canal', label: 'Canal' },
    { value: 'fleuve', label: 'Fleuve' },
    { value: 'bassin', label: 'Bassin' },
    { value: 'puits', label: 'Puits' },
  ];

  // Map layers
  mapLayers = [
    { id: 'osm', label: 'Plan (OpenStreetMap)', icon: 'map', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', maxNativeZoom: 19, subdomains: 'abc' },
    { id: 'satellite', label: 'Satellite', icon: 'satellite', url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', maxNativeZoom: 21, subdomains: '0123' },
    { id: 'topo', label: 'Topographique', icon: 'terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', maxNativeZoom: 17, subdomains: 'abc' },
    { id: 'carto-light', label: 'Clair (Carto)', icon: 'light_mode', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', maxNativeZoom: 20, subdomains: 'abcd' },
    { id: 'carto-dark', label: 'Sombre (Carto)', icon: 'dark_mode', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', maxNativeZoom: 20, subdomains: 'abcd' },
    { id: 'hybrid', label: 'Hybride', icon: 'public', url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', maxNativeZoom: 21, subdomains: '0123' },
  ];
  activeLayerId = 'osm';
  layerMenuOpen = false;

  // Map
  private mapInstance: L.Map | null = null;
  private tileLayer: L.TileLayer | null = null;
  private labelsLayer: L.TileLayer | null = null;
  private polygonLayers = new Map<string, L.Polygon>();
  private markerLayers = new Map<string, L.CircleMarker>();
  private poiLayerGroup: L.LayerGroup | null = null;
  private markersCluster: any = null;

  get totalHectares(): number {
    return Math.round(this.filtered.reduce((s, p) => s + p.superficie, 0) * 10) / 10;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) this.panelOpen.set(false);

    forkJoin({
      parcelles: this.publicMapService.getPublicParcelles().pipe(take(1)),
      carbon: this.publicMapService.getCarbonEmissions().pipe(take(1)),
    }).subscribe(({ parcelles, carbon }) => {
      this.parcelles = parcelles;
      this.carbonEmissions = carbon;
      this.filtered = [...parcelles];
      this.loading = false;
      this.cdr.markForCheck();

      if (this.mapInstance) this.addParcellesToMap();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 200);
  }

  ngOnDestroy(): void {
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
  }

  // ── Map ──

  private initMap(): void {
    if (!this.mapRef?.nativeElement) return;

    this.mapInstance = L.map(this.mapRef.nativeElement, {
      center: [14.5, -15.0],
      zoom: 7,
      maxZoom: 25,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    this.updateTileLayer();
    this.poiLayerGroup = L.layerGroup().addTo(this.mapInstance);
    this.markersCluster = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: '<div style="background:#1A7A4A;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.3);">' + count + '</div>',
          className: '',
          iconSize: L.point(32, 32),
        });
      },
    });
    this.mapInstance.addLayer(this.markersCluster);

    // Drawing layer (always present, controls toggled)
    this.drawnItems = new L.FeatureGroup();
    this.mapInstance.addLayer(this.drawnItems);

    this.drawControl = new (L.Control as any).Draw({
      position: 'topleft',
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: { color: '#1A7A4A', weight: 2, fillOpacity: 0.2, dashArray: '6' },
        },
        rectangle: {
          shapeOptions: { color: '#1A7A4A', weight: 2, fillOpacity: 0.2, dashArray: '6' },
        },
        polyline: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: { featureGroup: this.drawnItems, remove: true },
    });

    // Draw events
    this.mapInstance.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      if (this.currentDrawnLayer && this.drawnItems) {
        this.drawnItems.removeLayer(this.currentDrawnLayer);
      }
      this.drawnItems!.addLayer(layer);
      this.currentDrawnLayer = layer;
      this.applyDrawnGeometry(layer);
    });

    this.mapInstance.on(L.Draw.Event.EDITED, () => {
      if (this.currentDrawnLayer) {
        this.applyDrawnGeometry(this.currentDrawnLayer);
      }
    });

    this.mapInstance.on(L.Draw.Event.DELETED, () => {
      this.currentDrawnLayer = null;
      this.drawnGeometry.set(null);
      this.drawnSuperficie.set(0);
      this.drawnCentroid.set(null);
      this.drawnEstimatedZone.set(null);
      this.panelTab.set('filters');
      this.cdr.markForCheck();
    });

    if (this.parcelles.length > 0) {
      this.addParcellesToMap();
    }
  }

  private updateTileLayer(): void {
    if (!this.mapInstance) return;
    if (this.tileLayer) this.mapInstance.removeLayer(this.tileLayer);
    if (this.labelsLayer) { this.mapInstance.removeLayer(this.labelsLayer); this.labelsLayer = null; }

    const layer = this.mapLayers.find(l => l.id === this.activeLayerId) || this.mapLayers[0];
    this.tileLayer = L.tileLayer(layer.url, {
      maxZoom: 25,
      maxNativeZoom: layer.maxNativeZoom,
      subdomains: layer.subdomains,
      attribution: '',
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    }).addTo(this.mapInstance);

    // Add labels overlay on satellite/hybrid
    if (this.activeLayerId === 'hybrid') {
      this.labelsLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 25, maxNativeZoom: 20, attribution: '', pane: 'overlayPane',
        errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      }).addTo(this.mapInstance);
    }
  }

  private addParcellesToMap(): void {
    if (!this.mapInstance || !this.markersCluster) return;

    this.polygonLayers.clear();
    this.markerLayers.clear();
    this.markersCluster.clearLayers();

    const bounds: L.LatLng[] = [];

    this.parcelles.forEach(p => {
      const color = this.getStatutColor(p.statut);

      // Polygon
      if (p.geometry && p.geometry.length >= 3) {
        const latlngs = p.geometry.map(c => L.latLng(c.lat, c.lng));
        const polygon = L.polygon(latlngs, {
          color, weight: 2, fillOpacity: 0.15, fillColor: color,
        }).addTo(this.mapInstance!);
        polygon.on('click', () => this.selectParcelle(p));
        polygon.bindTooltip(p.nom + ' — ' + p.superficie + ' ha', { sticky: true, className: 'public-map-tooltip' });
        this.polygonLayers.set(p.id, polygon);
        latlngs.forEach(ll => bounds.push(ll));
      }

      // Circle marker (for cluster)
      const marker = L.circleMarker([p.coordonnees.lat, p.coordonnees.lng], {
        radius: 7, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9,
      });
      marker.on('click', () => this.selectParcelle(p));
      marker.bindTooltip(p.nom, { direction: 'top', offset: L.point(0, -8) });
      this.markersCluster.addLayer(marker);
      this.markerLayers.set(p.id, marker);
      bounds.push(L.latLng(p.coordonnees.lat, p.coordonnees.lng));
    });

    if (bounds.length > 0) {
      this.mapInstance!.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
    }
  }

  // ── Selection ──

  selectParcelle(p: Parcelle): void {
    this.selectedParcelle.set(p);
    this.panelTab.set('details');
    if (this.isMobile) this.panelOpen.set(true);

    // Highlight polygon + fly
    this.polygonLayers.forEach((poly, id) => {
      if (id === p.id) {
        poly.setStyle({ weight: 3, fillOpacity: 0.35 });
      } else {
        poly.setStyle({ weight: 2, fillOpacity: 0.15 });
      }
    });

    const polygon = this.polygonLayers.get(p.id);
    if (polygon && this.mapInstance) {
      this.mapInstance.flyToBounds(polygon.getBounds(), {
        duration: 0.8,
        padding: [80, 80],
        maxZoom: 15,
      });
    } else if (this.mapInstance) {
      this.mapInstance.flyTo([p.coordonnees.lat, p.coordonnees.lng], 14, { duration: 0.8 });
    }

    // Load POIs
    this.loadingPois = true;
    this.selectedPois.set([]);
    this.cdr.markForCheck();

    this.publicMapService.getPoisByParcelle(p.id).subscribe(pois => {
      this.selectedPois.set(pois);
      this.loadingPois = false;
      this.showPoisOnMap(pois);
      this.cdr.markForCheck();
    });

    // Load carbon
    const carbon = this.carbonEmissions.find(c => c.parcelleId === p.id);
    this.selectedCarbon.set(carbon || null);

    // Load satellite imagery info
    this.satelliteInfo.set(null);
    this.loadSatelliteInfo(p);

    this.cdr.markForCheck();
  }

  clearSelection(): void {
    this.selectedParcelle.set(null);
    this.selectedPois.set([]);
    this.selectedCarbon.set(null);
    this.satelliteInfo.set(null);
    this.panelTab.set('filters');

    // Reset polygon styles
    this.polygonLayers.forEach(poly => {
      poly.setStyle({ weight: 2, fillOpacity: 0.15 });
    });

    // Clear POI markers
    this.poiLayerGroup?.clearLayers();

    // Fit all
    if (this.mapInstance && this.filtered.length > 0) {
      const bounds: L.LatLng[] = [];
      this.filtered.forEach(p => bounds.push(L.latLng(p.coordonnees.lat, p.coordonnees.lng)));
      this.mapInstance.flyToBounds(L.latLngBounds(bounds), { padding: [50, 50], duration: 0.6 });
    }
    this.cdr.markForCheck();
  }

  // ── Satellite imagery ──

  private loadSatelliteInfo(p: Parcelle): void {
    if (!p.geometry || p.geometry.length < 3 || !this.sentinelHub.isConfigured) {
      this.loadingSatellite = false;
      return;
    }

    this.loadingSatellite = true;
    this.cdr.markForCheck();

    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

    this.sentinelHub.searchImages(p.geometry, sixMonthsAgo, now).pipe(take(1)).subscribe({
      next: (features) => {
        this.loadingSatellite = false;
        if (features.length > 0) {
          const latest = features[0];
          const lastDate = new Date(latest.properties.datetime);
          // Sentinel-2 revisit : ~5 jours
          const nextEstimate = new Date(lastDate.getTime() + 5 * 86400000);
          this.satelliteInfo.set({
            lastDate,
            nextEstimate,
            source: 'Sentinel-2',
            cloudCoverage: Math.round(latest.properties['eo:cloud_cover'] ?? 0),
          });
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingSatellite = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ── POI markers ──

  private showPoisOnMap(pois: PointOfInterest[]): void {
    this.poiLayerGroup?.clearLayers();
    if (!this.mapInstance) return;

    pois.forEach(poi => {
      const color = POI_COLORS[poi.categorie];
      const icon = L.divIcon({
        html: `<div style="background:${color};color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;">
          <span class="material-icons" style="font-size:14px;">${POI_ICONS[poi.categorie]}</span>
        </div>`,
        className: '',
        iconSize: L.point(28, 28),
        iconAnchor: L.point(14, 14),
      });

      const marker = L.marker([poi.coordonnees.lat, poi.coordonnees.lng], { icon });
      marker.bindPopup(`
        <div style="min-width:180px;font-family:'Plus Jakarta Sans',sans-serif;">
          <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;font-weight:600;margin:0;">${POI_LABELS[poi.categorie]}</p>
          <p style="font-size:13px;font-weight:600;margin:4px 0 2px;">${poi.nom}</p>
          <p style="font-size:11px;color:#6b7280;margin:0;">${poi.distance} km</p>
          ${poi.telephone ? `<p style="font-size:11px;color:#6b7280;margin:2px 0 0;">${poi.telephone}</p>` : ''}
          ${poi.email ? `<p style="font-size:11px;color:#6b7280;margin:2px 0 0;">${poi.email}</p>` : ''}
          ${poi.horaires ? `<p style="font-size:10px;color:#9ca3af;margin:4px 0 0;">${poi.horaires}</p>` : ''}
        </div>
      `);
      this.poiLayerGroup?.addLayer(marker);
    });
  }

  showPoiOnMap(poi: PointOfInterest): void {
    if (!this.mapInstance) return;
    this.mapInstance.flyTo([poi.coordonnees.lat, poi.coordonnees.lng], 15, { duration: 0.5 });

    // Open popup for this POI
    this.poiLayerGroup?.eachLayer((layer: any) => {
      if (layer.getLatLng) {
        const ll = layer.getLatLng();
        if (Math.abs(ll.lat - poi.coordonnees.lat) < 0.0001 && Math.abs(ll.lng - poi.coordonnees.lng) < 0.0001) {
          layer.openPopup();
        }
      }
    });
  }

  // ── Filters ──

  applyFilters(): void {
    this.filtered = this.parcelles.filter(p => {
      if (this.searchQuery && !p.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) && !(p.localite || '').toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
      if (this.filterCulture && p.culture !== this.filterCulture) return false;
      if (this.filterZone && p.zoneAgroecologique !== this.filterZone) return false;
      if (this.filterStatut && p.statut !== this.filterStatut) return false;
      if (this.filterSourceEau && p.sourceEau !== this.filterSourceEau) return false;
      if (this.filterCarbon) {
        const ce = this.carbonEmissions.find(c => c.parcelleId === p.id);
        if (!ce || ce.categorie !== this.filterCarbon) return false;
      }
      return true;
    });

    // Update map visibility
    const filteredIds = new Set(this.filtered.map(p => p.id));

    this.polygonLayers.forEach((poly, id) => {
      if (filteredIds.has(id)) {
        if (!this.mapInstance!.hasLayer(poly)) poly.addTo(this.mapInstance!);
      } else {
        if (this.mapInstance!.hasLayer(poly)) this.mapInstance!.removeLayer(poly);
      }
    });

    // Rebuild cluster with filtered markers only
    if (this.markersCluster) {
      this.markersCluster.clearLayers();
      this.filtered.forEach(p => {
        const marker = this.markerLayers.get(p.id);
        if (marker) this.markersCluster.addLayer(marker);
      });
    }

    // Clear selection if selected parcelle is no longer in filtered
    const sel = this.selectedParcelle();
    if (sel && !filteredIds.has(sel.id)) {
      this.clearSelection();
    }

    // Fit bounds to filtered
    if (this.mapInstance && this.filtered.length > 0 && !this.selectedParcelle()) {
      const bounds: L.LatLng[] = [];
      this.filtered.forEach(p => bounds.push(L.latLng(p.coordonnees.lat, p.coordonnees.lng)));
      this.mapInstance.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
    }

    this.cdr.markForCheck();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.filterCulture || this.filterZone || this.filterStatut || this.filterSourceEau || this.filterCarbon);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.filterCulture = '';
    this.filterZone = '';
    this.filterStatut = '';
    this.filterSourceEau = '';
    this.filterCarbon = '';
    this.applyFilters();
  }

  // ── UI ──

  togglePanel(): void {
    this.panelOpen.set(!this.panelOpen());
    setTimeout(() => this.mapInstance?.invalidateSize(), 350);
  }

  toggleDarkMode(): void {
    const goingDark = !this.themeService.isDark();
    this.themeService.setMode(goingDark ? 'dark' : 'light');
    // Auto-switch to matching carto layer if currently on a carto or osm base
    if (['osm', 'carto-light', 'carto-dark'].includes(this.activeLayerId)) {
      this.activeLayerId = goingDark ? 'carto-dark' : 'osm';
    }
    setTimeout(() => this.updateTileLayer(), 50);
  }

  setMapLayer(id: string): void {
    this.activeLayerId = id;
    this.layerMenuOpen = false;
    this.updateTileLayer();
    this.cdr.markForCheck();
  }

  getActiveLayerLabel(): string {
    return this.mapLayers.find(l => l.id === this.activeLayerId)?.label || 'Carte';
  }

  // ── Helpers ──

  trackById(_: number, item: Parcelle): string { return item.id; }

  getStatutColor(statut: StatutParcelle): string {
    const map: Record<StatutParcelle, string> = {
      sain: '#22c55e', attention: '#f59e0b', urgent: '#ef4444', recolte: '#a855f7',
    };
    return map[statut] || '#9ca3af';
  }

  getCultureEmoji(culture: CultureType): string {
    const map: Record<string, string> = {
      riz: '🌾', mais: '🌽', mil: '🌿', arachide: '🥜', oignon: '🧅', tomate: '🍅',
    };
    return map[culture] || '🌱';
  }

  getPoiIcon(cat: PoiCategory): string { return POI_ICONS[cat]; }
  getPoiLabel(cat: PoiCategory): string { return POI_LABELS[cat]; }
  getPoiColor(cat: PoiCategory): string { return POI_COLORS[cat]; }

  // ── Drawing ──

  toggleDrawingMode(): void {
    const entering = !this.isDrawingMode();
    this.isDrawingMode.set(entering);

    if (!this.mapInstance || !this.drawControl) return;

    if (entering) {
      this.clearSelection();
      this.mapInstance.addControl(this.drawControl);
    } else {
      this.mapInstance.removeControl(this.drawControl);
      this.clearDrawing();
    }
    this.cdr.markForCheck();
  }

  private applyDrawnGeometry(layer: any): void {
    const result = extractGeometryFromLayer(layer);
    if (!result) return;

    this.drawnGeometry.set(result.geometry);
    this.drawnSuperficie.set(result.area);
    this.drawnCentroid.set(result.centroid);
    this.drawnEstimatedZone.set(estimateZoneFromCoords(result.centroid));

    this.panelTab.set('drawn');
    if (!this.panelOpen()) this.panelOpen.set(true);
    this.cdr.markForCheck();
  }

  clearDrawing(): void {
    if (this.drawnItems) this.drawnItems.clearLayers();
    this.currentDrawnLayer = null;
    this.drawnGeometry.set(null);
    this.drawnSuperficie.set(0);
    this.drawnCentroid.set(null);
    this.drawnEstimatedZone.set(null);
    this.panelTab.set('filters');
    this.cdr.markForCheck();
  }

  convertirEnParcelle(): void {
    const geometry = this.drawnGeometry();
    const centroid = this.drawnCentroid();
    if (!geometry || !centroid) return;

    const drawData = {
      geometry,
      superficie: this.drawnSuperficie(),
      centroid,
      estimatedZone: this.drawnEstimatedZone(),
    };

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/parcelles'], { state: { drawData } });
    } else {
      sessionStorage.setItem('agroassist_draw_data', JSON.stringify(drawData));
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/parcelles', fromDraw: 'true' },
      });
    }
  }
}
