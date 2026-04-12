import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EquipeService, MembreService } from '../../core/services/equipe.service';
import { TacheService } from '../../core/services/tache.service';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent, LoadingSkeletonComponent, AvatarComponent } from '../../shared/components/shared-components';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { Equipe, Membre } from '../../core/models/membre.model';
import { Tache } from '../../core/models/tache.model';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-equipes',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, LoadingSkeletonComponent, StatCardComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Équipes" subtitle="Gestion des équipes terrain et des membres">
      <div class="flex gap-2">
        <button (click)="openCreateMembre()" class="btn-secondary flex items-center gap-2 text-sm">
          <span class="material-icons text-[16px]" aria-hidden="true">person_add</span> Nouveau membre
        </button>
        <button (click)="openCreateEquipe()" class="btn-primary flex items-center gap-2">
          <span class="material-icons text-[16px]" aria-hidden="true">group_add</span> Nouvelle équipe
        </button>
      </div>
    </app-page-header>

    <!-- KPI -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <app-stat-card label="Équipes" [value]="equipes.length" icon="groups" color="blue"></app-stat-card>
      <app-stat-card label="Membres" [value]="membres.length" icon="person" color="green"></app-stat-card>
      <app-stat-card label="Disponibles" [value]="disponibles" icon="check_circle" color="yellow" [subtitle]="indisponibles + ' indisponible(s)'"></app-stat-card>
      <app-stat-card label="Performance moy." [value]="perfMoyenne + '%'" icon="trending_up" color="purple"></app-stat-card>
    </div>

    <!-- Équipes cards -->
    <div *ngIf="loading"><app-loading-skeleton [rows]="3"></app-loading-skeleton></div>
    <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      <div *ngFor="let eq of equipes; trackBy: trackById" class="card p-5 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" [style.background]="eq.couleur">
              {{ eq.nom.charAt(0) }}
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">{{ eq.nom }}</h3>
              <p class="text-xs text-gray-500">{{ eq.zone }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-xs text-gray-500 mr-1">{{ eq.membres.length }} membres</span>
            <button (click)="openEditEquipe(eq)" class="text-gray-500 hover:text-primary-600 transition-colors" title="Éditer" [attr.aria-label]="'Éditer l\\'équipe ' + eq.nom">
              <span class="material-icons text-[16px]" aria-hidden="true">edit</span>
            </button>
            <button (click)="deleteEquipe(eq)" class="text-gray-500 hover:text-red-600 transition-colors" title="Supprimer" [attr.aria-label]="'Supprimer l\\'équipe ' + eq.nom">
              <span class="material-icons text-[16px]" aria-hidden="true">delete</span>
            </button>
          </div>
        </div>

        <!-- Chef -->
        <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 mb-3">
          <span class="material-icons text-[14px] text-gray-500" aria-hidden="true">star</span>
          <span class="text-xs text-gray-600">Chef :</span>
          <span class="text-xs font-semibold text-gray-900">{{ getMembreNom(eq.chefId) }}</span>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <p class="text-xs text-gray-500">Tâches en cours</p>
            <p class="text-lg font-bold text-gray-900">{{ eq.tachesEnCours }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Performance</p>
            <div class="flex items-center gap-2">
              <p class="text-lg font-bold" [class.text-green-600]="(eq.performanceScore || 0) >= 80"
                [class.text-yellow-600]="(eq.performanceScore || 0) >= 60 && (eq.performanceScore || 0) < 80"
                [class.text-red-600]="(eq.performanceScore || 0) < 60">{{ eq.performanceScore || 0 }}%</p>
            </div>
            <div class="bg-gray-100 rounded-full h-1.5 mt-1">
              <div class="h-1.5 rounded-full transition-all"
                [style.width]="(eq.performanceScore || 0) + '%'"
                [class.bg-green-500]="(eq.performanceScore || 0) >= 80"
                [class.bg-yellow-500]="(eq.performanceScore || 0) >= 60 && (eq.performanceScore || 0) < 80"
                [class.bg-red-500]="(eq.performanceScore || 0) < 60"></div>
            </div>
          </div>
        </div>

        <!-- Membres avatars -->
        <div class="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
          <div *ngFor="let mid of eq.membres" class="flex-shrink-0">
            <app-avatar [nom]="getMembreObj(mid)?.nom || ''" [prenom]="getMembreObj(mid)?.prenom || ''" size="sm"></app-avatar>
          </div>
        </div>
      </div>
    </div>

    <!-- Planning semaine -->
    <div *ngIf="!loading" class="card overflow-hidden mb-6">
      <div class="px-5 py-4 border-b border-gray-100">
        <h3 class="text-sm font-semibold text-gray-900">Planning de la semaine</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="table-header w-40">Membre</th>
              <th *ngFor="let j of joursSemaine; let i = index" class="table-header text-center">
                {{ j }}<br/><span class="font-normal text-gray-500">{{ semaineJours[i] | date:'dd/MM' }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of membres; trackBy: trackById" class="table-row">
              <td class="table-cell">
                <div class="flex items-center gap-2">
                  <app-avatar [nom]="m.nom" [prenom]="m.prenom" size="sm"></app-avatar>
                  <span class="text-xs font-medium text-gray-900">{{ m.prenom }} {{ m.nom }}</span>
                </div>
              </td>
              <td *ngFor="let jour of semaineJours" class="table-cell p-1 align-top">
                <div class="space-y-1">
                  <div *ngFor="let t of getTachesForMemberDay(m.id, jour)"
                    class="text-[10px] rounded px-1.5 py-0.5 truncate"
                    [class.bg-red-100]="t.priorite === 'urgent'" [class.text-red-800]="t.priorite === 'urgent'"
                    [class.bg-orange-100]="t.priorite === 'haute'" [class.text-orange-800]="t.priorite === 'haute'"
                    [class.bg-blue-100]="t.priorite === 'normale'" [class.text-blue-800]="t.priorite === 'normale'"
                    [class.bg-gray-100]="t.priorite === 'basse'" [class.text-gray-700]="t.priorite === 'basse'"
                    [title]="t.titre">{{ t.titre }}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Table membres -->
    <div class="card overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-900">Tous les membres</h3>
        <span class="text-xs text-gray-500">{{ membres.length }} personnes</span>
      </div>
      <div *ngIf="loading"><app-loading-skeleton [rows]="5"></app-loading-skeleton></div>
      <div *ngIf="!loading" class="overflow-x-auto">
      <table class="w-full min-w-[800px]">
        <thead>
          <tr class="bg-gray-50">
            <th class="table-header">Membre</th>
            <th class="table-header">Rôle</th>
            <th class="table-header">Équipe</th>
            <th class="table-header">Téléphone</th>
            <th class="table-header">Disponibilité</th>
            <th class="table-header">Tâches</th>
            <th class="table-header">Performance</th>
            <th class="table-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let m of membres; trackBy: trackById" class="table-row">
            <td class="table-cell">
              <div class="flex items-center gap-3">
                <app-avatar [nom]="m.nom" [prenom]="m.prenom" size="sm"></app-avatar>
                <div>
                  <p class="font-medium text-gray-900 text-sm">{{ m.prenom }} {{ m.nom }}</p>
                  <p class="text-xs text-gray-500">{{ m.id }}</p>
                </div>
              </div>
            </td>
            <td class="table-cell">
              <span class="inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5"
                [class.bg-purple-100]="m.role === 'chef_equipe'" [class.text-purple-800]="m.role === 'chef_equipe'"
                [class.bg-blue-100]="m.role === 'technicien'" [class.text-blue-800]="m.role === 'technicien'"
                [class.bg-green-100]="m.role === 'applicateur'" [class.text-green-800]="m.role === 'applicateur'"
                [class.bg-gray-100]="m.role === 'ouvrier'" [class.text-gray-700]="m.role === 'ouvrier'"
              >{{ roleLabel(m.role) }}</span>
            </td>
            <td class="table-cell">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full" [style.background]="getEquipeCouleur(m.equipeId)"></div>
                <span class="text-sm">{{ getEquipeNom(m.equipeId) }}</span>
              </div>
            </td>
            <td class="table-cell text-xs text-gray-500">{{ m.telephone }}</td>
            <td class="table-cell">
              <span class="inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-0.5"
                [class.bg-green-100]="m.disponible" [class.text-green-800]="m.disponible"
                [class.bg-gray-100]="!m.disponible" [class.text-gray-600]="!m.disponible">
                <span class="w-1.5 h-1.5 rounded-full" [class.bg-green-500]="m.disponible" [class.bg-gray-400]="!m.disponible"></span>
                {{ m.disponible ? 'Disponible' : 'Indisponible' }}
              </span>
            </td>
            <td class="table-cell text-center">
              <span class="text-sm font-semibold text-gray-900">{{ m.tachesEnCours }}</span>
            </td>
            <td class="table-cell" style="min-width: 120px;">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div class="h-1.5 rounded-full"
                    [style.width]="(m.performanceScore || 0) + '%'"
                    [class.bg-green-500]="(m.performanceScore || 0) >= 80"
                    [class.bg-yellow-500]="(m.performanceScore || 0) >= 60 && (m.performanceScore || 0) < 80"
                    [class.bg-red-500]="(m.performanceScore || 0) < 60"></div>
                </div>
                <span class="text-xs font-medium text-gray-600">{{ m.performanceScore || 0 }}%</span>
              </div>
            </td>
            <td class="table-cell">
              <div class="flex items-center gap-1">
                <button (click)="openEditMembre(m)" class="text-gray-500 hover:text-primary-600 transition-colors" title="Éditer" [attr.aria-label]="'Éditer le membre ' + m.prenom + ' ' + m.nom">
                  <span class="material-icons text-[16px]" aria-hidden="true">edit</span>
                </button>
                <button (click)="deleteMembre(m)" class="text-gray-500 hover:text-red-600 transition-colors" title="Supprimer" [attr.aria-label]="'Supprimer le membre ' + m.prenom + ' ' + m.nom">
                  <span class="material-icons text-[16px]" aria-hidden="true">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  `,
})
export class EquipesComponent implements OnInit {
  loading = true;
  equipes: Equipe[] = [];
  membres: Membre[] = [];
  taches: Tache[] = [];
  disponibles = 0;
  indisponibles = 0;
  perfMoyenne = 0;

  joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  semaineJours: Date[] = [];

  private membresMap = new Map<string, Membre>();
  private equipesMap = new Map<string, Equipe>();

  constructor(
    private equipeService: EquipeService,
    private membreService: MembreService,
    private tacheService: TacheService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.buildSemaine();
    forkJoin({
      equipes: this.equipeService.getAll().pipe(take(1)),
      membres: this.membreService.getAll().pipe(take(1)),
      taches: this.tacheService.getAll().pipe(take(1)),
    }).subscribe(data => {
      this.equipes = data.equipes;
      this.membres = data.membres;
      this.taches = data.taches;
      this.disponibles = data.membres.filter(m => m.disponible).length;
      this.indisponibles = data.membres.length - this.disponibles;
      this.perfMoyenne = data.membres.length ? Math.round(data.membres.reduce((s, m) => s + (m.performanceScore || 0), 0) / data.membres.length) : 0;
      this.membresMap.clear();
      this.equipesMap.clear();
      data.membres.forEach(m => this.membresMap.set(m.id, m));
      data.equipes.forEach(e => this.equipesMap.set(e.id, e));
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  private buildSemaine(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    this.semaineJours = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }

  getTachesForMemberDay(membreId: string, day: Date): Tache[] {
    const membre = this.membresMap.get(membreId);
    if (!membre) return [];
    return this.taches.filter(t => {
      if (t.equipeId !== membre.equipeId) return false;
      const start = new Date(t.dateDebut);
      const end = new Date(t.dateFin);
      return day >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
             day <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });
  }

  getMembreNom(id: string): string {
    if (!id) return 'Non assigné';
    const m = this.membresMap.get(id);
    return m ? `${m.prenom} ${m.nom}` : 'Non assigné';
  }

  getMembreObj(id: string): Membre | undefined {
    return this.membresMap.get(id);
  }

  getEquipeNom(id: string): string {
    return this.equipesMap.get(id)?.nom ?? id;
  }

  getEquipeCouleur(id: string): string {
    return this.equipesMap.get(id)?.couleur ?? '#9ca3af';
  }

  roleLabel(role: string): string {
    return { technicien: 'Technicien', chef_equipe: 'Chef d\'équipe', applicateur: 'Applicateur', ouvrier: 'Ouvrier' }[role] ?? role;
  }

  async openCreateEquipe(): Promise<void> {
    const { EquipeFormComponent } = await import('./equipe-form.component');
    const ref = this.dialogService.open(EquipeFormComponent, { data: {} });
    const result = await ref.afterClosed();
    if (result) this.reload();
  }

  async openEditEquipe(equipe: Equipe): Promise<void> {
    const { EquipeFormComponent } = await import('./equipe-form.component');
    const ref = this.dialogService.open(EquipeFormComponent, { data: { equipe } });
    const result = await ref.afterClosed();
    if (result) this.reload();
  }

  async deleteEquipe(equipe: Equipe): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Supprimer l\'équipe',
      message: `Êtes-vous sûr de vouloir supprimer l'équipe "${equipe.nom}" ?`,
      confirmLabel: 'Supprimer', cancelLabel: 'Annuler', confirmColor: 'danger',
    });
    if (confirmed) {
      this.equipeService.delete(equipe.id).pipe(take(1)).subscribe(() => {
        this.toastService.success(`Équipe "${equipe.nom}" supprimée`);
        this.reload();
      });
    }
  }

  async openCreateMembre(): Promise<void> {
    const { MembreFormComponent } = await import('./membre-form.component');
    const ref = this.dialogService.open(MembreFormComponent, { data: {} });
    const result = await ref.afterClosed();
    if (result) this.reload();
  }

  async openEditMembre(membre: Membre): Promise<void> {
    const { MembreFormComponent } = await import('./membre-form.component');
    const ref = this.dialogService.open(MembreFormComponent, { data: { membre } });
    const result = await ref.afterClosed();
    if (result) this.reload();
  }

  async deleteMembre(membre: Membre): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Supprimer le membre',
      message: `Êtes-vous sûr de vouloir supprimer ${membre.prenom} ${membre.nom} ?`,
      confirmLabel: 'Supprimer', cancelLabel: 'Annuler', confirmColor: 'danger',
    });
    if (confirmed) {
      this.membreService.delete(membre.id).pipe(take(1)).subscribe(() => {
        this.toastService.success(`${membre.prenom} ${membre.nom} supprimé`);
        this.reload();
      });
    }
  }

  private reload(): void {
    forkJoin({
      equipes: this.equipeService.getAll().pipe(take(1)),
      membres: this.membreService.getAll().pipe(take(1)),
      taches: this.tacheService.getAll().pipe(take(1)),
    }).subscribe(data => {
      this.equipes = data.equipes;
      this.membres = data.membres;
      this.taches = data.taches;
      this.disponibles = data.membres.filter(m => m.disponible).length;
      this.indisponibles = data.membres.length - this.disponibles;
      this.perfMoyenne = data.membres.length ? Math.round(data.membres.reduce((s, m) => s + m.performanceScore, 0) / data.membres.length) : 0;
      data.membres.forEach(m => this.membresMap.set(m.id, m));
      data.equipes.forEach(e => this.equipesMap.set(e.id, e));
      this.cdr.markForCheck();
    });
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
}
