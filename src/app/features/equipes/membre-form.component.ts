import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormDialogComponent } from '../../shared/components/form-dialog.component';
import { DialogConfig, DialogRef } from '../../core/services/dialog.service';
import { EquipeService, MembreService } from '../../core/services/equipe.service';
import { ToastService } from '../../core/services/toast.service';
import { Equipe, Membre, RoleMembre, TypeMainOeuvre } from '../../core/models/membre.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-membre-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-dialog
      [title]="isEdit ? 'Modifier le membre' : 'Nouveau membre'"
      [subtitle]="isEdit ? 'Modifier les informations du membre' : 'Ajouter un nouveau membre à une équipe'"
      [loading]="saving"
      [submitLabel]="isEdit ? 'Mettre à jour' : 'Ajouter le membre'"
      [submitDisabled]="!isFormValid()"
      (close)="onClose()"
      (submit)="onSubmit()"
      size="md">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom *</label>
          <input type="text" [(ngModel)]="form.prenom" placeholder="Ex: Mamadou"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.prenom.trim()"/>
          <p *ngIf="submitted && !form.prenom.trim()" class="text-xs text-red-500 dark:text-red-400 mt-1">Le prénom est requis</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
          <input type="text" [(ngModel)]="form.nom" placeholder="Ex: Diallo"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.nom.trim()"/>
          <p *ngIf="submitted && !form.nom.trim()" class="text-xs text-red-500 dark:text-red-400 mt-1">Le nom est requis</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle *</label>
          <select [(ngModel)]="form.role"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="technicien">Technicien</option>
            <option value="chef_equipe">Chef d'équipe</option>
            <option value="applicateur">Applicateur</option>
            <option value="ouvrier">Ouvrier</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone *</label>
          <input type="tel" [(ngModel)]="form.telephone" placeholder="+221 77 123 45 67"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !isTelValid()"/>
          <p *ngIf="submitted && !isTelValid()" class="text-xs text-red-500 dark:text-red-400 mt-1">Format : +221 XX XXX XX XX</p>
        </div>

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

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type main-d'œuvre</label>
          <select [(ngModel)]="form.typeMainOeuvre"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="">Non spécifié</option>
            <option value="familial">Familial</option>
            <option value="journalier">Journalier</option>
            <option value="groupement">Groupement</option>
            <option value="permanent">Permanent</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coût journalier (FCFA)</label>
          <input type="number" [(ngModel)]="form.coutJournalier" min="0" step="500" placeholder="Ex: 3500"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Journalier : 3 000-5 000 FCFA · Permanent : 7 500-10 000 FCFA</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Disponibilité</label>
          <label class="flex items-center gap-2 cursor-pointer mt-2">
            <input type="checkbox" [(ngModel)]="form.disponible" class="rounded border-gray-300 text-primary-600 focus:ring-primary-400"/>
            <span class="text-sm text-gray-700 dark:text-gray-300">Disponible</span>
          </label>
        </div>
      </div>
    </app-form-dialog>
  `,
})
export class MembreFormComponent implements OnInit {
  dialogConfig!: DialogConfig;
  dialogRef?: DialogRef;
  saving = false;
  submitted = false;
  equipes: Equipe[] = [];

  form = {
    prenom: '',
    nom: '',
    role: 'technicien' as RoleMembre,
    telephone: '+221 ',
    equipeId: '',
    disponible: true,
    typeMainOeuvre: '' as TypeMainOeuvre | '',
    coutJournalier: null as number | null,
  };

  get isEdit(): boolean { return !!this.dialogConfig?.data?.membre; }

  constructor(
    private equipeService: EquipeService,
    private membreService: MembreService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.equipeService.getAll().pipe(take(1)).subscribe(e => {
      this.equipes = e;
      this.cdr.markForCheck();
    });

    if (this.dialogConfig?.data?.membre) {
      const m: Membre = this.dialogConfig.data.membre;
      this.form = {
        prenom: m.prenom,
        nom: m.nom,
        role: m.role,
        telephone: m.telephone,
        equipeId: m.equipeId,
        disponible: m.disponible,
        typeMainOeuvre: m.typeMainOeuvre || '',
        coutJournalier: m.coutJournalier ?? null,
      };
    }

    if (this.dialogConfig?.data?.equipeId) {
      this.form.equipeId = this.dialogConfig.data.equipeId;
    }
  }

  isTelValid(): boolean {
    return /^\+221\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(this.form.telephone.trim());
  }

  isFormValid(): boolean {
    return (
      this.form.prenom.trim().length > 0 &&
      this.form.nom.trim().length > 0 &&
      this.form.equipeId.length > 0 &&
      this.isTelValid()
    );
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.isFormValid()) { this.cdr.markForCheck(); return; }
    this.saving = true;
    this.cdr.markForCheck();

    const data = {
      prenom: this.form.prenom.trim(),
      nom: this.form.nom.trim(),
      role: this.form.role,
      telephone: this.form.telephone.trim(),
      equipeId: this.form.equipeId,
      disponible: this.form.disponible,
      tachesEnCours: this.isEdit ? this.dialogConfig.data.membre.tachesEnCours : 0,
      performanceScore: this.isEdit ? this.dialogConfig.data.membre.performanceScore : 0,
    };

    if (this.isEdit) {
      this.membreService.update(this.dialogConfig.data.membre.id, data).pipe(take(1)).subscribe({
        next: (u) => { this.toastService.success(`${u.prenom} ${u.nom} mis à jour`); this.dialogRef?.close(u); },
        error: () => { this.toastService.error('Erreur'); this.saving = false; this.cdr.markForCheck(); },
      });
    } else {
      this.membreService.create(data).pipe(take(1)).subscribe({
        next: (c) => { this.toastService.success(`${c.prenom} ${c.nom} ajouté`); this.dialogRef?.close(c); },
        error: () => { this.toastService.error('Erreur'); this.saving = false; this.cdr.markForCheck(); },
      });
    }
  }

  onClose(): void { this.dialogRef?.close(undefined); }
}
