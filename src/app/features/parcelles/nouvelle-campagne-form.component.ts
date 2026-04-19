import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormDialogComponent } from '../../shared/components/form-dialog.component';
import { DialogRef } from '../../core/services/dialog.service';
import { CultureType, TypeCampagne } from '../../core/models/parcelle.model';

@Component({
  selector: 'app-nouvelle-campagne-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-dialog
      title="Nouvelle campagne"
      subtitle="Programmer ou lancer une campagne sur cette parcelle"
      [loading]="false"
      [submitLabel]="form.planifiee ? 'Programmer' : 'Lancer la campagne'"
      [submitDisabled]="!isFormValid()"
      (close)="onClose()"
      (submit)="onSubmit()">

      <div class="space-y-4">
        <!-- Culture -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Culture *</label>
          <select [(ngModel)]="form.culture"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.culture">
            <option value="">Selectionner une culture</option>
            <option *ngFor="let c of cultures" [value]="c.value">{{ c.label }}</option>
          </select>
          <p *ngIf="submitted && !form.culture" class="text-xs text-red-500 dark:text-red-400 mt-1">La culture est requise</p>
        </div>

        <!-- Variété -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Variete</label>
          <input type="text" [(ngModel)]="form.variete" placeholder="Ex: Sahel 108, 55-437..."
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Type de campagne -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de campagne *</label>
            <select [(ngModel)]="form.typeCampagne"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="hivernage">Hivernage</option>
              <option value="contre_saison_froide">Contre-saison froide</option>
              <option value="contre_saison_chaude">Contre-saison chaude</option>
            </select>
          </div>

          <!-- Date de semis -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de semis prevue *</label>
            <input type="date" [(ngModel)]="form.dateSemisStr"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="submitted && !form.dateSemisStr">
            <p *ngIf="submitted && !form.dateSemisStr" class="text-xs text-red-500 dark:text-red-400 mt-1">La date est requise</p>
          </div>
        </div>

        <!-- Mode : lancer / programmer -->
        <div class="pt-2 border-t border-gray-100 dark:border-gray-700">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mode de lancement</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors"
              [ngClass]="!form.planifiee ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600'">
              <input type="radio" name="mode" [value]="false" [(ngModel)]="form.planifiee"
                class="text-primary-600 focus:ring-primary-500">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Lancer maintenant</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Demarrer immediatement</p>
              </div>
            </label>
            <label class="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors"
              [ngClass]="form.planifiee ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600'">
              <input type="radio" name="mode" [value]="true" [(ngModel)]="form.planifiee"
                class="text-primary-600 focus:ring-primary-500">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Programmer</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Planifier pour plus tard</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </app-form-dialog>
  `,
})
export class NouvelleCampagneFormComponent implements OnInit {
  dialogRef!: DialogRef;
  dialogConfig: any = {};

  submitted = false;

  cultures = [
    { value: 'riz', label: 'Riz' },
    { value: 'arachide', label: 'Arachide' },
    { value: 'mais', label: 'Mais' },
    { value: 'mil', label: 'Mil' },
    { value: 'oignon', label: 'Oignon' },
    { value: 'tomate', label: 'Tomate' },
  ];

  form = {
    culture: '' as CultureType | '',
    variete: '',
    typeCampagne: 'hivernage' as TypeCampagne,
    dateSemisStr: '',
    planifiee: false,
  };

  ngOnInit(): void {
    const data = this.dialogConfig?.data;
    if (data?.suggestedCulture) this.form.culture = data.suggestedCulture;
    if (data?.typeCampagne) this.form.typeCampagne = data.typeCampagne;
  }

  isFormValid(): boolean {
    return !!this.form.culture && !!this.form.dateSemisStr;
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.isFormValid()) return;
    this.dialogRef.close({
      action: 'create',
      culture: this.form.culture as CultureType,
      variete: this.form.variete || undefined,
      typeCampagne: this.form.typeCampagne,
      dateSemis: new Date(this.form.dateSemisStr),
      planifiee: this.form.planifiee,
    });
  }

  onClose(): void {
    this.dialogRef.close(undefined);
  }
}
