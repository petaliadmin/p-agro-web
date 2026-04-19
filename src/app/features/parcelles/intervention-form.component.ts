import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '../../core/services/dialog.service';
import {
  Intervention, TypeIntervention, StatutIntervention,
  INTERVENTION_LABELS, INTERVENTION_ICONS,
} from '../../core/models/intervention.model';
import { MOCK_MEMBRES } from '../../../assets/mock-data/taches.mock';

@Component({
  selector: 'app-intervention-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="onBackdrop($event)">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">
            {{ isEdit ? 'Modifier l\\'intervention' : isComplete ? 'Marquer terminée' : 'Nouvelle intervention' }}
          </h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <span class="material-icons text-[20px]" aria-hidden="true">close</span>
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          <!-- Mode complétion rapide -->
          <ng-container *ngIf="isComplete">
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-2">
              <p class="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                <span class="material-icons text-[16px]" aria-hidden="true">check_circle</span>
                {{ form.label }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Date de réalisation *</label>
              <input type="date" [(ngModel)]="completeDateStr" name="dateRealisee" required
                class="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Coût réel (FCFA) *</label>
              <input type="number" [(ngModel)]="form.coutReel" name="coutReel" required min="0"
                class="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2"
                [placeholder]="'Estimé : ' + form.coutEstime + ' FCFA'" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Observations terrain</label>
              <textarea [(ngModel)]="form.observations" name="observations" rows="3"
                class="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2"
                placeholder="Notes de terrain..."></textarea>
            </div>
          </ng-container>

          <!-- Mode création / édition -->
          <ng-container *ngIf="!isComplete">
            <div>
              <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Type d'intervention *</label>
              <select [(ngModel)]="form.type" name="type" required
                class="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2">
                <option *ngFor="let t of interventionTypes" [value]="t.key">
                  {{ t.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Libellé *</label>
              <input type="text" [(ngModel)]="form.label" name="label" required
                class="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2"
                placeholder="Ex: Fertilisation urée tallage" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Date prévue *</label>
                <input type="date" [(ngModel)]="datePrevueStr" name="datePrevue" required
                  class="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Durée estimée (h)</label>
                <input type="number" [(ngModel)]="form.dureeEstimee" name="dureeEstimee" min="1"
                  class="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Produit utilisé</label>
                <input type="text" [(ngModel)]="form.produitUtilise" name="produitUtilise"
                  class="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2"
                  placeholder="Ex: Urée 46%" />
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Dose</label>
                <input type="text" [(ngModel)]="form.dose" name="dose"
                  class="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2"
                  placeholder="Ex: 100 kg/ha" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Coût estimé (FCFA) *</label>
                <input type="number" [(ngModel)]="form.coutEstime" name="coutEstime" required min="0"
                  class="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Main-d'oeuvre (pers.)</label>
                <input type="number" [(ngModel)]="form.mainOeuvre" name="mainOeuvre" min="1"
                  class="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2" />
              </div>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Responsable</label>
              <select [(ngModel)]="form.responsableId" name="responsableId"
                class="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2">
                <option *ngFor="let m of membres" [value]="m.id">{{ m.prenom }} {{ m.nom }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Observations</label>
              <textarea [(ngModel)]="form.observations" name="observations" rows="2"
                class="mt-1 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2"
                placeholder="Notes..."></textarea>
            </div>
          </ng-container>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" (click)="close()" class="btn-secondary text-sm">Annuler</button>
            <button type="submit" class="btn-primary text-sm flex items-center gap-1.5">
              <span class="material-icons text-[14px]" aria-hidden="true">{{ isComplete ? 'check' : 'save' }}</span>
              {{ isComplete ? 'Marquer terminée' : isEdit ? 'Modifier' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class InterventionFormComponent {
  dialogRef!: DialogRef;
  dialogConfig: any = {};

  form: any = {
    type: 'fertilisation',
    label: '',
    dureeEstimee: 8,
    coutEstime: 0,
    mainOeuvre: 2,
    responsableId: 'tech001',
    observations: '',
    produitUtilise: '',
    dose: '',
    coutReel: 0,
  };

  datePrevueStr = '';
  completeDateStr = new Date().toISOString().slice(0, 10);

  membres = MOCK_MEMBRES;

  interventionTypes = Object.entries(INTERVENTION_LABELS).map(([key, label]) => ({
    key, label, icon: INTERVENTION_ICONS[key as TypeIntervention],
  }));

  get isEdit(): boolean { return !!this.dialogConfig?.data?.intervention; }
  get isComplete(): boolean { return !!this.dialogConfig?.data?.completeMode; }

  ngOnInit(): void {
    const data = this.dialogConfig?.data;
    if (data?.intervention) {
      const i = data.intervention as Intervention;
      this.form = { ...i };
      this.datePrevueStr = new Date(i.datePrevue).toISOString().slice(0, 10);
      if (data.completeMode) {
        this.form.coutReel = i.coutEstime;
      }
    }
    if (data?.defaultResponsable) {
      this.form.responsableId = data.defaultResponsable;
    }
  }

  onSubmit(): void {
    if (this.isComplete) {
      this.dialogRef.close({
        action: 'complete',
        dateRealisee: new Date(this.completeDateStr),
        coutReel: this.form.coutReel,
        observations: this.form.observations,
      });
    } else {
      this.form.datePrevue = new Date(this.datePrevueStr);
      this.dialogRef.close({
        action: this.isEdit ? 'update' : 'create',
        intervention: this.form,
      });
    }
  }

  close(): void { this.dialogRef.close(); }

  onBackdrop(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.close();
  }
}
