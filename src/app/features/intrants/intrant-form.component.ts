import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormDialogComponent } from '../../shared/components/form-dialog.component';
import { DialogConfig, DialogRef } from '../../core/services/dialog.service';
import { IntrantService } from '../../core/services/intrant.service';
import { ToastService } from '../../core/services/toast.service';
import { Intrant, TypeIntrant, UniteIntrant } from '../../core/models/intrant.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-intrant-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-dialog
      [title]="isEdit ? 'Modifier l\\'intrant' : 'Nouvel intrant'"
      [subtitle]="isEdit ? 'Modifier les informations du produit' : 'Ajouter un nouveau produit au stock'"
      [loading]="saving"
      [submitLabel]="isEdit ? 'Mettre à jour' : 'Créer l\\'intrant'"
      [submitDisabled]="!isFormValid()"
      (close)="onClose()"
      (submit)="onSubmit()"
      size="lg">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
          <input type="text" [(ngModel)]="form.nom" placeholder="Ex: NPK 15-15-15"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.nom.trim()"/>
          <p *ngIf="submitted && !form.nom.trim()" class="text-xs text-red-500 mt-1">Le nom est requis</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
          <select [(ngModel)]="form.type"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="semence">🌱 Semence</option>
            <option value="engrais">🌿 Engrais</option>
            <option value="pesticide">🧪 Pesticide</option>
            <option value="herbicide">🌿 Herbicide</option>
            <option value="fongicide">🍄 Fongicide</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Quantité en stock *</label>
          <input type="number" [(ngModel)]="form.quantiteStock" min="0" step="1"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && form.quantiteStock < 0"/>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Unité *</label>
          <select [(ngModel)]="form.unite"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="kg">kg</option>
            <option value="L">L</option>
            <option value="sac">sac</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte *</label>
          <input type="number" [(ngModel)]="form.seuilAlerte" min="1" step="1"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && form.seuilAlerte <= 0"/>
          <p *ngIf="submitted && form.seuilAlerte <= 0" class="text-xs text-red-500 mt-1">Le seuil doit être > 0</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date d'expiration *</label>
          <input type="date" [(ngModel)]="form.dateExpiration"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.dateExpiration"/>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
          <input type="text" [(ngModel)]="form.fournisseur" placeholder="Ex: SenAgri SARL"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (FCFA)</label>
          <input type="number" [(ngModel)]="form.prixUnitaire" min="0" step="100"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
        </div>
      </div>
    </app-form-dialog>
  `,
})
export class IntrantFormComponent implements OnInit {
  dialogConfig!: DialogConfig;
  dialogRef?: DialogRef;
  saving = false;
  submitted = false;

  form = {
    nom: '',
    type: 'engrais' as TypeIntrant,
    quantiteStock: 0,
    unite: 'kg' as UniteIntrant,
    seuilAlerte: 10,
    dateExpiration: '',
    fournisseur: '',
    prixUnitaire: 0,
  };

  get isEdit(): boolean { return !!this.dialogConfig?.data?.intrant; }

  constructor(
    private intrantService: IntrantService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.dialogConfig?.data?.intrant) {
      const i: Intrant = this.dialogConfig.data.intrant;
      const d = new Date(i.dateExpiration);
      const pad = (n: number) => n.toString().padStart(2, '0');
      this.form = {
        nom: i.nom,
        type: i.type,
        quantiteStock: i.quantiteStock,
        unite: i.unite,
        seuilAlerte: i.seuilAlerte,
        dateExpiration: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        fournisseur: i.fournisseur,
        prixUnitaire: i.prixUnitaire,
      };
    }
  }

  isFormValid(): boolean {
    return this.form.nom.trim().length > 0 && this.form.seuilAlerte > 0 && this.form.dateExpiration.length > 0;
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.isFormValid()) { this.cdr.markForCheck(); return; }
    this.saving = true;
    this.cdr.markForCheck();

    const data = {
      nom: this.form.nom.trim(),
      type: this.form.type,
      quantiteStock: this.form.quantiteStock,
      unite: this.form.unite,
      seuilAlerte: this.form.seuilAlerte,
      dateExpiration: new Date(this.form.dateExpiration),
      fournisseur: this.form.fournisseur,
      prixUnitaire: this.form.prixUnitaire,
    };

    if (this.isEdit) {
      this.intrantService.update(this.dialogConfig.data.intrant.id, data).pipe(take(1)).subscribe({
        next: (u) => { this.toastService.success(`"${u.nom}" mis à jour`); this.dialogRef?.close(u); },
        error: () => { this.toastService.error('Erreur'); this.saving = false; this.cdr.markForCheck(); },
      });
    } else {
      this.intrantService.create(data).pipe(take(1)).subscribe({
        next: (c) => { this.toastService.success(`"${c.nom}" ajouté au stock`); this.dialogRef?.close(c); },
        error: () => { this.toastService.error('Erreur'); this.saving = false; this.cdr.markForCheck(); },
      });
    }
  }

  onClose(): void { this.dialogRef?.close(undefined); }
}
