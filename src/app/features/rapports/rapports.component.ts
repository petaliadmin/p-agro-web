import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RapportService, KpiRapport, RendementParCulture, ProblemeDetecte } from '../../core/services/rapport.service';
import { EquipeService } from '../../core/services/equipe.service';
import { IntrantService } from '../../core/services/intrant.service';
import { VisiteService } from '../../core/services/visite.service';
import { TacheService } from '../../core/services/tache.service';
import { ParcelleService } from '../../core/services/parcelle.service';
import { Visite } from '../../core/models/visite.model';
import { Parcelle } from '../../core/models/parcelle.model';
import { Tache } from '../../core/models/tache.model';
import { MOCK_MEMBRES } from '../../../assets/mock-data/taches.mock';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { PageHeaderComponent, LoadingSkeletonComponent } from '../../shared/components/shared-components';
import { ThemeService } from '../../core/services/theme.service';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { Equipe } from '../../core/models/membre.model';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

interface RapportVisite {
  visiteId: string;
  parcelleName: string;
  parcelleCode: string;
  technicienName: string;
  date: Date;
  duree: number;
  resume: string;
  observations: Visite['observations'];
  recommandationsCount: number;
  statut: 'sain' | 'attention' | 'urgent';
}

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, LoadingSkeletonComponent, StatCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Rapports" subtitle="Analyse et indicateurs de performance">
      <div class="flex items-center gap-2">
        <select [(ngModel)]="periode" (ngModelChange)="onPeriodeChange()" class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
          <option value="semaine">Cette semaine</option>
          <option value="mois">Ce mois</option>
          <option value="saison">Cette saison</option>
        </select>
        <button class="btn-primary flex items-center gap-2" (click)="genererPDF()" [disabled]="generatingPdf">
          <span class="material-icons text-[16px]" aria-hidden="true">{{ generatingPdf ? 'hourglass_top' : 'download' }}</span>
          {{ generatingPdf ? 'Génération...' : 'Générer PDF' }}
        </button>
      </div>
    </app-page-header>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <div class="card p-4 text-center">
        <span class="material-icons text-primary-600 text-[24px] mb-1" aria-hidden="true">fact_check</span>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ kpis.visitesRealisees }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Visites réalisées</p>
      </div>
      <div class="card p-4 text-center">
        <span class="material-icons text-green-600 text-[24px] mb-1" aria-hidden="true">landscape</span>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ kpis.haCouvertes }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Hectares couverts</p>
      </div>
      <div class="card p-4 text-center">
        <span class="material-icons text-blue-600 text-[24px] mb-1" aria-hidden="true">task_alt</span>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ kpis.tachesClosees }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tâches clôturées</p>
      </div>
      <div class="card p-4 text-center">
        <span class="material-icons text-yellow-600 text-[24px] mb-1" aria-hidden="true">payments</span>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ formatFCFA(kpis.coutIntrants) }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Coût intrants</p>
      </div>
      <div class="card p-4 text-center">
        <span class="material-icons text-purple-600 text-[24px] mb-1" aria-hidden="true">trending_up</span>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ kpis.rendementMoyen }} t/ha</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Rendement moyen</p>
      </div>
      <div class="card p-4 text-center">
        <span class="material-icons text-[24px] mb-1" aria-hidden="true" [class.text-green-600]="kpis.tauxAlertesResolues >= 80" [class.text-red-600]="kpis.tauxAlertesResolues < 80">verified</span>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ kpis.tauxAlertesResolues }}%</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Alertes résolues</p>
      </div>
    </div>

    <!-- Row: Rendement par culture + Top problèmes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <!-- Rendement par culture -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Rendement par culture</h3>
        <div *ngIf="loading"><app-loading-skeleton [rows]="6"></app-loading-skeleton></div>
        <div *ngIf="!loading" class="space-y-3">
          <div *ngFor="let r of rendements" class="flex items-center gap-3">
            <span class="text-lg w-7 text-center">{{ r.emoji }}</span>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ r.culture }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ r.rendement }} / {{ r.objectif }} t/ha</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div class="h-2 rounded-full transition-all"
                  [style.width]="rendementPct(r) + '%'"
                  [class.bg-green-500]="rendementPct(r) >= 90"
                  [class.bg-yellow-500]="rendementPct(r) >= 70 && rendementPct(r) < 90"
                  [class.bg-red-500]="rendementPct(r) < 70"></div>
              </div>
            </div>
            <span class="text-xs font-bold w-10 text-right"
              [class.text-green-600]="rendementPct(r) >= 90"
              [class.text-yellow-600]="rendementPct(r) >= 70 && rendementPct(r) < 90"
              [class.text-red-600]="rendementPct(r) < 70">{{ rendementPct(r) }}%</span>
          </div>
        </div>
      </div>

      <!-- Top problèmes -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Top 5 problèmes détectés</h3>
        <div *ngIf="loading"><app-loading-skeleton [rows]="5"></app-loading-skeleton></div>
        <div *ngIf="!loading" class="space-y-3">
          <div *ngFor="let p of problemes; let i = index" class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              [class.bg-red-500]="i === 0"
              [class.bg-orange-500]="i === 1"
              [class.bg-yellow-500]="i >= 2">{{ i + 1 }}</span>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm text-gray-800 dark:text-gray-200">{{ p.nom }}</span>
                <span class="inline-flex items-center rounded-full text-[10px] font-medium px-2 py-0.5"
                  [class.bg-red-100]="p.type === 'maladie'" [class.text-red-700]="p.type === 'maladie'"
                  [class.bg-orange-100]="p.type === 'ravageur'" [class.text-orange-700]="p.type === 'ravageur'"
                  [class.bg-blue-100]="p.type === 'stress'" [class.text-blue-700]="p.type === 'stress'"
                >{{ typeLabel(p.type) }}</span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                <div class="h-1.5 rounded-full bg-primary-600" [style.width]="problemePct(p) + '%'"></div>
              </div>
            </div>
            <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ p.count }} cas</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Row: Activité mensuelle + Performance équipes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Activité mensuelle -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Activité mensuelle</h3>
        <div *ngIf="loading"><app-loading-skeleton [rows]="4"></app-loading-skeleton></div>
        <div *ngIf="!loading">
          <div class="flex items-center gap-4 mb-3">
            <span class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><span class="w-3 h-3 rounded bg-primary-600"></span> Visites</span>
            <span class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><span class="w-3 h-3 rounded bg-blue-400"></span> Tâches</span>
          </div>
          <div class="space-y-2">
            <div *ngFor="let s of activite" class="flex items-center gap-3">
              <span class="text-xs text-gray-500 dark:text-gray-400 w-8 font-medium">{{ s.semaine }}</span>
              <div class="flex-1 flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <div class="bg-primary-600 rounded h-3 transition-all" [style.width]="barWidth(s.visites) + '%'"></div>
                  <span class="text-[10px] text-gray-500">{{ s.visites }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="bg-blue-400 rounded h-3 transition-all" [style.width]="barWidth(s.taches) + '%'"></div>
                  <span class="text-[10px] text-gray-500">{{ s.taches }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance équipes -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance des équipes</h3>
        <div *ngIf="loading"><app-loading-skeleton [rows]="3"></app-loading-skeleton></div>
        <div *ngIf="!loading" class="space-y-5">
          <div *ngFor="let e of equipes">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" [style.background]="e.couleur"></div>
                <span class="text-sm font-medium text-gray-700">{{ e.nom }}</span>
              </div>
              <span class="text-sm font-bold"
                [class.text-green-600]="e.performanceScore >= 80"
                [class.text-yellow-600]="e.performanceScore >= 60 && e.performanceScore < 80"
                [class.text-red-600]="e.performanceScore < 60">{{ e.performanceScore }}/100</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2.5">
              <div class="h-2.5 rounded-full transition-all"
                [style.width]="e.performanceScore + '%'"
                [class.bg-green-500]="e.performanceScore >= 80"
                [class.bg-yellow-500]="e.performanceScore >= 60 && e.performanceScore < 80"
                [class.bg-red-500]="e.performanceScore < 60"></div>
            </div>
            <div class="flex items-center gap-3 mt-1.5">
              <span class="text-[10px] text-gray-500">{{ e.zone }}</span>
              <span class="text-[10px] text-gray-500">·</span>
              <span class="text-[10px] text-gray-500">{{ e.tachesEnCours }} tâches en cours</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rapports techniques des visites -->
    <div class="card p-5 mt-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span class="material-icons text-[18px] text-primary-600" aria-hidden="true">description</span>
          Rapports techniques de visites
        </h3>
        <span class="text-xs text-gray-500">{{ rapportsVisites.length }} rapport(s)</span>
      </div>
      <div *ngIf="loading"><app-loading-skeleton [rows]="4"></app-loading-skeleton></div>
      <div *ngIf="!loading && rapportsVisites.length === 0" class="text-center py-8 text-gray-400">
        <span class="material-icons text-[40px] mb-2" aria-hidden="true">folder_open</span>
        <p class="text-sm">Aucun rapport technique disponible</p>
      </div>
      <div *ngIf="!loading && rapportsVisites.length > 0" class="overflow-x-auto">
        <table class="w-full min-w-[600px] text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-500 border-b border-gray-100">
              <th class="pb-2 font-medium">Date</th>
              <th class="pb-2 font-medium">Parcelle</th>
              <th class="pb-2 font-medium">Technicien</th>
              <th class="pb-2 font-medium">Durée</th>
              <th class="pb-2 font-medium">Diagnostic</th>
              <th class="pb-2 font-medium">Reco.</th>
              <th class="pb-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rapportsVisites" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td class="py-3 text-gray-700">{{ r.date | date:'dd/MM/yyyy' }}</td>
              <td class="py-3">
                <div class="font-medium text-gray-800">{{ r.parcelleName }}</div>
                <div class="text-[10px] text-gray-400">{{ r.parcelleCode }}</div>
              </td>
              <td class="py-3 text-gray-700">{{ r.technicienName }}</td>
              <td class="py-3 text-gray-600">{{ r.duree }} min</td>
              <td class="py-3">
                <span class="inline-flex items-center rounded-full text-[10px] font-medium px-2 py-0.5"
                  [class.bg-green-100]="r.statut === 'sain'" [class.text-green-700]="r.statut === 'sain'"
                  [class.bg-yellow-100]="r.statut === 'attention'" [class.text-yellow-700]="r.statut === 'attention'"
                  [class.bg-red-100]="r.statut === 'urgent'" [class.text-red-700]="r.statut === 'urgent'">
                  {{ r.statut === 'sain' ? 'Sain' : r.statut === 'attention' ? 'Attention' : 'Urgent' }}
                </span>
              </td>
              <td class="py-3 text-gray-600">{{ r.recommandationsCount }}</td>
              <td class="py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button (click)="voirResume(r)" class="min-w-[44px] min-h-[44px] rounded-md flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Voir le résumé" aria-label="Voir le résumé">
                    <span class="material-icons text-[16px]" aria-hidden="true">visibility</span>
                  </button>
                  <button (click)="telechargerRapportVisite(r)" class="min-w-[44px] min-h-[44px] rounded-md flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Télécharger PDF" aria-label="Télécharger le rapport PDF">
                    <span class="material-icons text-[16px]" aria-hidden="true">download</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Résumé rapport modal -->
    <div *ngIf="selectedRapport" class="fixed inset-0 z-[100] flex items-center justify-center p-4" (click)="selectedRapport = null">
      <div class="fixed inset-0 bg-black/40" aria-hidden="true"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Rapport technique</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ selectedRapport.parcelleName }} — {{ selectedRapport.date | date:'dd/MM/yyyy' }}</p>
          </div>
          <button (click)="selectedRapport = null" class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <span class="material-icons text-[18px]" aria-hidden="true">close</span>
          </button>
        </div>
        <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <p class="text-xs font-medium text-gray-500 mb-1">Technicien</p>
            <p class="text-sm text-gray-800">{{ selectedRapport.technicienName }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-gray-500 mb-1">Résumé</p>
            <p class="text-sm text-gray-800">{{ selectedRapport.resume }}</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-[10px] text-gray-500 mb-0.5">Croissance</p>
              <p class="text-sm font-medium text-gray-800 capitalize">{{ selectedRapport.observations.croissance }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-[10px] text-gray-500 mb-0.5">Feuilles</p>
              <p class="text-sm font-medium text-gray-800 capitalize">{{ selectedRapport.observations.couleurFeuilles }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-[10px] text-gray-500 mb-0.5">Hauteur</p>
              <p class="text-sm font-medium text-gray-800">{{ selectedRapport.observations.hauteurPlantes }} cm</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-[10px] text-gray-500 mb-0.5">Couverture</p>
              <p class="text-sm font-medium text-gray-800">{{ selectedRapport.observations.tauxCouverture }}%</p>
            </div>
          </div>
          <div *ngIf="selectedRapport.observations.maladiesDetectees.length > 0">
            <p class="text-xs font-medium text-gray-500 mb-1">Maladies détectées</p>
            <div class="flex flex-wrap gap-1">
              <span *ngFor="let m of selectedRapport.observations.maladiesDetectees" class="inline-flex items-center rounded-full bg-red-50 text-red-700 text-[10px] px-2 py-0.5">{{ m }}</span>
            </div>
          </div>
          <div *ngIf="selectedRapport.observations.ravageursDetectes.length > 0">
            <p class="text-xs font-medium text-gray-500 mb-1">Ravageurs détectés</p>
            <div class="flex flex-wrap gap-1">
              <span *ngFor="let rv of selectedRapport.observations.ravageursDetectes" class="inline-flex items-center rounded-full bg-orange-50 text-orange-700 text-[10px] px-2 py-0.5">{{ rv }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button (click)="selectedRapport = null" class="btn-secondary text-sm px-4 py-2">Fermer</button>
          <button (click)="telechargerRapportVisite(selectedRapport)" class="btn-primary text-sm px-4 py-2 flex items-center gap-2">
            <span class="material-icons text-[16px]" aria-hidden="true">download</span> Télécharger PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Graphique consommation intrants vs budget -->
    <div class="card p-5 mt-4">
      <h3 class="text-sm font-semibold text-gray-900 mb-4">Consommation intrants vs budget</h3>
      <canvas *ngIf="!budgetChartError" #budgetChart height="100" role="img" aria-label="Graphique consommation intrants versus budget prévu"></canvas>
      <div *ngIf="budgetChartError" class="flex items-center justify-center h-32 text-sm text-gray-500">
        <span class="material-icons text-gray-400 mr-2" aria-hidden="true">error_outline</span> Impossible de charger le graphique
      </div>
    </div>
  `,
})
export class RapportsComponent implements OnInit {
  @ViewChild('budgetChart') budgetChartRef!: ElementRef;
  loading = true;
  generatingPdf = false;
  periode: 'semaine' | 'mois' | 'saison' = 'mois';

  kpis: KpiRapport = { visitesRealisees: 0, haCouvertes: 0, tachesClosees: 0, coutIntrants: 0, rendementMoyen: 0, tauxAlertesResolues: 0 };
  rendements: RendementParCulture[] = [];
  problemes: ProblemeDetecte[] = [];
  activite: { semaine: string; visites: number; taches: number }[] = [];
  equipes: Equipe[] = [];
  rapportsVisites: RapportVisite[] = [];
  selectedRapport: RapportVisite | null = null;

  private budgetChartInstance: any = null;
  private maxProbleme = 1;
  private maxActivite = 1;
  private parcelles: Parcelle[] = [];
  private membres = MOCK_MEMBRES;

  private lastConso: { type: string; quantite: number }[] = [];

  constructor(
    private rapportService: RapportService,
    private equipeService: EquipeService,
    private intrantService: IntrantService,
    private visiteService: VisiteService,
    private tacheService: TacheService,
    private parcelleService: ParcelleService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      this.themeService.isDark();
      untracked(() => {
        if (this.lastConso.length > 0) {
          this.initBudgetChart(this.lastConso);
        }
      });
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  onPeriodeChange(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.loadData();
  }

  private loadData(): void {
    forkJoin({
      kpis: this.rapportService.getKpis(this.periode),
      rendements: this.rapportService.getRendementParCulture(),
      problemes: this.rapportService.getTopProblemes(),
      activite: this.rapportService.getActiviteMensuelle(),
      equipes: this.equipeService.getAll().pipe(take(1)),
      taches: this.tacheService.getAll().pipe(take(1)),
      conso: this.intrantService.getConsommation30j(),
      visites: this.visiteService.getAll().pipe(take(1)),
      parcelles: this.parcelleService.getAll().pipe(take(1)),
    }).subscribe(data => {
      this.kpis = data.kpis;
      this.rendements = data.rendements;
      this.problemes = data.problemes;
      this.maxProbleme = Math.max(...data.problemes.map(p => p.count), 1);
      this.activite = data.activite;
      this.maxActivite = Math.max(...data.activite.map(a => Math.max(a.visites, a.taches)), 1);
      // Calculate real team performance from tasks
      this.equipes = data.equipes.map(e => {
        const teamTasks = data.taches.filter((t: Tache) => t.equipeId === e.id);
        const total = teamTasks.length;
        const done = teamTasks.filter((t: Tache) => t.statut === 'done').length;
        const enCours = teamTasks.filter((t: Tache) => t.statut === 'en_cours').length;
        const score = total > 0 ? Math.round((done / total) * 100) : 0;
        return { ...e, performanceScore: score, tachesEnCours: enCours };
      });
      this.parcelles = data.parcelles;
      this.rapportsVisites = this.buildRapportsVisites(data.visites, data.parcelles);
      this.loading = false;
      this.cdr.markForCheck();
      setTimeout(() => this.initBudgetChart(data.conso), 100);
    });
  }

  genererPDF(): void {
    this.generatingPdf = true;
    this.cdr.markForCheck();

    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      let y = 20;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(26, 122, 74); // primary-600
      doc.text('AgroAssist', 14, y);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Rapport de performance — ${this.periode === 'semaine' ? 'Cette semaine' : this.periode === 'mois' ? 'Ce mois' : 'Cette saison'}`, 14, y + 8);
      doc.text(`Généré le ${dateStr}`, 14, y + 14);
      y += 28;

      // Ligne séparatrice
      doc.setDrawColor(200);
      doc.line(14, y, 196, y);
      y += 10;

      // KPIs
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text('Indicateurs clés', 14, y);
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(60);
      const kpiLines = [
        `Visites réalisées : ${this.kpis.visitesRealisees}`,
        `Hectares couverts : ${this.kpis.haCouvertes}`,
        `Tâches clôturées : ${this.kpis.tachesClosees}`,
        `Coût intrants : ${this.formatFCFA(this.kpis.coutIntrants)} FCFA`,
        `Rendement moyen : ${this.kpis.rendementMoyen} t/ha`,
        `Taux alertes résolues : ${this.kpis.tauxAlertesResolues}%`,
      ];
      kpiLines.forEach(line => { doc.text(line, 18, y); y += 7; });
      y += 6;

      // Rendements
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text('Rendement par culture', 14, y);
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(60);
      this.rendements.forEach(r => {
        const pct = Math.round((r.rendement / r.objectif) * 100);
        doc.text(`${r.culture} : ${r.rendement} t/ha sur ${r.objectif} t/ha (${pct}%)`, 18, y);
        y += 7;
      });
      y += 6;

      // Problèmes
      if (this.problemes.length) {
        doc.setFontSize(14);
        doc.setTextColor(30);
        doc.text('Problèmes détectés', 14, y);
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(60);
        this.problemes.forEach(p => {
          doc.text(`${p.nom} : ${p.count} occurrence(s) — type ${p.type}`, 18, y);
          y += 7;
        });
        y += 6;
      }

      // Activité hebdomadaire
      if (this.activite.length) {
        doc.setFontSize(14);
        doc.setTextColor(30);
        doc.text('Activité hebdomadaire', 14, y);
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(60);
        this.activite.forEach(a => {
          doc.text(`${a.semaine} : ${a.visites} visites, ${a.taches} tâches`, 18, y);
          y += 7;
        });
      }

      // Budget chart image from canvas
      const budgetCanvas = this.budgetChartRef?.nativeElement;
      if (budgetCanvas) {
        if (y > 220) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setTextColor(30);
        doc.text('Budget vs Consommation', 14, y);
        y += 6;
        try {
          const imgData = budgetCanvas.toDataURL('image/png');
          doc.addImage(imgData, 'PNG', 14, y, 170, 70);
          y += 76;
        } catch (_) { /* canvas tainted — skip */ }
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('AgroAssist — Rapport auto-généré', 14, 285);

      doc.save(`rapport-agroassist-${this.periode}-${dateStr.replace(/\//g, '-')}.pdf`);
      this.generatingPdf = false;
      this.cdr.markForCheck();
    });
  }

  rendementPct(r: RendementParCulture): number {
    return Math.round((r.rendement / r.objectif) * 100);
  }

  problemePct(p: ProblemeDetecte): number {
    return Math.round((p.count / this.maxProbleme) * 100);
  }

  barWidth(value: number): number {
    return Math.round((value / this.maxActivite) * 100);
  }

  formatFCFA(v: number): string {
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000) return Math.round(v / 1000) + 'k';
    return v.toString();
  }

  typeLabel(type: string): string {
    return { maladie: 'Maladie', ravageur: 'Ravageur', stress: 'Stress' }[type] ?? type;
  }

  private buildRapportsVisites(visites: Visite[], parcelles: Parcelle[]): RapportVisite[] {
    const parcelleMap = new Map(parcelles.map(p => [p.id, p]));
    const membreMap = new Map(this.membres.map(m => [m.id, m]));

    return visites
      .filter(v => v.statut === 'completee' && v.rapport)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(v => {
        const parcelle = parcelleMap.get(v.parcelleId);
        const tech = membreMap.get(v.technicienId);
        const hasProblems = v.observations.maladiesDetectees.length > 0 ||
          v.observations.ravageursDetectes.length > 0 || v.observations.stressHydrique;
        const isUrgent = v.observations.croissance === 'faible' && hasProblems;

        return {
          visiteId: v.id,
          parcelleName: parcelle?.nom ?? 'Parcelle inconnue',
          parcelleCode: parcelle?.code ?? '',
          technicienName: tech ? `${tech.prenom} ${tech.nom}` : 'Inconnu',
          date: new Date(v.date),
          duree: v.duree,
          resume: v.rapport!,
          observations: v.observations,
          recommandationsCount: v.recommandations.length,
          statut: isUrgent ? 'urgent' as const : hasProblems ? 'attention' as const : 'sain' as const,
        };
      });
  }

  voirResume(r: RapportVisite): void {
    this.selectedRapport = r;
    this.cdr.markForCheck();
  }

  telechargerRapportVisite(r: RapportVisite): void {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      const dateStr = new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      let y = 20;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(26, 122, 74);
      doc.text('AgroAssist', 14, y);
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text('Rapport technique de visite', 14, y + 10);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, y + 18);
      y += 30;

      doc.setDrawColor(200);
      doc.line(14, y, 196, y);
      y += 10;

      // Infos visite
      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.text('Informations de la visite', 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`Parcelle : ${r.parcelleName} (${r.parcelleCode})`, 18, y); y += 7;
      doc.text(`Technicien : ${r.technicienName}`, 18, y); y += 7;
      doc.text(`Date : ${dateStr}`, 18, y); y += 7;
      doc.text(`Durée : ${r.duree} minutes`, 18, y); y += 7;
      doc.text(`Diagnostic : ${r.statut === 'sain' ? 'Sain' : r.statut === 'attention' ? 'Attention requise' : 'Urgent'}`, 18, y); y += 12;

      // Observations
      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.text('Observations', 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`Croissance : ${r.observations.croissance}`, 18, y); y += 7;
      doc.text(`Couleur feuilles : ${r.observations.couleurFeuilles}`, 18, y); y += 7;
      doc.text(`Hauteur plantes : ${r.observations.hauteurPlantes} cm`, 18, y); y += 7;
      doc.text(`Taux couverture : ${r.observations.tauxCouverture}%`, 18, y); y += 7;
      doc.text(`Stress hydrique : ${r.observations.stressHydrique ? 'Oui' : 'Non'}`, 18, y); y += 7;

      if (r.observations.maladiesDetectees.length > 0) {
        doc.text(`Maladies : ${r.observations.maladiesDetectees.join(', ')}`, 18, y); y += 7;
      }
      if (r.observations.ravageursDetectes.length > 0) {
        doc.text(`Ravageurs : ${r.observations.ravageursDetectes.join(', ')}`, 18, y); y += 7;
      }
      y += 5;

      // Résumé
      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.text('Résumé du technicien', 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(60);
      const lines = doc.splitTextToSize(r.resume, 170);
      doc.text(lines, 18, y);
      y += lines.length * 6 + 10;

      // Recommandations
      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.text(`Recommandations (${r.recommandationsCount})`, 14, y);
      y += 4;

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('AgroAssist — Rapport technique auto-généré', 14, 285);

      doc.save(`rapport-visite-${r.parcelleCode || r.visiteId}-${dateStr.replace(/\//g, '-')}.pdf`);
    });
  }

  budgetChartError = false;

  private initBudgetChart(conso: { type: string; quantite: number }[]): void {
    this.lastConso = conso;
    const ctx = this.budgetChartRef?.nativeElement?.getContext('2d');
    if (!ctx) return;
    if (this.budgetChartInstance) {
      this.budgetChartInstance.destroy();
      this.budgetChartInstance = null;
    }
    try {
    const dark = this.themeService.isDark();
    const gridColor = dark ? '#374151' : '#f3f4f6';
    const textColor = dark ? '#d1d5db' : undefined;
    const budgets = conso.map(d => Math.round(d.quantite * 1.3));
    this.budgetChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: conso.map(d => d.type),
        datasets: [
          {
            label: 'Consommé',
            data: conso.map(d => d.quantite),
            backgroundColor: dark ? '#22c55e' : '#1A7A4A',
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Budget prévu',
            data: budgets,
            backgroundColor: dark ? '#4b5563' : '#d1d5db',
            borderRadius: 4,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 }, color: textColor } } },
        scales: {
          y: { beginAtZero: true, grid: { color: gridColor }, ticks: { font: { size: 11 }, color: textColor } },
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: textColor } }
        }
      }
    });
    } catch (e) {
      this.budgetChartError = true;
      this.cdr.markForCheck();
    }
  }
}
