import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormDialogComponent } from '../../shared/components/form-dialog.component';
import { DialogConfig, DialogRef } from '../../core/services/dialog.service';
import { IntrantService } from '../../core/services/intrant.service';
import { ToastService } from '../../core/services/toast.service';
import { TypeMouvement } from '../../core/models/intrant.model';
import { MOCK_PARCELLES } from '../../../assets/mock-data/parcelles.mock';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-mouvement-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-dialog
      [title]="form.type === 'entree' ? 'Entrée de stock' : 'Sortie de stock'"
      [subtitle]="intrantNom"
      [loading]="saving"
      [submitLabel]="form.type === 'entree' ? 'Enregistrer l\\'entrée' : 'Enregistrer la sortie'"
      [submitDisabled]="!isFormValid()"
      (close)="onClose()"
      (submit)="onSubmit()"
      size="sm">

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type de mouvement</label>
          <select [(ngModel)]="form.type"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="entree">Entrée (+)</option>
            <option value="sortie">Sortie (-)</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
          <input type="number" [(ngModel)]="form.quantite" min="1" step="1"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && form.quantite <= 0"/>
          <p *ngIf="submitted && form.quantite <= 0" class="text-xs text-red-500 mt-1">La quantité doit être > 0</p>
        </div>

        <div *ngIf="form.type === 'sortie'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Parcelle destination</label>
          <select [(ngModel)]="form.parcelleId"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="">Aucune</option>
            <option *ngFor="let p of parcelles" [value]="p.id">{{ p.nom }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Motif *</label>
          <input type="text" [(ngModel)]="form.motif"
            [placeholder]="form.type === 'entree' ? 'Ex: Réapprovisionnement fournisseur' : 'Ex: Application parcelle Nord'"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.motif.trim()"/>
          <p *ngIf="submitted && !form.motif.trim()" class="text-xs text-red-500 mt-1">Le motif est requis</p>
        </div>
      </div>
    </app-form-dialog>
  `,
})
export class MouvementFormComponent implements OnInit {
  dialogConfig!: DialogConfig;
  dialogRef?: DialogRef;
  saving = false;
  submitted = false;
  intrantNom = '';
  parcelles = MOCK_PARCELLES;

  form = {
    type: 'entree' as TypeMouvement,
    quantite: 0,
    parcelleId: '',
    motif: '',
  };

  constructor(
    private intrantService: IntrantService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.dialogConfig?.data) {
      this.intrantNom = this.dialogConfig.data.intrantNom || '';
      if (this.dialogConfig.data.mouvementType) {
        this.form.type = this.dialogConfig.data.mouvementType;
      }
    }
  }

  isFormValid(): boolean {
    return this.form.quantite > 0 && this.form.motif.trim().length > 0;
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.isFormValid()) { this.cdr.markForCheck(); return; }
    this.saving = true;
    this.cdr.markForCheck();

    const intrantId = this.dialogConfig.data.intrantId;
    this.intrantService.addMouvement(intrantId, {
      date: new Date(),
      type: this.form.type,
      quantite: this.form.quantite,
      parcelleId: this.form.parcelleId || undefined,
      motif: this.form.motif.trim(),
      operateurId: 'tech001',
    }).pipe(take(1)).subscribe({
      next: (updated) => {
        const label = this.form.type === 'entree' ? 'Entrée' : 'Sortie';
        this.toastService.success(`${label} de ${this.form.quantite} enregistrée`);
        this.dialogRef?.close(updated);
      },
      error: () => {
        this.toastService.error('Erreur lors de l\'enregistrement');
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  onClose(): void { this.dialogRef?.close(undefined); }
}
