import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormDialogComponent } from '../../shared/components/form-dialog.component';
import { DialogConfig, DialogRef } from '../../core/services/dialog.service';
import { IntrantService } from '../../core/services/intrant.service';
import { ToastService } from '../../core/services/toast.service';
import { Intrant, TypeIntrant, UniteIntrant, OrigineIntrant } from '../../core/models/intrant.model';
import { CultureType } from '../../core/models/parcelle.model';
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

      <!-- Section Produit -->
      <div class="mb-5">
        <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span class="material-icons text-[14px]" aria-hidden="true">inventory_2</span> Produit
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du produit *</label>
            <input type="text" [(ngModel)]="form.nom" placeholder="Ex: NPK 15-15-15"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="submitted && !form.nom.trim()"/>
            <p *ngIf="submitted && !form.nom.trim()" class="text-xs text-red-500 dark:text-red-400 mt-1">Le nom est requis</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
            <select [(ngModel)]="form.type"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="semence">🌱 Semence</option>
              <option value="engrais">🌿 Engrais</option>
              <option value="pesticide">🧪 Pesticide</option>
              <option value="herbicide">🌿 Herbicide</option>
              <option value="fongicide">🍄 Fongicide</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origine</label>
            <select [(ngModel)]="form.origine"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="">Non renseignée</option>
              <option value="marche">Marché</option>
              <option value="subvention">Subvention État</option>
              <option value="stock_personnel">Stock personnel</option>
              <option value="cooperatif">Coopérative</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fournisseur</label>
            <input type="text" [(ngModel)]="form.fournisseur" placeholder="Ex: SENCHIM Dakar"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
        </div>
      </div>

      <!-- Section Stock -->
      <div class="mb-5">
        <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span class="material-icons text-[14px]" aria-hidden="true">warehouse</span> Stock & Prix
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantité en stock *</label>
            <input type="number" [(ngModel)]="form.quantiteStock" min="0" step="1"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="submitted && form.quantiteStock < 0"/>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unité *</label>
            <select [(ngModel)]="form.unite"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="kg">kg</option>
              <option value="L">L</option>
              <option value="sac">sac</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seuil d'alerte *</label>
            <input type="number" [(ngModel)]="form.seuilAlerte" min="1" step="1"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="submitted && form.seuilAlerte <= 0"/>
            <p *ngIf="submitted && form.seuilAlerte <= 0" class="text-xs text-red-500 dark:text-red-400 mt-1">Le seuil doit être > 0</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix unitaire (FCFA)</label>
            <input type="number" [(ngModel)]="form.prixUnitaire" min="0" step="100"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'expiration *</label>
            <input type="date" [(ngModel)]="form.dateExpiration"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary-400 hover:border-gray-300 transition-colors cursor-pointer
                     [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              [class.border-red-300]="submitted && !form.dateExpiration"/>
          </div>
        </div>
      </div>

      <!-- Section Utilisation -->
      <div class="mb-5">
        <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span class="material-icons text-[14px]" aria-hidden="true">science</span> Utilisation
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dose recommandée ({{ form.unite }}/ha)</label>
            <input type="number" [(ngModel)]="form.doseRecommandee" min="0" step="0.1"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Ex: 100"/>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fréquence d'application</label>
            <input type="text" [(ngModel)]="form.frequenceApplication"
              placeholder="Ex: 2 applications à 15 jours d'intervalle"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cultures cibles</label>
            <div class="flex flex-wrap gap-2">
              <label *ngFor="let c of cultureOptions" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors"
                [ngClass]="isCultureSelected(c.value) ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600'">
                <input type="checkbox" [checked]="isCultureSelected(c.value)" (change)="toggleCulture(c.value)" class="sr-only"/>
                <span>{{ c.label }}</span>
              </label>
            </div>
          </div>
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

  cultureOptions = [
    { value: 'riz' as CultureType, label: '🌾 Riz' },
    { value: 'mais' as CultureType, label: '🌽 Maïs' },
    { value: 'mil' as CultureType, label: '🌿 Mil' },
    { value: 'arachide' as CultureType, label: '🥜 Arachide' },
    { value: 'oignon' as CultureType, label: '🧅 Oignon' },
    { value: 'tomate' as CultureType, label: '🍅 Tomate' },
  ];

  form = {
    nom: '',
    type: 'engrais' as TypeIntrant,
    quantiteStock: 0,
    unite: 'kg' as UniteIntrant,
    seuilAlerte: 10,
    dateExpiration: '',
    fournisseur: '',
    prixUnitaire: 0,
    origine: '' as OrigineIntrant | '',
    doseRecommandee: 0,
    frequenceApplication: '',
    culturesCibles: [] as CultureType[],
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
        origine: i.origine || '',
        doseRecommandee: i.doseRecommandee || 0,
        frequenceApplication: i.frequenceApplication || '',
        culturesCibles: i.culturesCibles ? [...i.culturesCibles] : [],
      };
    }
  }

  isCultureSelected(c: CultureType): boolean {
    return this.form.culturesCibles.includes(c);
  }

  toggleCulture(c: CultureType): void {
    const idx = this.form.culturesCibles.indexOf(c);
    if (idx >= 0) {
      this.form.culturesCibles.splice(idx, 1);
    } else {
      this.form.culturesCibles.push(c);
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
      origine: (this.form.origine as OrigineIntrant) || undefined,
      doseRecommandee: this.form.doseRecommandee || undefined,
      frequenceApplication: this.form.frequenceApplication || undefined,
      culturesCibles: this.form.culturesCibles.length ? this.form.culturesCibles : undefined,
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
