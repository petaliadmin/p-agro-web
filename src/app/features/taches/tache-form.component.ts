import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormDialogComponent } from '../../shared/components/form-dialog.component';
import { DialogConfig, DialogRef } from '../../core/services/dialog.service';
import { TacheService } from '../../core/services/tache.service';
import { ToastService } from '../../core/services/toast.service';
import { Tache, TypeTache, PrioriteTache, StatutTache, ModeTravail } from '../../core/models/tache.model';
import { MOCK_PARCELLES } from '../../../assets/mock-data/parcelles.mock';
import { MOCK_EQUIPES, MOCK_MEMBRES } from '../../../assets/mock-data/taches.mock';
import { Membre } from '../../core/models/membre.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-tache-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-dialog
      [title]="isEdit ? 'Modifier la tâche' : 'Nouvelle tâche'"
      [subtitle]="isEdit ? 'Modifier les informations de la tâche' : 'Créer une nouvelle tâche agricole'"
      [loading]="saving"
      [submitLabel]="isEdit ? 'Mettre à jour' : 'Créer la tâche'"
      [submitDisabled]="!isFormValid()"
      (close)="onClose()"
      (submit)="onSubmit()"
      size="lg">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Titre -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
          <input type="text" [(ngModel)]="form.titre" placeholder="Ex: Traitement fongicide Parcelle Nord"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.titre.trim()"/>
          <p *ngIf="submitted && !form.titre.trim()" class="text-xs text-red-500 dark:text-red-400 mt-1">Le titre est requis</p>
        </div>

        <!-- Description -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea [(ngModel)]="form.description" rows="3" placeholder="Détails de la tâche…"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"></textarea>
        </div>

        <!-- Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
          <select [(ngModel)]="form.type"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option *ngFor="let t of types" [value]="t.value">{{ t.emoji }} {{ t.label }}</option>
          </select>
        </div>

        <!-- Priorité -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priorité</label>
          <select [(ngModel)]="form.priorite"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="urgent">Urgent</option>
            <option value="haute">Haute</option>
            <option value="normale">Normale</option>
            <option value="basse">Basse</option>
          </select>
        </div>

        <!-- Parcelle -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parcelle *</label>
          <select [(ngModel)]="form.parcelleId"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.parcelleId">
            <option value="">Sélectionner une parcelle</option>
            <option *ngFor="let p of parcelles" [value]="p.id">{{ p.nom }}</option>
          </select>
          <p *ngIf="submitted && !form.parcelleId" class="text-xs text-red-500 dark:text-red-400 mt-1">La parcelle est requise</p>
        </div>

        <!-- Équipe -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Équipe *</label>
          <select [(ngModel)]="form.equipeId"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.equipeId">
            <option value="">Sélectionner une équipe</option>
            <option *ngFor="let e of equipes" [value]="e.id">{{ e.nom }}</option>
          </select>
          <p *ngIf="submitted && !form.equipeId" class="text-xs text-red-500 dark:text-red-400 mt-1">L'équipe est requise</p>
        </div>

        <!-- Date début -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date début *</label>
          <input type="date" [(ngModel)]="form.dateDebut"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.dateDebut"/>
          <p *ngIf="submitted && !form.dateDebut" class="text-xs text-red-500 dark:text-red-400 mt-1">La date de début est requise</p>
        </div>

        <!-- Date fin -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date fin *</label>
          <input type="date" [(ngModel)]="form.dateFin"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.dateFin || submitted && datesInvalides()"/>
          <p *ngIf="submitted && !form.dateFin" class="text-xs text-red-500 dark:text-red-400 mt-1">La date de fin est requise</p>
          <p *ngIf="submitted && form.dateFin && datesInvalides()" class="text-xs text-red-500 dark:text-red-400 mt-1">La date de fin doit être après la date de début</p>
        </div>

        <!-- Statut (edit only) -->
        <div *ngIf="isEdit">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
          <select [(ngModel)]="form.statut"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="todo">À faire</option>
            <option value="en_cours">En cours</option>
            <option value="done">Terminé</option>
            <option value="reporte">Reporté</option>
          </select>
        </div>

        <!-- Progression -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Progression ({{ form.completionPct }}%)</label>
          <input type="range" [(ngModel)]="form.completionPct" min="0" max="100" step="5"
            class="w-full accent-primary-600"/>
        </div>

        <!-- Mode de travail -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mode de travail</label>
          <select [(ngModel)]="form.modeTravail"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="">Non spécifié</option>
            <option value="manuel">Manuel</option>
            <option value="tracteur">Tracteur</option>
            <option value="traction_animale">Traction animale</option>
          </select>
        </div>

        <!-- Main d'oeuvre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Main-d'oeuvre (nb personnes)</label>
          <input type="number" [(ngModel)]="form.mainOeuvre" (ngModelChange)="autoCalculCout()" min="0" step="1" placeholder="Ex: 5"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-gray-700 dark:text-gray-100"/>
        </div>

        <!-- Coût main d'oeuvre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coût main-d'oeuvre (FCFA)</label>
          <div class="flex gap-2">
            <input type="number" [(ngModel)]="form.coutMainOeuvre" min="0" step="500" placeholder="Ex: 15000"
              class="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-gray-700 dark:text-gray-100"/>
            <button type="button" (click)="autoCalculCout()" title="Calculer automatiquement"
              class="px-2.5 py-2 text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors flex items-center gap-1">
              <span class="material-icons text-[14px]" aria-hidden="true">calculate</span>
            </button>
          </div>
          <p *ngIf="coutEstimeInfo" class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ coutEstimeInfo }}</p>
        </div>

        <!-- Ressources -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ressources nécessaires</label>
          <input type="text" [(ngModel)]="ressourcesInput" placeholder="Séparer par des virgules : Produit A, Outil B, …"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Séparez les ressources par des virgules</p>
        </div>
      </div>
    </app-form-dialog>
  `,
})
export class TacheFormComponent implements OnInit {
  dialogConfig!: DialogConfig;
  dialogRef?: DialogRef;

  saving = false;
  submitted = false;
  parcelles = MOCK_PARCELLES;
  equipes = MOCK_EQUIPES;
  membres = MOCK_MEMBRES;
  ressourcesInput = '';
  coutEstimeInfo = '';

  types = [
    { value: 'preparation_sol', label: 'Préparation sol', emoji: '⛏️' },
    { value: 'labour', label: 'Labour', emoji: '🚜' },
    { value: 'billonnage', label: 'Billonnage', emoji: '🏗️' },
    { value: 'semis', label: 'Semis', emoji: '🌱' },
    { value: 'irrigation', label: 'Irrigation', emoji: '💧' },
    { value: 'sarclage', label: 'Sarclage', emoji: '🪴' },
    { value: 'buttage', label: 'Buttage', emoji: '🏔️' },
    { value: 'fertilisation', label: 'Fertilisation', emoji: '🌿' },
    { value: 'desherbage', label: 'Désherbage', emoji: '✂️' },
    { value: 'traitement', label: 'Traitement', emoji: '🧪' },
    { value: 'recolte', label: 'Récolte', emoji: '🌾' },
    { value: 'inspection', label: 'Inspection', emoji: '🔍' },
  ];

  form = {
    titre: '',
    description: '',
    type: 'traitement' as TypeTache,
    priorite: 'normale' as PrioriteTache,
    statut: 'todo' as StatutTache,
    parcelleId: '',
    equipeId: '',
    dateDebut: '',
    dateFin: '',
    completionPct: 0,
    modeTravail: '' as ModeTravail | '',
    mainOeuvre: 0,
    coutMainOeuvre: 0,
  };

  get isEdit(): boolean {
    return !!this.dialogConfig?.data?.tache;
  }

  constructor(
    private tacheService: TacheService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.dialogConfig?.data?.tache) {
      const t: Tache = this.dialogConfig.data.tache;
      this.form = {
        titre: t.titre,
        description: t.description,
        type: t.type,
        priorite: t.priorite,
        statut: t.statut,
        parcelleId: t.parcelleId,
        equipeId: t.equipeId,
        dateDebut: this.toDateStr(new Date(t.dateDebut)),
        dateFin: this.toDateStr(new Date(t.dateFin)),
        completionPct: t.completionPct,
        modeTravail: t.modeTravail || '',
        mainOeuvre: t.mainOeuvre || 0,
        coutMainOeuvre: t.coutMainOeuvre || 0,
      };
      this.ressourcesInput = t.ressources.join(', ');
    } else {
      const today = this.toDateStr(new Date());
      const nextWeek = this.toDateStr(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      this.form.dateDebut = today;
      this.form.dateFin = nextWeek;
    }
  }

  private toDateStr(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  datesInvalides(): boolean {
    return this.form.dateDebut && this.form.dateFin ? this.form.dateFin < this.form.dateDebut : false;
  }

  isFormValid(): boolean {
    return (
      this.form.titre.trim().length > 0 &&
      this.form.parcelleId.length > 0 &&
      this.form.equipeId.length > 0 &&
      this.form.dateDebut.length > 0 &&
      this.form.dateFin.length > 0 &&
      !this.datesInvalides()
    );
  }

  autoCalculCout(): void {
    if (!this.form.mainOeuvre || this.form.mainOeuvre <= 0 || !this.form.equipeId || !this.form.dateDebut || !this.form.dateFin) {
      this.coutEstimeInfo = '';
      return;
    }
    // Get average daily cost of members in selected team
    const equipe = this.equipes.find(e => e.id === this.form.equipeId);
    if (!equipe) return;
    const membresEquipe = this.membres.filter(m => equipe.membres.includes(m.id) && m.coutJournalier);
    if (membresEquipe.length === 0) return;

    const coutMoyen = Math.round(membresEquipe.reduce((s, m) => s + (m.coutJournalier || 0), 0) / membresEquipe.length);
    const d1 = new Date(this.form.dateDebut);
    const d2 = new Date(this.form.dateFin);
    const dureeJours = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000)));

    const coutEstime = this.form.mainOeuvre * coutMoyen * dureeJours;
    this.form.coutMainOeuvre = coutEstime;
    this.coutEstimeInfo = `${this.form.mainOeuvre} pers. × ${coutMoyen} FCFA/j × ${dureeJours} j = ${coutEstime.toLocaleString('fr-FR')} FCFA`;
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.isFormValid()) {
      this.cdr.markForCheck();
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    const tacheData = {
      titre: this.form.titre.trim(),
      description: this.form.description.trim(),
      type: this.form.type,
      priorite: this.form.priorite,
      statut: this.form.statut,
      parcelleId: this.form.parcelleId,
      equipeId: this.form.equipeId,
      dateDebut: new Date(this.form.dateDebut),
      dateFin: new Date(this.form.dateFin),
      completionPct: this.form.completionPct,
      ressources: this.ressourcesInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      modeTravail: (this.form.modeTravail as ModeTravail) || undefined,
      mainOeuvre: this.form.mainOeuvre || undefined,
      coutMainOeuvre: this.form.coutMainOeuvre || undefined,
    };

    if (this.isEdit) {
      const id = this.dialogConfig.data.tache.id;
      this.tacheService.update(id, tacheData).pipe(take(1)).subscribe({
        next: (updated) => {
          this.toastService.success(`Tâche "${updated.titre}" mise à jour`);
          this.dialogRef?.close(updated);
        },
        error: () => {
          this.toastService.error('Erreur lors de la mise à jour');
          this.saving = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      this.tacheService.create(tacheData).pipe(take(1)).subscribe({
        next: (created) => {
          this.toastService.success(`Tâche "${created.titre}" créée`);
          this.dialogRef?.close(created);
        },
        error: () => {
          this.toastService.error('Erreur lors de la création');
          this.saving = false;
          this.cdr.markForCheck();
        },
      });
    }
  }

  onClose(): void {
    this.dialogRef?.close(undefined);
  }
}
