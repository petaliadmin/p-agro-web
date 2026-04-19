import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { VisiteService } from '../../core/services/visite.service';
import { ParcelleService } from '../../core/services/parcelle.service';
import { DialogService } from '../../core/services/dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusChipComponent, PageHeaderComponent } from '../../shared/components/shared-components';
import { Visite } from '../../core/models/visite.model';
import { Parcelle } from '../../core/models/parcelle.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-visite-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusChipComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Détail de la visite" [breadcrumbs]="[{label:'Visites',route:'/visites'},{label:'Détail'}]">
      <div class="flex gap-2">
        <button (click)="onDelete()" class="text-sm px-3 py-1.5 rounded-lg font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1.5">
          <span class="material-icons text-[14px]" aria-hidden="true">delete</span> Supprimer
        </button>
        <button (click)="openEdit()" class="btn-secondary flex items-center gap-2 text-sm">
          <span class="material-icons text-[16px]" aria-hidden="true">edit</span> Éditer
        </button>
        <button class="btn-secondary flex items-center gap-2 text-sm" (click)="genererPDF()">
          <span class="material-icons text-[16px]" aria-hidden="true">download</span> PDF
        </button>
      </div>
    </app-page-header>
    <div *ngIf="visite" class="space-y-5">
      <!-- Stepper lecture seule -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Étapes de la visite</h3>
        <div class="flex items-center gap-2">
          <ng-container *ngFor="let step of steps; let i = index">
            <div class="flex items-center gap-1">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                [class.bg-primary-600]="(i+1) <= visite.etapeActuelle"
                [class.text-white]="(i+1) <= visite.etapeActuelle"
                [class.bg-gray-100]="(i+1) > visite.etapeActuelle"
                [class.text-gray-500]="(i+1) > visite.etapeActuelle"
              >{{ i+1 }}</div>
              <span class="text-xs hidden md:block" [class.text-gray-900]="(i+1) <= visite.etapeActuelle" [class.text-gray-500]="(i+1) > visite.etapeActuelle">{{ step }}</span>
            </div>
            <div *ngIf="i < steps.length - 1" class="flex-1 h-px" [class.bg-primary-600]="(i+2) <= visite.etapeActuelle" [class.bg-gray-200]="(i+2) > visite.etapeActuelle"></div>
          </ng-container>
        </div>
      </div>

      <!-- Info résumé -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Informations</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Parcelle</p>
            <a *ngIf="parcelle" [routerLink]="['/parcelles', parcelle.id]" class="font-medium mt-0.5 text-primary-600 hover:underline block">{{ parcelle.nom }}</a>
            <p *ngIf="!parcelle" class="font-medium mt-0.5 text-gray-400">—</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Date</p><p class="font-medium mt-0.5">{{ visite.date | date:'dd/MM/yyyy HH:mm' }}</p></div>
          <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Durée</p><p class="font-medium mt-0.5">{{ visite.duree }} min</p></div>
          <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Statut</p><div class="mt-0.5"><app-status-chip [statut]="visite.statut"></app-status-chip></div></div>
          <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Étape</p><p class="font-medium mt-0.5">{{ visite.etapeActuelle }}/6</p></div>
        </div>
      </div>

      <!-- Observations -->
      <div class="card p-5">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Observations</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Croissance</p><p class="font-medium capitalize mt-1">{{ visite.observations.croissance }}</p></div>
          <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Couleur feuilles</p><p class="font-medium capitalize mt-1">{{ visite.observations.couleurFeuilles }}</p></div>
          <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Hauteur plantes</p><p class="font-medium mt-1">{{ visite.observations.hauteurPlantes }} cm</p></div>
          <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-500">Taux couverture</p><p class="font-medium mt-1">{{ visite.observations.tauxCouverture }}%</p></div>
        </div>
        <div *ngIf="visite.observations.stressHydrique" class="mt-3 flex items-center gap-2 bg-yellow-50 rounded-lg px-3 py-2">
          <span class="material-icons text-yellow-600 text-[16px]" aria-hidden="true">warning</span>
          <span class="text-sm text-yellow-800 font-medium">Stress hydrique détecté</span>
        </div>
        <div *ngIf="visite.observations.maladiesDetectees.length" class="mt-3">
          <p class="text-xs text-gray-500 mb-1">Maladies détectées</p>
          <div class="flex flex-wrap gap-1">
            <span *ngFor="let m of visite.observations.maladiesDetectees" class="badge-urgent">{{ m }}</span>
          </div>
        </div>
        <div *ngIf="visite.observations.ravageursDetectes.length" class="mt-3">
          <p class="text-xs text-gray-500 mb-1">Ravageurs détectés</p>
          <div class="flex flex-wrap gap-1">
            <span *ngFor="let r of visite.observations.ravageursDetectes" class="badge-attention">{{ r }}</span>
          </div>
        </div>
      </div>

      <!-- Sol & Irrigation -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Sol</h3>
          <div class="space-y-2">
            <div class="flex justify-between"><span class="text-xs text-gray-500">Humidité</span><span class="text-sm font-medium capitalize">{{ visite.sol.humidite }}</span></div>
            <div class="flex justify-between"><span class="text-xs text-gray-500">pH</span><span class="text-sm font-medium">{{ visite.sol.ph }}</span></div>
            <div class="flex justify-between"><span class="text-xs text-gray-500">Drainage</span><span class="text-sm font-medium capitalize">{{ visite.sol.drainage }}</span></div>
          </div>
        </div>
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Irrigation</h3>
          <div class="space-y-2">
            <div class="flex justify-between"><span class="text-xs text-gray-500">Type</span><span class="text-sm font-medium">{{ visite.irrigation.type }}</span></div>
            <div class="flex justify-between"><span class="text-xs text-gray-500">Problème</span><span class="text-sm font-medium">{{ visite.irrigation.probleme || 'Aucun' }}</span></div>
          </div>
        </div>
      </div>

      <!-- Recommandations -->
      <div class="card p-5" *ngIf="visite.recommandations.length">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Recommandations</h3>
        <div class="space-y-3">
          <div *ngFor="let r of visite.recommandations" class="flex gap-3 p-3 rounded-lg"
            [class.bg-red-50]="r.priorite === 'urgente'" [class.bg-yellow-50]="r.priorite === 'normale'" [class.bg-gray-50]="r.priorite === 'basse'">
            <span class="material-icons text-[20px]" aria-hidden="true" [class.text-red-500]="r.priorite === 'urgente'" [class.text-yellow-600]="r.priorite === 'normale'" [class.text-gray-500]="r.priorite === 'basse'">info</span>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-0.5">
                <p class="text-sm font-medium text-gray-900">{{ r.description }}</p>
                <span class="text-[10px] rounded-full px-2 py-0.5 font-medium capitalize"
                  [class.bg-red-100]="r.priorite === 'urgente'" [class.text-red-700]="r.priorite === 'urgente'"
                  [class.bg-yellow-100]="r.priorite === 'normale'" [class.text-yellow-700]="r.priorite === 'normale'"
                  [class.bg-gray-100]="r.priorite === 'basse'" [class.text-gray-600]="r.priorite === 'basse'"
                >{{ r.priorite }}</span>
              </div>
              <p class="text-xs text-gray-500">Type : {{ r.type }}</p>
              <p *ngIf="r.produitSuggere" class="text-xs text-gray-500">Produit : {{ r.produitSuggere }}</p>
              <p class="text-xs text-gray-500">Délai : {{ r.delaiJours }} jour(s)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rapport auto-généré -->
      <div class="card p-5" *ngIf="visite.rapport">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span class="material-icons text-[18px] text-primary-600" aria-hidden="true">description</span>
            Rapport de visite
          </h3>
          <span class="text-[10px] bg-green-100 text-green-800 rounded-full px-2 py-0.5 font-medium">Généré automatiquement</span>
        </div>
        <pre class="text-xs text-gray-700 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap font-sans leading-relaxed overflow-x-auto">{{ visite.rapport }}</pre>
      </div>

      <!-- Photos -->
      <div class="card p-5" *ngIf="visite.photos.length">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Photos ({{ visite.photos.length }})</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div *ngFor="let p of visite.photos; let i = index" class="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500" [attr.aria-label]="'Photo ' + (i + 1) + ' de la visite'" role="img">
            <span class="material-icons text-[32px]" aria-hidden="true">photo_camera</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class VisiteDetailComponent implements OnInit {
  visite: Visite | undefined;
  parcelle: Parcelle | undefined;
  steps = ['Accès parcelle', 'Observations', 'Sol & eau', 'Irrigation', 'Recommandations', 'Rapport'];

  constructor(
    private visiteService: VisiteService,
    private parcelleService: ParcelleService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = window.location.pathname.split('/').pop() ?? '';
    this.visiteService.getById(id).subscribe(v => {
      this.visite = v;
      if (v?.parcelleId) {
        this.parcelleService.getById(v.parcelleId).pipe(take(1)).subscribe(p => {
          this.parcelle = p;
          this.cdr.markForCheck();
        });
      }
      this.cdr.markForCheck();
    });
  }

  async openEdit(): Promise<void> {
    if (!this.visite) return;
    const { VisiteFormComponent } = await import('./visite-form.component');
    const ref = this.dialogService.open(VisiteFormComponent, {
      data: { visite: this.visite },
    });
    const result = await ref.afterClosed();
    if (result) {
      this.visite = result;
      this.cdr.markForCheck();
    }
  }

  async onDelete(): Promise<void> {
    if (!this.visite) return;
    const confirmed = await this.dialogService.confirm({
      title: 'Supprimer la visite',
      message: 'Êtes-vous sûr de vouloir supprimer cette visite ? Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      confirmColor: 'danger',
    });
    if (confirmed) {
      this.visiteService.delete(this.visite.id).pipe(take(1)).subscribe(() => {
        this.toastService.success('Visite supprimée avec succès');
        this.router.navigate(['/visites']);
      });
    }
  }

  genererPDF(): void {
    if (!this.visite) return;
    const v = this.visite;
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(20);
      doc.setTextColor(26, 122, 74);
      doc.text('Petalia Farm OS — Rapport de visite', 14, y);
      y += 14;
      doc.setDrawColor(200);
      doc.line(14, y, 196, y);
      y += 10;

      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.text(`Visite du ${new Date(v.date).toLocaleDateString('fr-FR')}`, 14, y);
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`Statut : ${v.statut}`, 18, y); y += 7;
      doc.text(`Durée : ${v.duree} minutes`, 18, y); y += 7;
      doc.text(`Technicien ID : ${v.technicienId}`, 18, y); y += 12;

      doc.setFontSize(12);
      doc.setTextColor(30);
      doc.text('Observations', 14, y); y += 8;
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`Croissance : ${v.observations.croissance}`, 18, y); y += 7;
      doc.text(`Couleur feuilles : ${v.observations.couleurFeuilles}`, 18, y); y += 7;
      doc.text(`Hauteur plantes : ${v.observations.hauteurPlantes} cm`, 18, y); y += 7;
      doc.text(`Taux couverture : ${v.observations.tauxCouverture}%`, 18, y); y += 7;
      if (v.observations.stressHydrique) { doc.text('Stress hydrique détecté', 18, y); y += 7; }
      if (v.observations.maladiesDetectees.length) { doc.text(`Maladies : ${v.observations.maladiesDetectees.join(', ')}`, 18, y); y += 7; }
      if (v.observations.ravageursDetectes.length) { doc.text(`Ravageurs : ${v.observations.ravageursDetectes.join(', ')}`, 18, y); y += 7; }
      y += 6;

      if (v.recommandations.length) {
        doc.setFontSize(12);
        doc.setTextColor(30);
        doc.text('Recommandations', 14, y); y += 8;
        doc.setFontSize(10);
        doc.setTextColor(60);
        v.recommandations.forEach(r => {
          doc.text(`[${r.priorite}] ${r.description}`, 18, y); y += 7;
        });
      }

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Petalia Farm OS — Rapport auto-généré', 14, 285);

      doc.save(`Rapport_Visite_${v.id}.pdf`);
    });
  }
}
