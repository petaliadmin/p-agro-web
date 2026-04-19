import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormDialogComponent } from '../../shared/components/form-dialog.component';
import { DialogRef } from '../../core/services/dialog.service';
import { Campagne } from '../../core/models/campagne.model';

@Component({
  selector: 'app-cloture-campagne-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-dialog
      title="Cloturer la campagne"
      subtitle="Terminer la campagne en cours et enregistrer le bilan"
      [loading]="false"
      submitLabel="Cloturer"
      [submitDisabled]="!isFormValid()"
      (close)="onClose()"
      (submit)="onSubmit()">

      <!-- Résumé campagne -->
      <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4">
        <div class="flex items-center gap-2 text-sm">
          <span class="material-icons text-amber-600 text-[16px]">info</span>
          <span class="text-amber-800 dark:text-amber-200 font-medium capitalize">{{ campagne?.culture }}</span>
          <span *ngIf="campagne?.variete" class="text-amber-600 dark:text-amber-300 text-xs">({{ campagne?.variete }})</span>
          <span class="text-amber-500 dark:text-amber-400 text-xs ml-auto">Progression : {{ campagne?.progressionPct }}%</span>
        </div>
      </div>

      <div class="space-y-4">
        <!-- Date de clôture -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de cloture *</label>
          <input type="date" [(ngModel)]="form.dateFinStr"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
        </div>

        <!-- Rendement final -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rendement final (t/ha)</label>
          <input type="number" [(ngModel)]="form.rendementFinal" step="0.1" min="0" placeholder="Ex: 4.5"
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
        </div>

        <!-- Observations -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observations / Bilan</label>
          <textarea [(ngModel)]="form.observationsCloture" rows="3"
            placeholder="Bilan de la campagne, remarques, problemes rencontres..."
            class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"></textarea>
        </div>

        <!-- Programmer nouvelle campagne -->
        <div class="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <input type="checkbox" id="programmerNouvelle" [(ngModel)]="form.programmerNouvelle"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
          <label for="programmerNouvelle" class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            Programmer une nouvelle campagne ensuite
          </label>
        </div>
      </div>
    </app-form-dialog>
  `,
})
export class ClotureCampagneFormComponent implements OnInit {
  dialogRef!: DialogRef;
  dialogConfig: any = {};

  campagne: Campagne | null = null;

  form = {
    dateFinStr: new Date().toISOString().slice(0, 10),
    rendementFinal: null as number | null,
    observationsCloture: '',
    programmerNouvelle: false,
  };

  ngOnInit(): void {
    this.campagne = this.dialogConfig?.data?.campagne || null;
  }

  isFormValid(): boolean {
    return !!this.form.dateFinStr;
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;
    this.dialogRef.close({
      action: 'cloture',
      dateFin: new Date(this.form.dateFinStr),
      rendementFinal: this.form.rendementFinal || undefined,
      observationsCloture: this.form.observationsCloture || undefined,
      programmerNouvelle: this.form.programmerNouvelle,
    });
  }

  onClose(): void {
    this.dialogRef.close(undefined);
  }
}
