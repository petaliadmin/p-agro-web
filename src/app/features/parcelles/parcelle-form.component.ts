import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormDialogComponent } from '../../shared/components/form-dialog.component';
import { DialogConfig, DialogRef } from '../../core/services/dialog.service';
import { ParcelleService } from '../../core/services/parcelle.service';
import { ToastService } from '../../core/services/toast.service';
import { Parcelle, CultureType, StadeCulture, StatutParcelle } from '../../core/models/parcelle.model';
import { MOCK_MEMBRES } from '../../../assets/mock-data/taches.mock';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-parcelle-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-dialog
      [title]="isEdit ? 'Modifier la parcelle' : 'Nouvelle parcelle'"
      [subtitle]="isEdit ? 'Modifier les informations de ' + form.nom : 'Remplissez les informations pour créer une parcelle'"
      [loading]="saving"
      [submitLabel]="isEdit ? 'Mettre à jour' : 'Créer la parcelle'"
      [submitDisabled]="!isFormValid()"
      (close)="onClose()"
      (submit)="onSubmit()"
      size="lg">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Nom -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom de la parcelle *</label>
          <input type="text" [(ngModel)]="form.nom" placeholder="Ex: Parcelle Walo Nord"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.nom.trim()"/>
          <p *ngIf="submitted && !form.nom.trim()" class="text-xs text-red-500 mt-1">Le nom est requis</p>
        </div>

        <!-- Code -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Code *</label>
          <input type="text" [(ngModel)]="form.code" placeholder="Ex: PAR-2024-001"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.code.trim()"/>
          <p *ngIf="submitted && !form.code.trim()" class="text-xs text-red-500 mt-1">Le code est requis</p>
        </div>

        <!-- Superficie -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Superficie (ha) *</label>
          <input type="number" [(ngModel)]="form.superficie" min="0.1" step="0.1"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && form.superficie <= 0"/>
          <p *ngIf="submitted && form.superficie <= 0" class="text-xs text-red-500 mt-1">La superficie doit être supérieure à 0</p>
        </div>

        <!-- Culture -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Culture *</label>
          <select [(ngModel)]="form.culture"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option *ngFor="let c of cultures" [value]="c.value">{{ c.label }}</option>
          </select>
        </div>

        <!-- Stade -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Stade de culture</label>
          <select [(ngModel)]="form.stade"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option *ngFor="let s of stades" [value]="s.value">{{ s.label }}</option>
          </select>
        </div>

        <!-- Statut -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select [(ngModel)]="form.statut"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="sain">Sain</option>
            <option value="attention">Attention</option>
            <option value="urgent">Urgent</option>
            <option value="recolte">Récolte</option>
          </select>
        </div>

        <!-- Zone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Zone *</label>
          <select [(ngModel)]="form.zone"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.zone">
            <option value="">Sélectionner une zone</option>
            <option *ngFor="let z of zones" [value]="z">{{ z }}</option>
          </select>
          <p *ngIf="submitted && !form.zone" class="text-xs text-red-500 mt-1">La zone est requise</p>
        </div>

        <!-- Type de sol -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type de sol</label>
          <input type="text" [(ngModel)]="form.typesSol" placeholder="Ex: Argilo-limoneux"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
        </div>

        <!-- Producteur -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Producteur *</label>
          <input type="text" [(ngModel)]="form.producteurNom" placeholder="Ex: Mamadou Diallo"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            [class.border-red-300]="submitted && !form.producteurNom.trim()"/>
          <p *ngIf="submitted && !form.producteurNom.trim()" class="text-xs text-red-500 mt-1">Le producteur est requis</p>
        </div>

        <!-- Technicien -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Technicien assigné</label>
          <select [(ngModel)]="form.technicienId"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="">Non assigné</option>
            <option *ngFor="let m of membres" [value]="m.id">{{ m.prenom }} {{ m.nom }}</option>
          </select>
        </div>

        <!-- Rendement précédent -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rendement précédent (t/ha)</label>
          <input type="number" [(ngModel)]="form.rendementPrecedent" min="0" step="0.1"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
        </div>

        <!-- Dernière visite -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            <span class="flex items-center gap-1.5">
              <span class="material-icons text-[14px] text-gray-400" aria-hidden="true">event_available</span>
              Dernière visite
            </span>
          </label>
          <input type="date" [(ngModel)]="form.derniereVisite"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700
                   focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                   hover:border-gray-300 transition-colors cursor-pointer
                   [&::-webkit-calendar-picker-indicator]:cursor-pointer
                   [&::-webkit-calendar-picker-indicator]:opacity-60
                   [&::-webkit-calendar-picker-indicator]:hover:opacity-100"/>
        </div>

        <!-- Prochaine visite -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            <span class="flex items-center gap-1.5">
              <span class="material-icons text-[14px] text-gray-400" aria-hidden="true">event</span>
              Prochaine visite
            </span>
          </label>
          <input type="date" [(ngModel)]="form.prochaineVisite"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700
                   focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                   hover:border-gray-300 transition-colors cursor-pointer
                   [&::-webkit-calendar-picker-indicator]:cursor-pointer
                   [&::-webkit-calendar-picker-indicator]:opacity-60
                   [&::-webkit-calendar-picker-indicator]:hover:opacity-100"/>
        </div>
      </div>

      <!-- Coordonnées -->
      <div class="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
          <span class="material-icons text-[16px] text-gray-500" aria-hidden="true">location_on</span> Coordonnées GPS
        </h4>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Latitude *</label>
            <input type="number" [(ngModel)]="form.lat" step="0.0001" placeholder="Ex: 14.6928"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="submitted && !isLatValid()"/>
            <p *ngIf="submitted && !isLatValid()" class="text-xs text-red-500 mt-1">Latitude entre -90 et 90</p>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Longitude *</label>
            <input type="number" [(ngModel)]="form.lng" step="0.0001" placeholder="Ex: -17.4467"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="submitted && !isLngValid()"/>
            <p *ngIf="submitted && !isLngValid()" class="text-xs text-red-500 mt-1">Longitude entre -180 et 180</p>
          </div>
        </div>
      </div>
    </app-form-dialog>
  `,
})
export class ParcelleFormComponent {
  dialogConfig!: DialogConfig;
  dialogRef?: DialogRef;

  saving = false;
  submitted = false;

  cultures = [
    { value: 'riz', label: '🌾 Riz' },
    { value: 'mais', label: '🌽 Maïs' },
    { value: 'mil', label: '🌿 Mil' },
    { value: 'arachide', label: '🥜 Arachide' },
    { value: 'oignon', label: '🧅 Oignon' },
    { value: 'tomate', label: '🍅 Tomate' },
  ];

  stades = [
    { value: 'semis', label: 'Semis' },
    { value: 'levee', label: 'Levée' },
    { value: 'tallage', label: 'Tallage' },
    { value: 'floraison', label: 'Floraison' },
    { value: 'maturation', label: 'Maturation' },
    { value: 'recolte', label: 'Récolte' },
  ];

  zones: string[] = [];
  membres = MOCK_MEMBRES;

  form = {
    nom: '',
    code: '',
    superficie: 0,
    culture: 'riz' as CultureType,
    stade: 'semis' as StadeCulture,
    statut: 'sain' as StatutParcelle,
    zone: '',
    typesSol: '',
    producteurNom: '',
    technicienId: '',
    rendementPrecedent: 0,
    derniereVisite: new Date().toISOString().split('T')[0],
    prochaineVisite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lat: 14.6928,
    lng: -17.4467,
  };

  get isEdit(): boolean {
    return !!this.dialogConfig?.data?.parcelle;
  }

  private toDateStr(d: Date | string): string {
    const date = new Date(d);
    return date.toISOString().split('T')[0];
  }

  constructor(
    private parcelleService: ParcelleService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.zones = this.parcelleService.getZones();

    if (this.dialogConfig?.data?.parcelle) {
      const p: Parcelle = this.dialogConfig.data.parcelle;
      this.form = {
        nom: p.nom,
        code: p.code,
        superficie: p.superficie,
        culture: p.culture,
        stade: p.stade,
        statut: p.statut,
        zone: p.zone,
        typesSol: p.typesSol,
        producteurNom: p.producteurNom,
        technicienId: p.technicienId,
        rendementPrecedent: p.rendementPrecedent,
        derniereVisite: this.toDateStr(p.derniereVisite),
        prochaineVisite: this.toDateStr(p.prochaineVisite),
        lat: p.coordonnees.lat,
        lng: p.coordonnees.lng,
      };
    }
  }

  isLatValid(): boolean {
    return this.form.lat >= -90 && this.form.lat <= 90;
  }

  isLngValid(): boolean {
    return this.form.lng >= -180 && this.form.lng <= 180;
  }

  isFormValid(): boolean {
    return (
      this.form.nom.trim().length > 0 &&
      this.form.code.trim().length > 0 &&
      this.form.superficie > 0 &&
      this.form.zone.length > 0 &&
      this.form.producteurNom.trim().length > 0 &&
      this.isLatValid() &&
      this.isLngValid()
    );
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.isFormValid()) {
      this.cdr.markForCheck();
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    const parcelleData = {
      nom: this.form.nom.trim(),
      code: this.form.code.trim(),
      superficie: this.form.superficie,
      culture: this.form.culture,
      stade: this.form.stade,
      statut: this.form.statut,
      zone: this.form.zone,
      typesSol: this.form.typesSol,
      producteurNom: this.form.producteurNom.trim(),
      technicienId: this.form.technicienId,
      rendementPrecedent: this.form.rendementPrecedent,
      coordonnees: { lat: this.form.lat, lng: this.form.lng },
      derniereVisite: new Date(this.form.derniereVisite),
      prochaineVisite: new Date(this.form.prochaineVisite),
    };

    if (this.isEdit) {
      const id = this.dialogConfig.data.parcelle.id;
      this.parcelleService.update(id, parcelleData).pipe(take(1)).subscribe({
        next: (updated) => {
          this.toastService.success(`Parcelle "${updated.nom}" mise à jour avec succès`);
          this.dialogRef?.close(updated);
        },
        error: () => {
          this.toastService.error('Erreur lors de la mise à jour');
          this.saving = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      this.parcelleService.create(parcelleData).pipe(take(1)).subscribe({
        next: (created) => {
          this.toastService.success(`Parcelle "${created.nom}" créée avec succès`);
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
