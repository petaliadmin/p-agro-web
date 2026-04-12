import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormDialogComponent } from '../../shared/components/form-dialog.component';
import { DialogConfig, DialogRef } from '../../core/services/dialog.service';
import { EquipeService, MembreService } from '../../core/services/equipe.service';
import { ToastService } from '../../core/services/toast.service';
import { Equipe, Membre } from '../../core/models/membre.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-equipe-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-dialog
      [title]="isEdit ? 'Modifier l\\'équipe' : 'Nouvelle équipe'"
      [subtitle]="isEdit ? 'Modifier les informations de l\\'équipe' : 'Créer une nouvelle équipe terrain'"
      [loading]="saving"
      [submitLabel]="isEdit ? 'Mettre à jour' : 'Créer l\\'équipe'"
      [submitDisabled]="!isFormValid()"
      (close)="onClose()"
      (submit)="onSubmit()"
      size="md">

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'équipe *</label>
          <input type="text" [(ngModel)]="form.nom" placeholder="Ex: Équipe Fleuve Nord"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.nom.trim()"/>
          <p *ngIf="submitted && !form.nom.trim()" class="text-xs text-red-500 mt-1">Le nom est requis</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Zone *</label>
          <input type="text" [(ngModel)]="form.zone" placeholder="Ex: Vallée du Fleuve Sénégal"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.zone.trim()"/>
          <p *ngIf="submitted && !form.zone.trim()" class="text-xs text-red-500 mt-1">La zone est requise</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
            <input type="color" [(ngModel)]="form.couleur" class="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Chef d'équipe</label>
            <select [(ngModel)]="form.chefId"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="">Non assigné</option>
              <option *ngFor="let m of allMembres" [value]="m.id">{{ m.prenom }} {{ m.nom }}</option>
            </select>
          </div>
        </div>
      </div>
    </app-form-dialog>
  `,
})
export class EquipeFormComponent implements OnInit {
  dialogConfig!: DialogConfig;
  dialogRef?: DialogRef;
  saving = false;
  submitted = false;
  allMembres: Membre[] = [];

  form = { nom: '', zone: '', couleur: '#1A7A4A', chefId: '' };

  get isEdit(): boolean { return !!this.dialogConfig?.data?.equipe; }

  constructor(
    private equipeService: EquipeService,
    private membreService: MembreService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.membreService.getAll().pipe(take(1)).subscribe(m => {
      this.allMembres = m;
      this.cdr.markForCheck();
    });

    if (this.dialogConfig?.data?.equipe) {
      const e: Equipe = this.dialogConfig.data.equipe;
      this.form = { nom: e.nom, zone: e.zone, couleur: e.couleur, chefId: e.chefId };
    }
  }

  isFormValid(): boolean {
    return this.form.nom.trim().length > 0 && this.form.zone.trim().length > 0;
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.isFormValid()) { this.cdr.markForCheck(); return; }
    this.saving = true;
    this.cdr.markForCheck();

    const data = {
      nom: this.form.nom.trim(),
      zone: this.form.zone.trim(),
      couleur: this.form.couleur,
      chefId: this.form.chefId,
      membres: this.isEdit ? this.dialogConfig.data.equipe.membres : [],
      tachesEnCours: this.isEdit ? this.dialogConfig.data.equipe.tachesEnCours : 0,
      performanceScore: this.isEdit ? this.dialogConfig.data.equipe.performanceScore : 0,
    };

    if (this.isEdit) {
      this.equipeService.update(this.dialogConfig.data.equipe.id, data).pipe(take(1)).subscribe({
        next: (u) => { this.toastService.success(`Équipe "${u.nom}" mise à jour`); this.dialogRef?.close(u); },
        error: () => { this.toastService.error('Erreur'); this.saving = false; this.cdr.markForCheck(); },
      });
    } else {
      this.equipeService.create(data).pipe(take(1)).subscribe({
        next: (c) => { this.toastService.success(`Équipe "${c.nom}" créée`); this.dialogRef?.close(c); },
        error: () => { this.toastService.error('Erreur'); this.saving = false; this.cdr.markForCheck(); },
      });
    }
  }

  onClose(): void { this.dialogRef?.close(undefined); }
}
