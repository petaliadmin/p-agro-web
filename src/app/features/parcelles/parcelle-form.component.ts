import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormDialogComponent } from '../../shared/components/form-dialog.component';
import { DialogConfig, DialogRef } from '../../core/services/dialog.service';
import { ParcelleService } from '../../core/services/parcelle.service';
import { ToastService } from '../../core/services/toast.service';
import { ThemeService } from '../../core/services/theme.service';
import { Parcelle, Coordonnees, CultureType, StadeCulture, StatutParcelle, ZoneAgroecologique, TypeSol, ModeAccesTerre, SourceEau, TypeCampagne } from '../../core/models/parcelle.model';
import { calcPolygonArea, calcCentroid } from '../../core/services/leaflet-draw.util';
import { MOCK_MEMBRES } from '../../../assets/mock-data/taches.mock';
import { take } from 'rxjs/operators';
import * as L from 'leaflet';
import 'leaflet-draw';

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
      size="xl">

      <!-- Section : Identification -->
      <div class="mb-5">
        <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span class="material-icons text-[14px]" aria-hidden="true">badge</span> Identification
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la parcelle *</label>
            <input type="text" [(ngModel)]="form.nom" placeholder="Ex: Parcelle Walo Nord"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="submitted && !form.nom.trim()"/>
            <p *ngIf="submitted && !form.nom.trim()" class="text-xs text-red-500 dark:text-red-400 mt-1">Le nom est requis</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
            <input type="text" [(ngModel)]="form.code" placeholder="Ex: PAR-2024-001"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="submitted && !form.code.trim()"/>
            <p *ngIf="submitted && !form.code.trim()" class="text-xs text-red-500 dark:text-red-400 mt-1">Le code est requis</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exploitant</label>
            <input type="text" [(ngModel)]="form.exploitantNom" placeholder="Ex: Mamadou Diallo"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Producteur *</label>
            <input type="text" [(ngModel)]="form.producteurNom" placeholder="Ex: Mamadou Diallo"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="submitted && !form.producteurNom.trim()"/>
            <p *ngIf="submitted && !form.producteurNom.trim()" class="text-xs text-red-500 dark:text-red-400 mt-1">Le producteur est requis</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localité / Village</label>
            <input type="text" [(ngModel)]="form.localite" placeholder="Ex: Ross Béthio"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technicien assigné</label>
            <select [(ngModel)]="form.technicienId"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="">Non assigné</option>
              <option *ngFor="let m of membres" [value]="m.id">{{ m.prenom }} {{ m.nom }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section : Terrain -->
      <div class="mb-5">
        <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span class="material-icons text-[14px]" aria-hidden="true">terrain</span> Terrain & Accès
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Superficie (ha) *</label>
            <input type="number" [(ngModel)]="form.superficie" min="0.1" step="0.1"
              [readonly]="superficieFromPolygon"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="submitted && form.superficie <= 0"
              [class.bg-green-50]="superficieFromPolygon"
              [class.cursor-not-allowed]="superficieFromPolygon"/>
            <p *ngIf="submitted && form.superficie <= 0" class="text-xs text-red-500 dark:text-red-400 mt-1">La superficie doit être supérieure à 0</p>
            <p *ngIf="superficieFromPolygon" class="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <span class="material-icons text-[12px]" aria-hidden="true">check_circle</span> Calculée depuis le tracé GPS
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zone *</label>
            <select [(ngModel)]="form.zone"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              [class.border-red-300]="submitted && !form.zone">
              <option value="">Sélectionner une zone</option>
              <option *ngFor="let z of zones" [value]="z">{{ z }}</option>
            </select>
            <p *ngIf="submitted && !form.zone" class="text-xs text-red-500 dark:text-red-400 mt-1">La zone est requise</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zone agroécologique</label>
            <select [(ngModel)]="form.zoneAgroecologique"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="">Sélectionner</option>
              <option *ngFor="let za of zonesAgroeco" [value]="za">{{ za }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de sol</label>
            <select [(ngModel)]="form.typeSol"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="">Sélectionner</option>
              <option *ngFor="let ts of typesSolOptions" [value]="ts.value">{{ ts.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mode d'accès à la terre</label>
            <select [(ngModel)]="form.modeAccesTerre"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="">Sélectionner</option>
              <option *ngFor="let ma of modesAcces" [value]="ma.value">{{ ma.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source d'eau</label>
            <select [(ngModel)]="form.sourceEau"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="">Sélectionner</option>
              <option *ngFor="let se of sourcesEau" [value]="se.value">{{ se.label }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section : Localisation & Tracé GPS -->
      <div class="mb-5">
        <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span class="material-icons text-[14px]" aria-hidden="true">map</span> Localisation & Tracé GPS
        </h4>

        <!-- Carte Leaflet avec outils de dessin -->
        <div class="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 mb-3">
          <div #drawMap class="h-[300px] w-full z-0"></div>

          <!-- Overlay info polygone -->
          <div *ngIf="hasPolygon"
            class="absolute bottom-3 left-3 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 px-3 py-2 text-xs flex items-center gap-2">
            <span class="material-icons text-[14px] text-green-600 dark:text-green-400" aria-hidden="true">check_circle</span>
            <span class="text-gray-700 dark:text-gray-300">Polygone tracé · <b>{{ form.superficie }} ha</b></span>
            <button (click)="clearPolygon()" type="button"
              class="ml-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-0.5 text-xs">
              <span class="material-icons text-[14px]" aria-hidden="true">delete_outline</span> Effacer
            </button>
          </div>
        </div>

        <p class="text-xs text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1">
          <span class="material-icons text-[12px]" aria-hidden="true">info</span>
          Dessinez un polygone ou un rectangle sur la carte pour définir le contour. La superficie et les coordonnées seront calculées automatiquement.
        </p>

        <!-- Coordonnées du centre (fallback / fine-tune) -->
        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Coordonnées du centre</span>
            <span *ngIf="hasPolygon" class="text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Auto (centroïde)</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Latitude *</label>
              <input type="number" [(ngModel)]="form.lat" step="0.0001" placeholder="Ex: 14.6928"
                class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                [class.border-red-300]="submitted && !isLatValid()"/>
              <p *ngIf="submitted && !isLatValid()" class="text-xs text-red-500 dark:text-red-400 mt-1">Latitude entre -90 et 90</p>
            </div>
            <div>
              <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Longitude *</label>
              <input type="number" [(ngModel)]="form.lng" step="0.0001" placeholder="Ex: -17.4467"
                class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                [class.border-red-300]="submitted && !isLngValid()"/>
              <p *ngIf="submitted && !isLngValid()" class="text-xs text-red-500 dark:text-red-400 mt-1">Longitude entre -180 et 180</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section : Culture -->
      <div class="mb-5">
        <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span class="material-icons text-[14px]" aria-hidden="true">grass</span> Culture & Campagne
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Culture *</label>
            <select [(ngModel)]="form.culture"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option *ngFor="let c of cultures" [value]="c.value">{{ c.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Variété</label>
            <input type="text" [(ngModel)]="form.variete" placeholder="Ex: 55-437, Sahel 108..."
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de campagne</label>
            <select [(ngModel)]="form.typeCampagne"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="">Sélectionner</option>
              <option *ngFor="let tc of typesCampagne" [value]="tc.value">{{ tc.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stade de culture</label>
            <select [(ngModel)]="form.stade"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option *ngFor="let s of stades" [value]="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
            <select [(ngModel)]="form.statut"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="sain">Sain</option>
              <option value="attention">Attention</option>
              <option value="urgent">Urgent</option>
              <option value="recolte">Récolte</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <span class="flex items-center gap-1.5">
                <span class="material-icons text-[14px] text-gray-400 dark:text-gray-500" aria-hidden="true">calendar_today</span>
                Date de semis
              </span>
            </label>
            <input type="date" [(ngModel)]="form.dateSemis"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                     hover:border-gray-300 transition-colors cursor-pointer
                     [&::-webkit-calendar-picker-indicator]:cursor-pointer
                     [&::-webkit-calendar-picker-indicator]:opacity-60
                     [&::-webkit-calendar-picker-indicator]:hover:opacity-100"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Densité / Écartement</label>
            <input type="text" [(ngModel)]="form.densite" placeholder="Ex: 25cm x 25cm"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rendement précédent (t/ha)</label>
            <input type="number" [(ngModel)]="form.rendementPrecedent" min="0" step="0.1"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"/>
          </div>
        </div>
      </div>

      <!-- Section : Historique & Rotation -->
      <div class="mb-5">
        <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span class="material-icons text-[14px]" aria-hidden="true">history</span> Historique & Rotation
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Culture précédente</label>
            <select [(ngModel)]="form.culturePrecedente"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="">Aucune</option>
              <option *ngFor="let c of cultures" [value]="c.value">{{ c.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rotation prévue (prochaine culture)</label>
            <select [(ngModel)]="form.rotationPrevue"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="">Non définie</option>
              <option *ngFor="let c of cultures" [value]="c.value">{{ c.label }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section : Visites -->
      <div class="mb-5">
        <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span class="material-icons text-[14px]" aria-hidden="true">event</span> Visites
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dernière visite</label>
            <input type="date" [(ngModel)]="form.derniereVisite"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                     hover:border-gray-300 transition-colors cursor-pointer
                     [&::-webkit-calendar-picker-indicator]:cursor-pointer
                     [&::-webkit-calendar-picker-indicator]:opacity-60
                     [&::-webkit-calendar-picker-indicator]:hover:opacity-100"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prochaine visite</label>
            <input type="date" [(ngModel)]="form.prochaineVisite"
              class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                     hover:border-gray-300 transition-colors cursor-pointer
                     [&::-webkit-calendar-picker-indicator]:cursor-pointer
                     [&::-webkit-calendar-picker-indicator]:opacity-60
                     [&::-webkit-calendar-picker-indicator]:hover:opacity-100"/>
          </div>
        </div>
      </div>
    </app-form-dialog>
  `,
})
export class ParcelleFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('drawMap') mapElRef!: ElementRef;

  dialogConfig!: DialogConfig;
  dialogRef?: DialogRef;

  saving = false;
  submitted = false;

  // Map & polygon
  private mapInstance: L.Map | null = null;
  private drawnItems: L.FeatureGroup | null = null;
  private currentPolygonLayer: L.Layer | null = null;
  geometry: Coordonnees[] = [];
  hasPolygon = false;
  superficieFromPolygon = false;

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

  zonesAgroeco: ZoneAgroecologique[] = [
    'Niayes', 'Casamance', 'Vallée du Fleuve Sénégal', 'Bassin Arachidier', 'Sénégal Oriental', 'Zone Sylvopastorale',
  ];

  typesSolOptions = [
    { value: 'dior', label: 'Dior (sableux ferrugineux)' },
    { value: 'deck', label: 'Deck (argileux hydromorphe)' },
    { value: 'argileux', label: 'Argileux' },
    { value: 'sableux', label: 'Sableux' },
    { value: 'argilo-sableux', label: 'Argilo-sableux' },
    { value: 'lateritique', label: 'Latéritique' },
    { value: 'limoneux', label: 'Limoneux' },
    { value: 'sablo-humifere', label: 'Sablo-humifère' },
  ];

  modesAcces = [
    { value: 'propriete', label: 'Propriété' },
    { value: 'pret', label: 'Prêt' },
    { value: 'location', label: 'Location' },
    { value: 'communautaire', label: 'Communautaire' },
  ];

  sourcesEau = [
    { value: 'pluie', label: 'Pluie (pluvial)' },
    { value: 'forage', label: 'Forage' },
    { value: 'canal', label: 'Canal d\'irrigation' },
    { value: 'fleuve', label: 'Fleuve' },
    { value: 'bassin', label: 'Bassin de rétention' },
    { value: 'puits', label: 'Puits' },
  ];

  typesCampagne = [
    { value: 'hivernage', label: 'Hivernage (juin-novembre)' },
    { value: 'contre_saison_froide', label: 'Contre-saison froide (nov-mars)' },
    { value: 'contre_saison_chaude', label: 'Contre-saison chaude (mars-juin)' },
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
    exploitantNom: '',
    localite: '',
    zoneAgroecologique: '' as ZoneAgroecologique | '',
    typeSol: '' as TypeSol | '',
    modeAccesTerre: '' as ModeAccesTerre | '',
    sourceEau: '' as SourceEau | '',
    variete: '',
    typeCampagne: '' as TypeCampagne | '',
    dateSemis: '',
    densite: '',
    culturePrecedente: '' as CultureType | '',
    rotationPrevue: '' as CultureType | '',
  };

  get isEdit(): boolean {
    return !!this.dialogConfig?.data?.parcelle;
  }

  private toDateStr(d: Date | string | undefined): string {
    if (!d) return '';
    const date = new Date(d);
    return date.toISOString().split('T')[0];
  }

  constructor(
    private parcelleService: ParcelleService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService,
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
        exploitantNom: p.exploitantNom || '',
        localite: p.localite || '',
        zoneAgroecologique: p.zoneAgroecologique || '',
        typeSol: p.typeSol || '',
        modeAccesTerre: p.modeAccesTerre || '',
        sourceEau: p.sourceEau || '',
        variete: p.variete || '',
        typeCampagne: p.typeCampagne || '',
        dateSemis: this.toDateStr(p.dateSemis),
        densite: p.densite || '',
        culturePrecedente: p.culturePrecedente || '',
        rotationPrevue: p.rotationPrevue || '',
      };

      if (p.geometry && p.geometry.length >= 3) {
        this.geometry = [...p.geometry];
        this.hasPolygon = true;
        this.superficieFromPolygon = true;
      }
    }

    // Pre-fill from carte publique drawing
    if (this.dialogConfig?.data?.prefilledDraw) {
      const draw = this.dialogConfig.data.prefilledDraw;
      if (draw.geometry && draw.geometry.length >= 3) {
        this.geometry = draw.geometry;
        this.hasPolygon = true;
        this.superficieFromPolygon = true;
        this.form.superficie = draw.superficie;
      }
      if (draw.centroid) {
        this.form.lat = draw.centroid.lat;
        this.form.lng = draw.centroid.lng;
      }
      if (draw.estimatedZone) {
        this.form.zoneAgroecologique = draw.estimatedZone;
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initFormMap(), 250);
  }

  ngOnDestroy(): void {
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
  }

  // ── Map initialization ──

  private initFormMap(): void {
    if (!this.mapElRef?.nativeElement) return;

    const center: L.LatLngExpression = [this.form.lat || 14.5, this.form.lng || -15.0];
    const zoom = this.hasPolygon ? 14 : (this.isEdit ? 13 : 7);

    this.mapInstance = L.map(this.mapElRef.nativeElement, {
      center,
      zoom,
      maxZoom: 25,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Tiles (dark/light)
    const isDark = this.themeService.isDark();
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    const subdomains = isDark ? 'abcd' : '0123';
    const maxNative = isDark ? 20 : 21;
    L.tileLayer(tileUrl, {
      maxZoom: 25, maxNativeZoom: maxNative, subdomains, attribution: '',
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    }).addTo(this.mapInstance);

    // Drawn items layer
    this.drawnItems = new L.FeatureGroup();
    this.mapInstance.addLayer(this.drawnItems);

    // Load existing geometry if editing
    if (this.hasPolygon && this.geometry.length >= 3) {
      const latlngs = this.geometry.map(c => L.latLng(c.lat, c.lng));
      const polygon = L.polygon(latlngs, {
        color: '#1A7A4A', weight: 2, fillOpacity: 0.15, fillColor: '#1A7A4A',
      });
      this.drawnItems.addLayer(polygon);
      this.currentPolygonLayer = polygon;
      this.mapInstance.fitBounds(polygon.getBounds(), { padding: [30, 30] });
    }

    // Draw controls
    const drawControl = new (L.Control as any).Draw({
      position: 'topleft',
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: { color: '#1A7A4A', weight: 2, fillOpacity: 0.15 },
        },
        rectangle: {
          shapeOptions: { color: '#1A7A4A', weight: 2, fillOpacity: 0.15 },
        },
        polyline: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: this.drawnItems,
        remove: true,
      },
    });
    this.mapInstance.addControl(drawControl);

    // Events
    this.mapInstance.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      // Remove previous polygon (one at a time)
      if (this.currentPolygonLayer && this.drawnItems) {
        this.drawnItems.removeLayer(this.currentPolygonLayer);
      }
      this.drawnItems!.addLayer(layer);
      this.currentPolygonLayer = layer;
      this.applyPolygonFromLayer(layer);
    });

    this.mapInstance.on(L.Draw.Event.EDITED, () => {
      if (this.currentPolygonLayer) {
        this.applyPolygonFromLayer(this.currentPolygonLayer);
      }
    });

    this.mapInstance.on(L.Draw.Event.DELETED, () => {
      this.currentPolygonLayer = null;
      this.geometry = [];
      this.hasPolygon = false;
      this.superficieFromPolygon = false;
      this.cdr.markForCheck();
    });

    setTimeout(() => this.mapInstance?.invalidateSize(), 100);
  }

  private applyPolygonFromLayer(layer: any): void {
    const latlngs: L.LatLng[] = layer.getLatLngs ? layer.getLatLngs()[0] : [];
    if (!latlngs || latlngs.length < 3) return;

    this.geometry = latlngs.map((ll: L.LatLng) => ({ lat: ll.lat, lng: ll.lng }));
    this.hasPolygon = true;
    this.superficieFromPolygon = true;

    // Superficie (shared util)
    const areaM2 = calcPolygonArea(latlngs);
    this.form.superficie = Math.round(areaM2 / 10000 * 100) / 100;

    // Centroid (shared util)
    const centroid = calcCentroid(latlngs);
    this.form.lat = centroid.lat;
    this.form.lng = centroid.lng;

    this.cdr.markForCheck();
  }

  clearPolygon(): void {
    if (this.drawnItems) {
      this.drawnItems.clearLayers();
    }
    this.currentPolygonLayer = null;
    this.geometry = [];
    this.hasPolygon = false;
    this.superficieFromPolygon = false;
    this.cdr.markForCheck();
  }

  // ── Validation ──

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

  // ── Submit ──

  onSubmit(): void {
    this.submitted = true;
    if (!this.isFormValid()) {
      this.cdr.markForCheck();
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    const parcelleData: any = {
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
      exploitantNom: this.form.exploitantNom.trim() || undefined,
      localite: this.form.localite.trim() || undefined,
      zoneAgroecologique: (this.form.zoneAgroecologique as ZoneAgroecologique) || undefined,
      typeSol: (this.form.typeSol as TypeSol) || undefined,
      modeAccesTerre: (this.form.modeAccesTerre as ModeAccesTerre) || undefined,
      sourceEau: (this.form.sourceEau as SourceEau) || undefined,
      variete: this.form.variete.trim() || undefined,
      typeCampagne: (this.form.typeCampagne as TypeCampagne) || undefined,
      dateSemis: this.form.dateSemis ? new Date(this.form.dateSemis) : undefined,
      densite: this.form.densite.trim() || undefined,
      culturePrecedente: (this.form.culturePrecedente as CultureType) || undefined,
      rotationPrevue: (this.form.rotationPrevue as CultureType) || undefined,
      geometry: this.hasPolygon && this.geometry.length >= 3 ? this.geometry : undefined,
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
