import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { TacheService } from '../../core/services/tache.service';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusChipComponent, PageHeaderComponent, LoadingSkeletonComponent } from '../../shared/components/shared-components';
import { Tache, StatutTache, KanbanColumn } from '../../core/models/tache.model';
import { MOCK_PARCELLES } from '../../../assets/mock-data/parcelles.mock';
import { MOCK_EQUIPES } from '../../../assets/mock-data/taches.mock';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-taches',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusChipComponent, PageHeaderComponent, LoadingSkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Tâches" subtitle="Gestion et suivi des tâches agricoles">
      <button (click)="openCreate()" class="btn-primary flex items-center gap-2">
        <span class="material-icons text-[16px]" aria-hidden="true">add</span> Nouvelle tâche
      </button>
    </app-page-header>

    <!-- Onglets -->
    <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-5 w-fit">
      <button *ngFor="let tab of tabs" (click)="activeTab = tab.id"
        class="px-4 py-2 rounded-md text-sm font-medium transition-all"
        [class.bg-white]="activeTab === tab.id"
        [class.shadow-sm]="activeTab === tab.id"
        [class.text-gray-900]="activeTab === tab.id"
        [class.text-gray-500]="activeTab !== tab.id"
      >{{ tab.label }}</button>
    </div>

    <!-- Filtres -->
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <select [(ngModel)]="filtrePriorite" (ngModelChange)="applyFilters()" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
        <option value="">Toutes priorités</option>
        <option value="urgent">Urgent</option>
        <option value="haute">Haute</option>
        <option value="normale">Normale</option>
        <option value="basse">Basse</option>
      </select>
      <select [(ngModel)]="filtreType" (ngModelChange)="applyFilters()" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
        <option value="">Tous types</option>
        <option value="semis">Semis</option>
        <option value="irrigation">Irrigation</option>
        <option value="traitement">Traitement</option>
        <option value="fertilisation">Fertilisation</option>
        <option value="desherbage">Désherbage</option>
        <option value="recolte">Récolte</option>
        <option value="inspection">Inspection</option>
      </select>
      <select [(ngModel)]="filtreEquipe" (ngModelChange)="applyFilters()" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
        <option value="">Toutes équipes</option>
        <option *ngFor="let e of equipes" [value]="e.id">{{ e.nom }}</option>
      </select>
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-gray-500">Échéance avant le</span>
        <input type="date" [(ngModel)]="filtreDateEcheance" (ngModelChange)="applyFilters()" class="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"/>
      </div>
    </div>

    <!-- Vue Kanban -->
    <div *ngIf="activeTab === 'kanban'" class="flex gap-4 overflow-x-auto pb-4">
      <div *ngFor="let col of columns; trackBy: trackByColId" class="flex-shrink-0 w-72">
        <div class="flex items-center justify-between mb-3 px-1">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full" [style.background]="col.color"></div>
            <h3 class="text-sm font-semibold text-gray-900">{{ col.label }}</h3>
          </div>
          <span class="bg-gray-100 text-gray-600 text-xs font-medium rounded-full px-2 py-0.5">{{ col.taches.length }}</span>
        </div>
        <div class="space-y-3 min-h-32 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 transition-colors"
          [attr.data-kanban-col]="col.id"
          (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" (drop)="onDrop($event, col.id)">
          <div *ngIf="loading"><div *ngFor="let i of [0,1,2]" class="skeleton h-24 rounded-lg"></div></div>
          <div *ngFor="let t of col.taches; trackBy: trackById"
            class="card p-4 cursor-pointer hover:shadow-md transition-all border border-gray-100"
            draggable="true" (dragstart)="onDragStart(t)" (click)="openEdit(t)"
            (touchstart)="onTouchStart($event, t)" (touchmove)="onTouchMove($event)" (touchend)="onTouchEnd($event)"
            style="touch-action: pan-y;">
            <div class="flex items-center justify-between mb-2">
              <span class="inline-flex items-center gap-1 rounded-full text-[10px] font-medium px-2 py-0.5"
                [class.bg-red-100]="t.priorite === 'urgent'" [class.text-red-700]="t.priorite === 'urgent'"
                [class.bg-orange-100]="t.priorite === 'haute'" [class.text-orange-700]="t.priorite === 'haute'"
                [class.bg-gray-100]="t.priorite === 'normale' || t.priorite === 'basse'" [class.text-gray-600]="t.priorite === 'normale' || t.priorite === 'basse'">
                <span class="material-icons text-[10px]" aria-hidden="true">{{ prioriteIcon(t.priorite) }}</span>
                {{ prioriteLabel(t.priorite) }}
              </span>
              <span class="text-lg">{{ typeEmoji(t.type) }}</span>
            </div>
            <p class="text-sm font-semibold text-gray-900 mb-1 leading-tight">{{ t.titre }}</p>
            <p class="text-xs text-gray-500 line-clamp-2 mb-3">{{ t.description }}</p>
            <div class="flex items-center gap-1 mb-3">
              <span class="material-icons text-gray-500 text-[12px]" aria-hidden="true">agriculture</span>
              <span class="text-xs text-gray-500">{{ getParcelle(t.parcelleId) }}</span>
            </div>
            <div *ngIf="t.completionPct > 0 && t.completionPct < 100" class="mb-3">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] text-gray-500">Progression</span>
                <span class="text-[10px] font-medium text-gray-600">{{ t.completionPct }}%</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-1.5">
                <div class="bg-primary-600 h-1.5 rounded-full transition-all" [style.width]="t.completionPct + '%'"></div>
              </div>
            </div>
            <div class="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
              <span class="text-[10px] text-gray-500 flex items-center gap-0.5">
                <span class="material-icons text-[10px]" aria-hidden="true">schedule</span>
                {{ t.dateFin | date:'dd/MM' }}
              </span>
              <div class="flex gap-1">
                <button *ngFor="let s of getNextStatuts(t.statut)"
                  (click)="changeStatut(t, s.statut); $event.stopPropagation()"
                  [attr.aria-label]="'Changer le statut de ' + t.titre + ' en ' + s.label"
                  class="text-sm text-gray-500 hover:text-primary-600 border border-gray-200 hover:border-primary-300 rounded px-2 py-1 min-h-[36px] transition-colors">
                  {{ s.label }}
                </button>
                <button (click)="deleteTache(t); $event.stopPropagation()"
                  [attr.aria-label]="'Supprimer ' + t.titre"
                  class="text-sm text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded px-2 py-1 min-h-[36px] transition-colors">
                  <span class="material-icons text-[14px]" aria-hidden="true">delete</span>
                </button>
              </div>
            </div>
          </div>
          <div *ngIf="!loading && col.taches.length === 0" class="text-center py-6 text-xs text-gray-500">
            <span class="material-icons text-gray-300 block mb-1" aria-hidden="true">inbox</span> Aucune tâche
          </div>
        </div>
      </div>
    </div>

    <!-- Vue Liste -->
    <div *ngIf="activeTab === 'liste'" class="card overflow-hidden">
      <!-- Desktop table -->
      <div *ngIf="!isMobile" class="overflow-x-auto">
      <table class="w-full min-w-[700px]">
        <thead>
          <tr class="bg-gray-50">
            <th class="table-header">Tâche</th>
            <th class="table-header">Type</th>
            <th class="table-header">Priorité</th>
            <th class="table-header">Statut</th>
            <th class="table-header">Parcelle</th>
            <th class="table-header">Échéance</th>
            <th class="table-header">Progression</th>
            <th class="table-header text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of filteredTaches; trackBy: trackById" class="table-row">
            <td class="table-cell">
              <p class="font-medium text-gray-900">{{ t.titre }}</p>
              <p class="text-xs text-gray-500 truncate max-w-xs">{{ t.description }}</p>
            </td>
            <td class="table-cell">{{ typeEmoji(t.type) }} {{ t.type }}</td>
            <td class="table-cell">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                [class.bg-red-100]="t.priorite === 'urgent'" [class.text-red-700]="t.priorite === 'urgent'"
                [class.bg-orange-100]="t.priorite === 'haute'" [class.text-orange-700]="t.priorite === 'haute'"
                [class.bg-gray-100]="t.priorite !== 'urgent' && t.priorite !== 'haute'" [class.text-gray-600]="t.priorite !== 'urgent' && t.priorite !== 'haute'"
              >{{ t.priorite }}</span>
            </td>
            <td class="table-cell"><app-status-chip [statut]="t.statut"></app-status-chip></td>
            <td class="table-cell text-xs">{{ getParcelle(t.parcelleId) }}</td>
            <td class="table-cell text-xs">{{ t.dateFin | date:'dd/MM/yy' }}</td>
            <td class="table-cell">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-100 rounded-full h-1.5 min-w-16">
                  <div class="h-1.5 rounded-full" [style.width]="t.completionPct + '%'"
                    [class.bg-primary-600]="t.completionPct < 100"
                    [class.bg-green-500]="t.completionPct === 100"></div>
                </div>
                <span class="text-xs text-gray-500">{{ t.completionPct }}%</span>
              </div>
            </td>
            <td class="table-cell text-right">
              <div class="flex items-center justify-end gap-1">
                <button (click)="openEdit(t)" class="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors" [attr.aria-label]="'Modifier ' + t.titre">
                  <span class="material-icons text-[16px]" aria-hidden="true">edit</span>
                </button>
                <button (click)="deleteTache(t)" class="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors" [attr.aria-label]="'Supprimer ' + t.titre">
                  <span class="material-icons text-[16px]" aria-hidden="true">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <!-- Mobile card view -->
      <div *ngIf="isMobile" class="divide-y divide-gray-100">
        <div *ngFor="let t of filteredTaches; trackBy: trackById" class="p-4 hover:bg-gray-50 transition-colors">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">{{ t.titre }}</p>
              <p class="text-xs text-gray-500 truncate">{{ t.description }}</p>
            </div>
            <span class="text-xs font-medium px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
              [class.bg-red-100]="t.priorite === 'urgent'" [class.text-red-700]="t.priorite === 'urgent'"
              [class.bg-orange-100]="t.priorite === 'haute'" [class.text-orange-700]="t.priorite === 'haute'"
              [class.bg-gray-100]="t.priorite !== 'urgent' && t.priorite !== 'haute'" [class.text-gray-600]="t.priorite !== 'urgent' && t.priorite !== 'haute'"
            >{{ t.priorite }}</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-gray-500 mb-2">
            <span>{{ typeEmoji(t.type) }} {{ t.type }}</span>
            <span>·</span>
            <span>{{ getParcelle(t.parcelleId) }}</span>
            <span>·</span>
            <span>{{ t.dateFin | date:'dd/MM/yy' }}</span>
          </div>
          <div class="flex items-center gap-2 mb-3">
            <app-status-chip [statut]="t.statut"></app-status-chip>
            <div class="flex-1 flex items-center gap-2">
              <div class="flex-1 bg-gray-100 rounded-full h-1.5">
                <div class="h-1.5 rounded-full" [style.width]="t.completionPct + '%'"
                  [class.bg-primary-600]="t.completionPct < 100"
                  [class.bg-green-500]="t.completionPct === 100"></div>
              </div>
              <span class="text-xs text-gray-500">{{ t.completionPct }}%</span>
            </div>
          </div>
          <div class="flex items-center gap-2 pt-2 border-t border-gray-50">
            <button (click)="openEdit(t)" class="flex-1 text-xs text-center py-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors" [attr.aria-label]="'Modifier ' + t.titre">Éditer</button>
            <button (click)="deleteTache(t)" class="flex-1 text-xs text-center py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors" [attr.aria-label]="'Supprimer ' + t.titre">Supprimer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vue Calendrier -->
    <div *ngIf="activeTab === 'calendrier'">
      <div class="card overflow-hidden">
        <!-- Navigation semaine -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <button (click)="previousWeek()" class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Semaine précédente">
            <span class="material-icons text-[20px] text-gray-600" aria-hidden="true">chevron_left</span>
          </button>
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-semibold text-gray-900">{{ calendarLabel }}</h3>
            <button *ngIf="semaineOffset !== 0" (click)="goToCurrentWeek()" class="text-xs text-primary-600 hover:text-primary-800 font-medium">
              Aujourd'hui
            </button>
          </div>
          <button (click)="nextWeek()" class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Semaine suivante">
            <span class="material-icons text-[20px] text-gray-600" aria-hidden="true">chevron_right</span>
          </button>
        </div>
        <!-- Desktop grid calendar -->
        <div class="hidden md:block">
          <div class="grid grid-cols-7 border-b border-gray-200">
            <div *ngFor="let j of joursSemaine" class="text-center py-3 text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-r border-gray-100 last:border-r-0">{{ j }}</div>
          </div>
          <div class="grid grid-cols-7 min-h-[300px]">
            <div *ngFor="let jour of semaineJours; let i = index"
              class="border-r border-b border-gray-100 last:border-r-0 p-2 min-h-[120px]">
              <p class="text-xs font-medium text-gray-500 mb-2">{{ jour | date:'dd/MM' }}</p>
              <div class="space-y-1">
                <div *ngFor="let t of getTachesForDay(jour)" class="text-[10px] rounded px-1.5 py-1 truncate"
                  [class.bg-red-100]="t.priorite === 'urgent'" [class.text-red-800]="t.priorite === 'urgent'"
                  [class.bg-orange-100]="t.priorite === 'haute'" [class.text-orange-800]="t.priorite === 'haute'"
                  [class.bg-blue-100]="t.priorite === 'normale'" [class.text-blue-800]="t.priorite === 'normale'"
                  [class.bg-gray-100]="t.priorite === 'basse'" [class.text-gray-700]="t.priorite === 'basse'"
                  [title]="t.titre">
                  {{ typeEmoji(t.type) }} {{ t.titre }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile list calendar -->
        <div class="md:hidden divide-y divide-gray-100">
          <div *ngFor="let jour of semaineJours; let i = index" class="p-3">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-semibold text-gray-500">{{ joursSemaine[i] }}</span>
              <span class="text-xs font-medium text-gray-900">{{ jour | date:'dd/MM' }}</span>
              <span *ngIf="getTachesForDay(jour).length" class="bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full px-1.5 py-0.5">{{ getTachesForDay(jour).length }}</span>
            </div>
            <div class="space-y-1.5 pl-2">
              <div *ngFor="let t of getTachesForDay(jour)" class="text-xs rounded-lg px-3 py-2"
                [class.bg-red-50]="t.priorite === 'urgent'" [class.text-red-800]="t.priorite === 'urgent'"
                [class.bg-orange-50]="t.priorite === 'haute'" [class.text-orange-800]="t.priorite === 'haute'"
                [class.bg-blue-50]="t.priorite === 'normale'" [class.text-blue-800]="t.priorite === 'normale'"
                [class.bg-gray-50]="t.priorite === 'basse'" [class.text-gray-700]="t.priorite === 'basse'">
                {{ typeEmoji(t.type) }} {{ t.titre }}
              </div>
              <p *ngIf="!getTachesForDay(jour).length" class="text-xs text-gray-400 italic">Aucune tâche</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TachesComponent implements OnInit, OnDestroy {
  activeTab = 'kanban';
  loading = true;
  isMobile = false;
  private bpSub?: Subscription;
  toutesLesTaches: Tache[] = [];
  filteredTaches: Tache[] = [];
  draggedTache: Tache | null = null;
  equipes = MOCK_EQUIPES;

  filtrePriorite = '';
  filtreType = '';
  filtreEquipe = '';
  filtreDateEcheance = '';

  tabs = [
    { id: 'kanban', label: '🗂️ Kanban' },
    { id: 'liste', label: '📋 Liste' },
    { id: 'calendrier', label: '📅 Calendrier' },
  ];

  columns: KanbanColumn[] = [
    { id: 'todo', label: 'À faire', color: '#6b7280', taches: [] },
    { id: 'en_cours', label: 'En cours', color: '#3b82f6', taches: [] },
    { id: 'done', label: 'Terminé', color: '#22c55e', taches: [] },
    { id: 'reporte', label: 'Reporté', color: '#f59e0b', taches: [] },
  ];

  joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  semaineJours: Date[] = [];
  semaineOffset = 0;

  constructor(
    private tacheService: TacheService,
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
    this.buildSemaine();
    this.tacheService.getAll().pipe(take(1)).subscribe(taches => {
      this.toutesLesTaches = taches;
      this.applyFilters();
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  applyFilters(): void {
    let result = [...this.toutesLesTaches];
    if (this.filtrePriorite) result = result.filter(t => t.priorite === this.filtrePriorite);
    if (this.filtreType) result = result.filter(t => t.type === this.filtreType);
    if (this.filtreEquipe) result = result.filter(t => t.equipeId === this.filtreEquipe);
    if (this.filtreDateEcheance) {
      const limit = new Date(this.filtreDateEcheance);
      limit.setHours(23, 59, 59);
      result = result.filter(t => new Date(t.dateFin) <= limit);
    }
    this.filteredTaches = result;
    this.columns.forEach(col => {
      col.taches = result.filter(t => t.statut === col.id);
    });
  }

  private buildSemaine(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + this.semaineOffset * 7);
    this.semaineJours = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }

  previousWeek(): void {
    this.semaineOffset--;
    this.buildSemaine();
    this.cdr.markForCheck();
  }

  nextWeek(): void {
    this.semaineOffset++;
    this.buildSemaine();
    this.cdr.markForCheck();
  }

  goToCurrentWeek(): void {
    this.semaineOffset = 0;
    this.buildSemaine();
    this.cdr.markForCheck();
  }

  get calendarLabel(): string {
    if (!this.semaineJours.length) return '';
    const first = this.semaineJours[0];
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const last = this.semaineJours[6];
    if (first.getMonth() === last.getMonth()) {
      return `${months[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${months[first.getMonth()]} – ${months[last.getMonth()]} ${last.getFullYear()}`;
  }

  getTachesForDay(day: Date): Tache[] {
    return this.filteredTaches.filter(t => {
      const start = new Date(t.dateDebut);
      const end = new Date(t.dateFin);
      return day >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
             day <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });
  }

  changeStatut(tache: Tache, statut: StatutTache): void {
    this.tacheService.updateStatut(tache.id, statut).subscribe(updated => {
      const idx = this.toutesLesTaches.findIndex(t => t.id === updated.id);
      if (idx >= 0) this.toutesLesTaches[idx] = updated;
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }

  private touchStartPos = { x: 0, y: 0 };
  private touchDragging = false;

  onDragStart(tache: Tache): void { this.draggedTache = tache; }

  onTouchStart(event: TouchEvent, tache: Tache): void {
    const touch = event.touches[0];
    this.touchStartPos = { x: touch.clientX, y: touch.clientY };
    this.touchDragging = false;
    this.draggedTache = tache;
  }

  onTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];
    const dx = Math.abs(touch.clientX - this.touchStartPos.x);
    const dy = Math.abs(touch.clientY - this.touchStartPos.y);
    if (dx > 10) this.touchDragging = true;
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.touchDragging || !this.draggedTache) {
      this.draggedTache = null;
      return;
    }
    const touch = event.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
      const dropZone = target.closest('[data-kanban-col]');
      if (dropZone) {
        const statut = dropZone.getAttribute('data-kanban-col') as StatutTache;
        if (statut && this.draggedTache.statut !== statut) {
          this.changeStatut(this.draggedTache, statut);
        }
      }
    }
    this.draggedTache = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.add('border-primary-400', 'bg-primary-50');
  }

  onDragLeave(event: DragEvent): void {
    (event.currentTarget as HTMLElement).classList.remove('border-primary-400', 'bg-primary-50');
  }

  onDrop(event: DragEvent, statut: StatutTache): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('border-primary-400', 'bg-primary-50');
    if (this.draggedTache && this.draggedTache.statut !== statut) {
      this.changeStatut(this.draggedTache, statut);
    }
    this.draggedTache = null;
  }

  async openCreate(): Promise<void> {
    const { TacheFormComponent } = await import('./tache-form.component');
    const ref = this.dialogService.open(TacheFormComponent, { data: {} });
    const result = await ref.afterClosed();
    if (result) {
      this.reloadTaches();
    }
  }

  async openEdit(tache: Tache): Promise<void> {
    const { TacheFormComponent } = await import('./tache-form.component');
    const ref = this.dialogService.open(TacheFormComponent, { data: { tache } });
    const result = await ref.afterClosed();
    if (result) {
      this.reloadTaches();
    }
  }

  async deleteTache(tache: Tache): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Supprimer la tâche',
      message: `Êtes-vous sûr de vouloir supprimer la tâche "${tache.titre}" ?`,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      confirmColor: 'danger',
    });
    if (confirmed) {
      this.tacheService.delete(tache.id).pipe(take(1)).subscribe(() => {
        this.toastService.success(`Tâche "${tache.titre}" supprimée`);
        this.reloadTaches();
      });
    }
  }

  private reloadTaches(): void {
    this.tacheService.getAll().pipe(take(1)).subscribe(taches => {
      this.toutesLesTaches = taches;
      this.applyFilters();
      this.cdr.markForCheck();
    });
  }

  getNextStatuts(statut: StatutTache): { statut: StatutTache; label: string }[] {
    const map: Record<StatutTache, { statut: StatutTache; label: string }[]> = {
      todo: [{ statut: 'en_cours', label: '▶ Démarrer' }],
      en_cours: [{ statut: 'done', label: '✓ Terminer' }, { statut: 'reporte', label: '⏸ Reporter' }],
      done: [],
      reporte: [{ statut: 'todo', label: '↩ Réactiver' }],
    };
    return map[statut] ?? [];
  }

  getParcelle(id: string): string {
    return MOCK_PARCELLES.find(p => p.id === id)?.nom ?? id;
  }

  typeEmoji(t: string): string {
    return { semis: '🌱', irrigation: '💧', traitement: '🧪', fertilisation: '🌿', desherbage: '✂️', recolte: '🌾', inspection: '🔍' }[t] ?? '📋';
  }

  prioriteLabel(p: string): string {
    return { urgent: 'Urgent', haute: 'Haute', normale: 'Normale', basse: 'Basse' }[p] ?? p;
  }

  prioriteIcon(p: string): string {
    return { urgent: 'error', haute: 'arrow_upward', normale: 'remove', basse: 'arrow_downward' }[p] ?? 'remove';
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
  trackByColId(_: number, col: KanbanColumn): string { return col.id; }
}
