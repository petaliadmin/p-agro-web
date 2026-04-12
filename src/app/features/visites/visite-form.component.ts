import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormDialogComponent } from '../../shared/components/form-dialog.component';
import { DialogConfig, DialogRef } from '../../core/services/dialog.service';
import { VisiteService } from '../../core/services/visite.service';
import { ParcelleService } from '../../core/services/parcelle.service';
import { ToastService } from '../../core/services/toast.service';
import { Visite, StatutVisite } from '../../core/models/visite.model';
import { Parcelle } from '../../core/models/parcelle.model';
import { MOCK_MEMBRES } from '../../../assets/mock-data/taches.mock';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-visite-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-dialog
      [title]="isEdit ? 'Modifier la visite' : 'Nouvelle visite'"
      [subtitle]="isEdit ? 'Modifier les informations de la visite' : 'Planifier une nouvelle visite terrain'"
      [loading]="saving"
      [submitLabel]="isEdit ? 'Mettre à jour' : 'Créer la visite'"
      [submitDisabled]="!isFormValid()"
      (close)="onClose()"
      (submit)="onSubmit()"
      size="lg">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Parcelle -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Parcelle *</label>
          <select [(ngModel)]="form.parcelleId"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.parcelleId"
            [disabled]="!!preselectedParcelleId">
            <option value="">Sélectionner une parcelle</option>
            <option *ngFor="let p of parcelles" [value]="p.id">{{ p.nom }} ({{ p.code }})</option>
          </select>
          <p *ngIf="submitted && !form.parcelleId" class="text-xs text-red-500 mt-1">La parcelle est requise</p>
        </div>

        <!-- Technicien -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Technicien *</label>
          <select [(ngModel)]="form.technicienId"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.technicienId">
            <option value="">Sélectionner un technicien</option>
            <option *ngFor="let m of techniciens" [value]="m.id">{{ m.prenom }} {{ m.nom }}</option>
          </select>
          <p *ngIf="submitted && !form.technicienId" class="text-xs text-red-500 mt-1">Le technicien est requis</p>
        </div>

        <!-- Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date de visite *</label>
          <input type="datetime-local" [(ngModel)]="form.date"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.date"/>
          <p *ngIf="submitted && !form.date" class="text-xs text-red-500 mt-1">La date est requise</p>
        </div>

        <!-- Statut -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select [(ngModel)]="form.statut"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="planifiee">Planifiée</option>
            <option value="en_cours">En cours</option>
            <option value="completee">Complétée</option>
          </select>
        </div>

        <!-- Durée -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Durée (minutes)</label>
          <input type="number" [(ngModel)]="form.duree" min="0" step="5"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
        </div>

        <!-- Étape actuelle -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Étape actuelle</label>
          <select [(ngModel)]="form.etapeActuelle"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option [ngValue]="1">1 — Accès parcelle</option>
            <option [ngValue]="2">2 — Observations</option>
            <option [ngValue]="3">3 — Sol & eau</option>
            <option [ngValue]="4">4 — Irrigation</option>
            <option [ngValue]="5">5 — Recommandations</option>
            <option [ngValue]="6">6 — Rapport</option>
          </select>
        </div>
      </div>

      <!-- Observations -->
      <div class="mt-5">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">Observations</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Croissance</label>
            <select [(ngModel)]="form.observations.croissance"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="excellente">Excellente</option>
              <option value="normale">Normale</option>
              <option value="faible">Faible</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Couleur des feuilles</label>
            <select [(ngModel)]="form.observations.couleurFeuilles"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="verte">Verte</option>
              <option value="jaunissante">Jaunissante</option>
              <option value="brunissante">Brunissante</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Hauteur plantes (cm)</label>
            <input type="number" [(ngModel)]="form.observations.hauteurPlantes" min="0"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Taux de couverture (%)</label>
            <input type="number" [(ngModel)]="form.observations.tauxCouverture" min="0" max="100"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
          <div class="md:col-span-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="form.observations.stressHydrique" class="rounded border-gray-300 text-primary-600 focus:ring-primary-400"/>
              <span class="text-sm text-gray-700">Stress hydrique détecté</span>
            </label>
          </div>

          <!-- Maladies détectées -->
          <div class="md:col-span-2">
            <label class="block text-xs text-gray-500 mb-1">Maladies détectées</label>
            <div class="space-y-2">
              <div *ngFor="let m of form.observations.maladiesDetectees; let i = index; trackBy: trackByIndex" class="flex items-center gap-2">
                <input type="text" [ngModel]="m" (ngModelChange)="form.observations.maladiesDetectees[i] = $event"
                  placeholder="Nom de la maladie"
                  class="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
                <button type="button" (click)="removeMaladie(i)" class="text-red-500 hover:text-red-700 p-1" aria-label="Supprimer maladie">
                  <span class="material-icons text-[18px]" aria-hidden="true">close</span>
                </button>
              </div>
              <button type="button" (click)="addMaladie()" class="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1">
                <span class="material-icons text-[14px]" aria-hidden="true">add</span> Ajouter une maladie
              </button>
            </div>
          </div>

          <!-- Ravageurs détectés -->
          <div class="md:col-span-2">
            <label class="block text-xs text-gray-500 mb-1">Ravageurs détectés</label>
            <div class="space-y-2">
              <div *ngFor="let r of form.observations.ravageursDetectes; let i = index; trackBy: trackByIndex" class="flex items-center gap-2">
                <input type="text" [ngModel]="r" (ngModelChange)="form.observations.ravageursDetectes[i] = $event"
                  placeholder="Nom du ravageur"
                  class="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
                <button type="button" (click)="removeRavageur(i)" class="text-red-500 hover:text-red-700 p-1" aria-label="Supprimer ravageur">
                  <span class="material-icons text-[18px]" aria-hidden="true">close</span>
                </button>
              </div>
              <button type="button" (click)="addRavageur()" class="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1">
                <span class="material-icons text-[14px]" aria-hidden="true">add</span> Ajouter un ravageur
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sol & Irrigation -->
      <div class="mt-5">
        <h4 class="text-sm font-semibold text-gray-900 mb-3">Sol & Irrigation</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Humidité sol</label>
            <select [(ngModel)]="form.sol.humidite"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="sec">Sec</option>
              <option value="normal">Normal</option>
              <option value="humide">Humide</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">pH du sol</label>
            <input type="number" [(ngModel)]="form.sol.ph" min="0" max="14" step="0.1"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Drainage</label>
            <select [(ngModel)]="form.sol.drainage"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="bon">Bon</option>
              <option value="moyen">Moyen</option>
              <option value="mauvais">Mauvais</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Type irrigation</label>
            <input type="text" [(ngModel)]="form.irrigation.type" placeholder="Ex: Goutte-à-goutte"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs text-gray-500 mb-1">Problème irrigation</label>
            <input type="text" [(ngModel)]="form.irrigation.probleme" placeholder="Aucun"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
        </div>
      </div>
    </app-form-dialog>
  `,
})
export class VisiteFormComponent implements OnInit {
  dialogConfig!: DialogConfig;
  dialogRef?: DialogRef;

  saving = false;
  submitted = false;
  parcelles: Parcelle[] = [];
  techniciens = MOCK_MEMBRES.filter(m => m.role === 'technicien' || m.role === 'chef_equipe');
  preselectedParcelleId = '';

  form = {
    parcelleId: '',
    technicienId: '',
    date: '',
    statut: 'planifiee' as StatutVisite,
    duree: 0,
    etapeActuelle: 1 as 1 | 2 | 3 | 4 | 5 | 6,
    observations: {
      croissance: 'normale' as 'excellente' | 'normale' | 'faible',
      couleurFeuilles: 'verte' as 'verte' | 'jaunissante' | 'brunissante',
      maladiesDetectees: [] as string[],
      ravageursDetectes: [] as string[],
      stressHydrique: false,
      hauteurPlantes: 0,
      tauxCouverture: 0,
    },
    sol: {
      humidite: 'normal' as 'sec' | 'normal' | 'humide',
      ph: 6.5,
      drainage: 'bon' as 'bon' | 'moyen' | 'mauvais',
    },
    irrigation: {
      type: '',
      probleme: null as string | null,
    },
  };

  get isEdit(): boolean {
    return !!this.dialogConfig?.data?.visite;
  }

  constructor(
    private visiteService: VisiteService,
    private parcelleService: ParcelleService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.parcelleService.getAll().pipe(take(1)).subscribe(p => {
      this.parcelles = p;
      this.cdr.markForCheck();
    });

    if (this.dialogConfig?.data?.parcelleId) {
      this.preselectedParcelleId = this.dialogConfig.data.parcelleId;
      this.form.parcelleId = this.dialogConfig.data.parcelleId;
    }

    if (this.dialogConfig?.data?.visite) {
      const v: Visite = this.dialogConfig.data.visite;
      const d = new Date(v.date);
      this.form = {
        parcelleId: v.parcelleId,
        technicienId: v.technicienId,
        date: this.toDatetimeLocal(d),
        statut: v.statut,
        duree: v.duree,
        etapeActuelle: v.etapeActuelle,
        observations: { ...v.observations },
        sol: { ...v.sol },
        irrigation: { ...v.irrigation },
      };
    } else {
      this.form.date = this.toDatetimeLocal(new Date());
    }
  }

  private toDatetimeLocal(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  isFormValid(): boolean {
    return this.form.parcelleId.length > 0 && this.form.technicienId.length > 0 && this.form.date.length > 0;
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.isFormValid()) {
      this.cdr.markForCheck();
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    const visiteData = {
      parcelleId: this.form.parcelleId,
      technicienId: this.form.technicienId,
      date: new Date(this.form.date),
      statut: this.form.statut,
      duree: this.form.duree,
      etapeActuelle: this.form.etapeActuelle,
      observations: {
        ...this.form.observations,
        maladiesDetectees: this.form.observations.maladiesDetectees.filter(m => m.trim()),
        ravageursDetectes: this.form.observations.ravageursDetectes.filter(r => r.trim()),
      },
      sol: this.form.sol,
      irrigation: { type: this.form.irrigation.type, probleme: this.form.irrigation.probleme || null },
      recommandations: [],
      photos: [],
      rapport: null,
    };

    if (this.isEdit) {
      const id = this.dialogConfig.data.visite.id;
      this.visiteService.update(id, visiteData).pipe(take(1)).subscribe({
        next: (updated) => {
          if (visiteData.statut === 'completee' && this.dialogConfig.data.visite.statut !== 'completee') {
            this.toastService.success('Visite complétée — rapport généré automatiquement');
          } else {
            this.toastService.success('Visite mise à jour avec succès');
          }
          this.dialogRef?.close(updated);
        },
        error: () => {
          this.toastService.error('Erreur lors de la mise à jour');
          this.saving = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      this.visiteService.create(visiteData).pipe(take(1)).subscribe({
        next: (created) => {
          this.toastService.success('Visite créée avec succès');
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

  addMaladie(): void {
    this.form.observations.maladiesDetectees.push('');
  }

  removeMaladie(index: number): void {
    this.form.observations.maladiesDetectees.splice(index, 1);
  }

  addRavageur(): void {
    this.form.observations.ravageursDetectes.push('');
  }

  removeRavageur(index: number): void {
    this.form.observations.ravageursDetectes.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onClose(): void {
    this.dialogRef?.close(undefined);
  }
}
