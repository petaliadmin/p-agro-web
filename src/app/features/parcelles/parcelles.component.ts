import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParcelleService } from '../../core/services/parcelle.service';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { ThemeService } from '../../core/services/theme.service';
import { StatusChipComponent, LoadingSkeletonComponent, PageHeaderComponent, EmptyStateComponent } from '../../shared/components/shared-components';
import { Parcelle } from '../../core/models/parcelle.model';
import { MOCK_MEMBRES } from '../../../assets/mock-data/taches.mock';

import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet.markercluster';

@Component({
  selector: 'app-parcelles',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusChipComponent, LoadingSkeletonComponent, PageHeaderComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Parcelles" subtitle="Gestion des parcelles agricoles">
      <button (click)="openCreate()" class="btn-primary flex items-center gap-2">
        <span class="material-icons text-[16px]" aria-hidden="true">add</span> Nouvelle parcelle
      </button>
    </app-page-header>

    <!-- Stats header -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <div class="card p-4 text-center">
        <p class="text-2xl font-bold text-gray-900">{{ parcelles.length }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Parcelles totales</p>
      </div>
      <div class="card p-4 text-center">
        <p class="text-2xl font-bold text-primary-600">{{ totalHa }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Hectares couverts</p>
      </div>
      <div class="card p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ urgentesCount }}</p>
        <p class="text-xs text-gray-500 mt-0.5">Parcelles urgentes</p>
      </div>
      <div class="card p-4 text-center">
        <p class="text-2xl font-bold text-yellow-600">{{ attentionCount }}</p>
        <p class="text-xs text-gray-500 mt-0.5">À surveiller</p>
      </div>
    </div>

    <!-- Filtres + toggle vue -->
    <div class="card p-4 mb-4">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Recherche -->
        <div class="relative flex-1 min-w-48">
          <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[16px]" aria-hidden="true">search</span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="applyFilters()"
            placeholder="Rechercher une parcelle…"
            class="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
        </div>
        <!-- Zone -->
        <select [(ngModel)]="filterZone" (ngModelChange)="applyFilters()" aria-label="Filtrer par zone"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 text-gray-700">
          <option value="">Toutes les zones</option>
          <option *ngFor="let z of zones">{{ z }}</option>
        </select>
        <!-- Culture -->
        <select [(ngModel)]="filterCulture" (ngModelChange)="applyFilters()" aria-label="Filtrer par culture"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 text-gray-700">
          <option value="">Toutes cultures</option>
          <option value="riz">Riz</option>
          <option value="mais">Maïs</option>
          <option value="mil">Mil</option>
          <option value="arachide">Arachide</option>
          <option value="oignon">Oignon</option>
          <option value="tomate">Tomate</option>
        </select>
        <!-- Statut -->
        <select [(ngModel)]="filterStatut" (ngModelChange)="applyFilters()" aria-label="Filtrer par statut"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 text-gray-700">
          <option value="">Tous statuts</option>
          <option value="sain">Sain</option>
          <option value="attention">Attention</option>
          <option value="urgent">Urgent</option>
          <option value="recolte">Récolte</option>
        </select>
        <!-- Export -->
        <div class="relative ml-auto">
          <button (click)="showExportMenu = !showExportMenu" class="btn-secondary text-xs flex items-center gap-1">
            <span class="material-icons text-[14px]" aria-hidden="true">download</span> Export CSV
            <span class="material-icons text-[14px]" aria-hidden="true">expand_more</span>
          </button>
          <div *ngIf="showExportMenu" class="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[180px]">
            <button (click)="exportCSV(false); showExportMenu = false" class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
              <span class="material-icons text-[14px] mr-1 align-middle" aria-hidden="true">filter_list</span> Exporter filtrés ({{ filtered.length }})
            </button>
            <button (click)="exportCSV(true); showExportMenu = false" class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
              <span class="material-icons text-[14px] mr-1 align-middle" aria-hidden="true">select_all</span> Exporter tout ({{ parcelles.length }})
            </button>
          </div>
        </div>
        <!-- Toggle vue -->
        <div class="flex items-center bg-gray-100 rounded-lg p-1">
          <button (click)="setVue('liste')" [class.bg-white]="vue === 'liste'" [class.shadow-sm]="vue === 'liste'"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all" aria-label="Vue liste">
            <span class="material-icons text-[16px]" aria-hidden="true">list</span>
          </button>
          <button (click)="setVue('grille')" [class.bg-white]="vue === 'grille'" [class.shadow-sm]="vue === 'grille'"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all" aria-label="Vue grille">
            <span class="material-icons text-[16px]" aria-hidden="true">grid_view</span>
          </button>
          <button (click)="setVue('carte')" [class.bg-white]="vue === 'carte'" [class.shadow-sm]="vue === 'carte'"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all" aria-label="Vue carte">
            <span class="material-icons text-[16px]" aria-hidden="true">map</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Vue Liste -->
    <div *ngIf="vue === 'liste'" class="card overflow-hidden">
      <div *ngIf="loading"><app-loading-skeleton [rows]="5"></app-loading-skeleton></div>
      <div *ngIf="!loading && filtered.length" class="overflow-x-auto">
      <table class="w-full min-w-[700px]">
        <thead>
          <tr class="bg-gray-50">
            <th class="table-header cursor-pointer select-none" (click)="toggleSort('nom')" [attr.aria-sort]="ariaSort('nom')">Code / Nom <span class="material-icons text-[12px] align-middle text-gray-500" aria-hidden="true">{{ sortIcon('nom') }}</span></th>
            <th class="table-header cursor-pointer select-none" (click)="toggleSort('superficie')" [attr.aria-sort]="ariaSort('superficie')">Superficie <span class="material-icons text-[12px] align-middle text-gray-500" aria-hidden="true">{{ sortIcon('superficie') }}</span></th>
            <th class="table-header cursor-pointer select-none" (click)="toggleSort('culture')" [attr.aria-sort]="ariaSort('culture')">Culture <span class="material-icons text-[12px] align-middle text-gray-500" aria-hidden="true">{{ sortIcon('culture') }}</span></th>
            <th class="table-header cursor-pointer select-none" (click)="toggleSort('stade')" [attr.aria-sort]="ariaSort('stade')">Stade <span class="material-icons text-[12px] align-middle text-gray-500" aria-hidden="true">{{ sortIcon('stade') }}</span></th>
            <th class="table-header cursor-pointer select-none" (click)="toggleSort('statut')" [attr.aria-sort]="ariaSort('statut')">Statut <span class="material-icons text-[12px] align-middle text-gray-500" aria-hidden="true">{{ sortIcon('statut') }}</span></th>
            <th class="table-header">Technicien</th>
            <th class="table-header cursor-pointer select-none" (click)="toggleSort('derniereVisite')" [attr.aria-sort]="ariaSort('derniereVisite')">Dernière visite <span class="material-icons text-[12px] align-middle text-gray-500" aria-hidden="true">{{ sortIcon('derniereVisite') }}</span></th>
            <th class="table-header"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of paginatedParcelles; trackBy: trackById"
            class="table-row cursor-pointer" [routerLink]="['/parcelles', p.id]">
            <td class="table-cell">
              <div>
                <p class="font-medium text-gray-900">{{ p.nom }}</p>
                <p class="text-xs text-gray-500">{{ p.code }}</p>
              </div>
            </td>
            <td class="table-cell font-medium">{{ p.superficie }} ha</td>
            <td class="table-cell capitalize">{{ cultureEmoji(p.culture) }} {{ p.culture }}</td>
            <td class="table-cell capitalize text-xs text-gray-600">{{ p.stade }}</td>
            <td class="table-cell"><app-status-chip [statut]="p.statut"></app-status-chip></td>
            <td class="table-cell text-xs">{{ getTechNom(p.technicienId) }}</td>
            <td class="table-cell text-xs text-gray-500">{{ p.derniereVisite | date:'dd/MM/yy' }}</td>
            <td class="table-cell">
              <button class="text-gray-500 hover:text-primary-600 transition-colors" aria-label="Voir détail">
                <span class="material-icons text-[18px]" aria-hidden="true">chevron_right</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
      <app-empty-state *ngIf="!loading && !filtered.length"
        icon="search_off" title="Aucune parcelle trouvée"
        subtitle="Modifiez vos filtres pour afficher des résultats.">
      </app-empty-state>
      <!-- Pagination -->
      <div *ngIf="!loading && filtered.length > pageSize" class="flex items-center justify-between px-5 py-3 border-t border-gray-100">
        <span class="text-xs text-gray-500">{{ filtered.length }} résultat(s) — Page {{ page }}/{{ totalPages }}</span>
        <div class="flex items-center gap-1">
          <button (click)="goToPage(page - 1)" [disabled]="page <= 1" class="px-3 py-2 min-h-[44px] text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Préc.</button>
          <button *ngFor="let p of [].constructor(totalPages); let i = index" (click)="goToPage(i + 1)"
            class="px-3 py-2 min-h-[44px] min-w-[44px] text-xs rounded border transition-colors"
            [class.bg-primary-600]="page === i + 1" [class.text-white]="page === i + 1" [class.border-primary-600]="page === i + 1"
            [class.border-gray-200]="page !== i + 1" [class.hover:bg-gray-50]="page !== i + 1">{{ i + 1 }}</button>
          <button (click)="goToPage(page + 1)" [disabled]="page >= totalPages" class="px-3 py-2 min-h-[44px] text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Suiv.</button>
        </div>
      </div>
    </div>

    <!-- Vue Grille -->
    <div *ngIf="vue === 'grille'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div *ngFor="let p of filtered; trackBy: trackById"
        class="card p-5 cursor-pointer hover:shadow-md transition-shadow" [routerLink]="['/parcelles', p.id]">
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="font-semibold text-gray-900">{{ p.nom }}</p>
            <p class="text-xs text-gray-500">{{ p.code }}</p>
          </div>
          <app-status-chip [statut]="p.statut"></app-status-chip>
        </div>
        <div class="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
            <p class="text-xs text-gray-500 dark:text-gray-400">Culture</p>
            <p class="font-medium capitalize dark:text-gray-100">{{ cultureEmoji(p.culture) }} {{ p.culture }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
            <p class="text-xs text-gray-500 dark:text-gray-400">Superficie</p>
            <p class="font-medium dark:text-gray-100">{{ p.superficie }} ha</p>
          </div>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
          <span>{{ p.zone }}</span>
          <span>{{ p.derniereVisite | date:'dd/MM/yy' }}</span>
        </div>
      </div>
    </div>

    <!-- Vue Carte -->
    <div *ngIf="vue === 'carte'" class="card overflow-hidden" style="height: 600px; position: relative;">
      <div #carteMap class="w-full h-full" id="parcellesMap"></div>
      <!-- Surface panel -->
      <div *ngIf="drawnLayers.length" class="absolute top-3 right-3 z-[1000] bg-white rounded-xl shadow-lg border border-gray-200 p-4 min-w-[240px]">
        <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
          <span class="material-icons text-[16px] text-primary-600" aria-hidden="true">straighten</span>
          Surfaces dessinées
        </h4>
        <div class="space-y-2">
          <div *ngFor="let layer of drawnLayers; let i = index" class="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <div class="flex items-center gap-2">
              <span class="material-icons text-[14px] text-gray-500" aria-hidden="true">{{ layer.icon }}</span>
              <span class="text-xs text-gray-600">{{ layer.label }}</span>
            </div>
            <span class="text-sm font-semibold text-primary-700">{{ layer.area }}</span>
          </div>
        </div>
        <div class="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Total</span>
          <span class="text-base font-bold text-primary-600">{{ totalDrawnArea }}</span>
        </div>
        <button (click)="clearDrawnLayers()" class="mt-3 w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg py-1.5 transition-colors flex items-center justify-center gap-1">
          <span class="material-icons text-[14px]" aria-hidden="true">delete_outline</span> Effacer tout
        </button>
      </div>
    </div>
  `,
})
export class ParcellesComponent implements OnInit, AfterViewInit, OnDestroy {
  private _carteMapRef?: ElementRef;
  private mapNeedsInit = false;

  @ViewChild('carteMap') set carteMapRef(ref: ElementRef | undefined) {
    this._carteMapRef = ref;
    if (ref && !this.mapInstance && this.filtered.length) {
      setTimeout(() => this.initMap(), 50);
    }
  }

  vue: 'liste' | 'grille' | 'carte' = 'liste';
  loading = true;
  parcelles: Parcelle[] = [];
  filtered: Parcelle[] = [];
  paginatedParcelles: Parcelle[] = [];
  zones: string[] = [];
  search = '';
  filterZone = '';
  filterCulture = '';
  filterStatut = '';
  sortField = '';
  sortDir: 'asc' | 'desc' = 'asc';
  page = 1;
  pageSize = 10;
  private mapInstance: any;
  private drawControl: any;
  private drawnItems: any;
  drawnLayers: { label: string; area: string; areaHa: number; icon: string; leafletId: number }[] = [];
  showExportMenu = false;

  constructor(
    private parcelleService: ParcelleService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.parcelleService.getAll().subscribe(data => {
      this.parcelles = data;
      this.filtered = data;
      this.zones = this.parcelleService.getZones();
      this.updatePagination();
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
  }

  setVue(v: 'liste' | 'grille' | 'carte'): void {
    this.vue = v;
    if (v === 'carte') {
      // Destroy existing map so it gets re-created with fresh container
      if (this.mapInstance) {
        this.mapInstance.remove();
        this.mapInstance = null;
      }
      this.cdr.markForCheck();
      // Wait for *ngIf to render the div, then init
      setTimeout(() => this.initMap(), 100);
    }
  }

  get totalHa(): number { return Math.round(this.parcelles.reduce((s, p) => s + p.superficie, 0) * 10) / 10; }
  get urgentesCount(): number { return this.parcelles.filter(p => p.statut === 'urgent').length; }
  get attentionCount(): number { return this.parcelles.filter(p => p.statut === 'attention').length; }

  applyFilters(): void {
    let result = this.parcelles.filter(p => {
      const matchSearch = !this.search || p.nom.toLowerCase().includes(this.search.toLowerCase()) || p.code.toLowerCase().includes(this.search.toLowerCase());
      const matchZone = !this.filterZone || p.zone === this.filterZone;
      const matchCulture = !this.filterCulture || p.culture === this.filterCulture;
      const matchStatut = !this.filterStatut || p.statut === this.filterStatut;
      return matchSearch && matchZone && matchCulture && matchStatut;
    });
    if (this.sortField) {
      result = [...result].sort((a, b) => {
        const va = (a as any)[this.sortField];
        const vb = (b as any)[this.sortField];
        const cmp = typeof va === 'string' ? va.localeCompare(vb) : (va > vb ? 1 : va < vb ? -1 : 0);
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    }
    this.filtered = result;
    this.page = 1;
    this.updatePagination();
    this.cdr.markForCheck();
    if (this.vue === 'carte') {
      if (this.mapInstance) {
        this.mapInstance.remove();
        this.mapInstance = null;
      }
      setTimeout(() => this.initMap(), 100);
    }
  }

  toggleSort(field: string): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.applyFilters();
  }

  sortIcon(field: string): string {
    if (this.sortField !== field) return 'unfold_more';
    return this.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  ariaSort(field: string): string | null {
    if (this.sortField !== field) return null;
    return this.sortDir === 'asc' ? 'ascending' : 'descending';
  }

  updatePagination(): void {
    const start = (this.page - 1) * this.pageSize;
    this.paginatedParcelles = this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filtered.length / this.pageSize);
  }

  goToPage(p: number): void {
    this.page = Math.max(1, Math.min(p, this.totalPages));
    this.updatePagination();
    this.cdr.markForCheck();
  }

  exportCSV(all = false): void {
    const data = all ? this.parcelles : this.filtered;
    const headers = ['Code', 'Nom', 'Superficie (ha)', 'Culture', 'Stade', 'Statut', 'Zone', 'Producteur'];
    const rows = data.map(p => [p.code, p.nom, p.superficie, p.culture, p.stade, p.statut, p.zone, p.producteurNom].join(';'));
    const csv = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = all ? 'parcelles_export_complet.csv' : 'parcelles_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  private initMap(): void {
    if (!this._carteMapRef?.nativeElement) return;
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
    this.mapInstance = L.map(this._carteMapRef.nativeElement).setView([14.5, -15.0], 6);
    const tileUrl = this.themeService.isDark()
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap &copy; CartoDB'
    }).addTo(this.mapInstance);

    // Use MarkerCluster if available, fallback to featureGroup
    const markersGroup = typeof L.markerClusterGroup === 'function'
      ? L.markerClusterGroup({
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            const size = count < 10 ? 'small' : count < 30 ? 'medium' : 'large';
            const sizes: Record<string, number> = { small: 36, medium: 44, large: 52 };
            return L.divIcon({
              html: `<div style="background:#1A7A4A;color:white;border-radius:50%;width:${sizes[size]}px;height:${sizes[size]}px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${count}</div>`,
              className: 'marker-cluster-custom',
              iconSize: L.point(sizes[size], sizes[size]),
            });
          },
        })
      : L.featureGroup();

    this.filtered.forEach(p => {
      const color = p.statut === 'urgent' ? '#ef4444' : p.statut === 'attention' ? '#f59e0b' : '#22c55e';
      const statusLabel = p.statut === 'urgent' ? 'Urgent' : p.statut === 'attention' ? 'Attention' : 'Normal';
      const popupContent = `
        <div style="min-width:180px">
          <b style="font-size:13px">${p.nom}</b><br/>
          <span style="color:#666;font-size:11px">${p.code} · ${p.zone}</span><br/>
          <div style="margin:6px 0;font-size:12px">
            <span>Culture : <b>${p.culture}</b></span><br/>
            <span>Superficie : <b>${p.superficie} ha</b></span><br/>
            <span>Stade : <b>${p.stade}</b></span><br/>
            <span>Statut : <span style="color:${color};font-weight:bold">${statusLabel}</span></span>
          </div>
          <a href="/parcelles/${p.id}" style="color:#1A7A4A;font-size:12px;font-weight:500">Voir détail →</a>
        </div>`;

      const marker = L.circleMarker([p.coordonnees.lat, p.coordonnees.lng], { radius: 9, fillColor: color, color: 'white', weight: 2, fillOpacity: 0.9 })
        .bindPopup(popupContent)
        .bindTooltip(`<b>${p.nom}</b><br/>${p.superficie} ha`, {
          direction: 'top',
          offset: [0, -10],
          className: 'parcelle-label',
        });

      markersGroup.addLayer(marker);

      if (p.geometry && p.geometry.length >= 3) {
        const latlngs = p.geometry.map(c => [c.lat, c.lng] as L.LatLngTuple);
        L.polygon(latlngs, { color, weight: 2, fillColor: color, fillOpacity: 0.2 })
          .addTo(this.mapInstance)
          .bindPopup(popupContent);
      }
    });

    markersGroup.addTo(this.mapInstance);
    if (this.filtered.length > 0) {
      const bounds = markersGroup.getBounds();
      if (bounds.isValid()) {
        this.mapInstance.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
      }
    }

    // Show/hide tooltips based on zoom (only for non-clustered layers)
    this.mapInstance.on('zoomend', () => {
      const zoom = this.mapInstance.getZoom();
      const toggleTooltips = (layer: any) => {
        if (layer.openTooltip) {
          if (zoom >= 9) { layer.openTooltip(); } else { layer.closeTooltip(); }
        }
      };
      if (typeof markersGroup.eachLayer === 'function') {
        markersGroup.eachLayer(toggleTooltips);
      }
    });

    // Drawing tools
    if (typeof L.Draw !== 'undefined') {
      this.drawnItems = new L.FeatureGroup();
      this.mapInstance.addLayer(this.drawnItems);

      // Restore previously drawn layers
      this.drawnLayers.forEach(dl => {
        // Layers are lost on map re-init, clear the list
      });
      this.drawnLayers = [];

      this.drawControl = new L.Control.Draw({
        position: 'topleft',
        draw: {
          polygon: {
            allowIntersection: false,
            shapeOptions: { color: '#1A7A4A', weight: 2, fillOpacity: 0.15 },
          },
          rectangle: {
            shapeOptions: { color: '#1A7A4A', weight: 2, fillOpacity: 0.15 },
          },
          circle: {
            shapeOptions: { color: '#1A7A4A', weight: 2, fillOpacity: 0.15 },
          },
          polyline: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: this.drawnItems,
          remove: true,
        },
      });
      this.mapInstance.addControl(this.drawControl);

      this.mapInstance.on(L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer;
        const layerType = e.layerType; // 'polygon', 'rectangle', 'circle'
        this.drawnItems.addLayer(layer);

        const areaM2 = this.getLayerArea(layer, layerType);
        const areaHa = areaM2 / 10000;
        const idx = this.drawnLayers.length + 1;

        this.drawnLayers = [...this.drawnLayers, {
          label: this.getLayerLabel(layerType, idx),
          area: this.formatArea(areaM2),
          areaHa,
          icon: this.getLayerIcon(layerType),
          leafletId: L.Util.stamp(layer),
        }];
        this.cdr.markForCheck();
      });

      this.mapInstance.on(L.Draw.Event.DELETED, (e: any) => {
        const deletedIds = new Set<number>();
        e.layers.eachLayer((layer: any) => {
          deletedIds.add(L.Util.stamp(layer));
        });
        this.drawnLayers = this.drawnLayers.filter(l => !deletedIds.has(l.leafletId));
        this.cdr.markForCheck();
      });

      this.mapInstance.on(L.Draw.Event.EDITED, (e: any) => {
        e.layers.eachLayer((layer: any) => {
          const id = L.Util.stamp(layer);
          const areaM2 = this.getLayerArea(layer, undefined);
          const areaHa = areaM2 / 10000;
          this.drawnLayers = this.drawnLayers.map(l =>
            l.leafletId === id ? { ...l, area: this.formatArea(areaM2), areaHa } : l
          );
        });
        this.cdr.markForCheck();
      });
    }

    setTimeout(() => {
      if (this.mapInstance) this.mapInstance.invalidateSize();
    }, 100);
  }

  getTechNom(id: string): string {
    const m = MOCK_MEMBRES.find(m => m.id === id);
    return m ? `${m.prenom} ${m.nom}` : id;
  }

  async openCreate(): Promise<void> {
    const { ParcelleFormComponent } = await import('./parcelle-form.component');
    const ref = this.dialogService.open(ParcelleFormComponent, { data: {} });
    const result = await ref.afterClosed();
    if (result) {
      this.reloadParcelles();
    }
  }

  private reloadParcelles(): void {
    this.parcelleService.getAll().subscribe(data => {
      this.parcelles = data;
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }

  cultureEmoji(c: string): string {
    return { riz: '🌾', mais: '🌽', mil: '🌿', arachide: '🥜', oignon: '🧅', tomate: '🍅' }[c] ?? '🌱';
  }

  get totalDrawnArea(): string {
    const total = this.drawnLayers.reduce((s, l) => s + l.areaHa, 0);
    if (total >= 1) return total.toFixed(2) + ' ha';
    return (total * 10000).toFixed(0) + ' m²';
  }

  clearDrawnLayers(): void {
    if (this.drawnItems) {
      this.drawnItems.clearLayers();
    }
    this.drawnLayers = [];
    this.cdr.markForCheck();
  }

  private formatArea(areaM2: number): string {
    if (areaM2 >= 10000) return (areaM2 / 10000).toFixed(2) + ' ha';
    return areaM2.toFixed(0) + ' m²';
  }

  private getLayerArea(layer: any, layerType?: string): number {
    if (layerType === 'circle' || (layer.getRadius && typeof layer.getRadius === 'function' && !layer.getLatLngs)) {
      const r = layer.getRadius();
      return Math.PI * r * r;
    }
    if (layer.getLatLngs) {
      const latlngs = layer.getLatLngs()[0];
      return this.calcPolygonArea(latlngs);
    }
    return 0;
  }

  private calcPolygonArea(latlngs: any[]): number {
    // Shoelace formula on projected coordinates (meters)
    const earthRadius = 6378137;
    const toRad = (d: number) => d * Math.PI / 180;
    const projected = latlngs.map((ll: any) => ({
      x: toRad(ll.lng) * earthRadius * Math.cos(toRad(ll.lat)),
      y: toRad(ll.lat) * earthRadius,
    }));
    let area = 0;
    for (let i = 0; i < projected.length; i++) {
      const j = (i + 1) % projected.length;
      area += projected[i].x * projected[j].y;
      area -= projected[j].x * projected[i].y;
    }
    return Math.abs(area / 2);
  }

  private getLayerIcon(layerType: string): string {
    if (layerType === 'circle') return 'circle';
    if (layerType === 'rectangle') return 'crop_square';
    return 'pentagon';
  }

  private getLayerLabel(layerType: string, index: number): string {
    if (layerType === 'circle') return 'Cercle ' + index;
    if (layerType === 'rectangle') return 'Rectangle ' + index;
    return 'Polygone ' + index;
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
}
