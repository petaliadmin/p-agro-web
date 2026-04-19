import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  PlanificationService,
  FicheTechnique,
  EstimationIntrants,
  EstimationMainOeuvre,
  BudgetPrevisionnel,
  AlerteProactive,
  InterventionCalendrier,
  PlanificationParams,
  FICHES_TECHNIQUES,
} from '../../core/services/planification.service';
import { ParcelleService } from '../../core/services/parcelle.service';
import { CampagneService } from '../../core/services/campagne.service';
import { ToastService } from '../../core/services/toast.service';
import { Parcelle, CultureType, TypeCampagne } from '../../core/models/parcelle.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-planification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Planification & Recommandations</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Planifiez vos campagnes, estimez les besoins et suivez les interventions</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="flex gap-6 -mb-px" role="tablist">
        <button *ngFor="let tab of tabs"
          (click)="activeTab = tab.id"
          [ngClass]="activeTab === tab.id
            ? 'border-green-600 text-green-700 dark:text-green-400'
            : 'border-transparent text-gray-500'"
          class="flex items-center gap-2 pb-3 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap"
          [attr.aria-selected]="activeTab === tab.id"
          role="tab">
          <span class="material-icons text-[18px]" aria-hidden="true">{{ tab.icon }}</span>
          {{ tab.label }}
          <span *ngIf="tab.id === 'alertes' && alertes.length > 0"
            class="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
            {{ alertes.length }}
          </span>
        </button>
      </nav>
    </div>

    <!-- ═══════ TAB: Planifier une campagne ═══════ -->
    <div *ngIf="activeTab === 'planifier'" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Formulaire -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-green-600" aria-hidden="true">event_note</span>
            Nouvelle campagne
          </h2>

          <div class="space-y-4">
            <!-- Parcelle -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parcelle *</label>
              <select [(ngModel)]="form.parcelleId" (ngModelChange)="onParcelleChange()"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Sélectionner une parcelle</option>
                <option *ngFor="let p of parcelles" [value]="p.id">{{ p.nom }} — {{ p.superficie }} ha ({{ p.culture }})</option>
              </select>
            </div>

            <!-- Culture -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Culture *</label>
              <select [(ngModel)]="form.culture" (ngModelChange)="onCultureChange()"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Sélectionner une culture</option>
                <option *ngFor="let c of cultures" [value]="c.value">{{ c.emoji }} {{ c.label }}</option>
              </select>
            </div>

            <!-- Variété -->
            <div *ngIf="ficheActive">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Variété recommandée</label>
              <select [(ngModel)]="form.variete"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">Sélectionner une variété</option>
                <option *ngFor="let v of ficheActive.varietes" [value]="v.nom">
                  {{ v.nom }} — cycle {{ v.cycle }}j, {{ v.rendementPotentiel }} t/ha
                </option>
              </select>
              <p *ngIf="selectedVariete" class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ selectedVariete.description }}</p>
            </div>

            <!-- Type campagne -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de campagne *</label>
              <select [(ngModel)]="form.typeCampagne"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="hivernage">Hivernage</option>
                <option value="contre_saison_froide">Contre-saison froide</option>
                <option value="contre_saison_chaude">Contre-saison chaude</option>
              </select>
            </div>

            <!-- Date semis -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de semis prévue *</label>
              <input type="date" [(ngModel)]="form.dateSemisPrevue"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>

            <!-- Calendrier zone -->
            <div *ngIf="ficheActive" class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <p class="text-xs font-medium text-green-800 dark:text-green-300 mb-1">Calendrier recommandé :</p>
              <div *ngFor="let cal of ficheActive.calendrier" class="text-xs text-green-700 dark:text-green-400">
                {{ cal.zone }} : semis {{ cal.semisDe }}–{{ cal.semisA }}, récolte {{ cal.recolteDe }}–{{ cal.recolteA }}
              </div>
            </div>

            <!-- Bouton estimer -->
            <button (click)="calculerEstimations()"
              [disabled]="!form.parcelleId || !form.culture || !form.dateSemisPrevue"
              class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span class="material-icons text-[18px]" aria-hidden="true">calculate</span>
              Estimer les besoins
            </button>
          </div>
        </div>

        <!-- Résumé budget -->
        <div *ngIf="budget" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-amber-600" aria-hidden="true">account_balance_wallet</span>
            Budget prévisionnel
          </h2>

          <!-- KPIs budget -->
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <p class="text-xs text-blue-600 dark:text-blue-400">Coût intrants</p>
              <p class="text-lg font-bold text-blue-800 dark:text-blue-300">{{ budget.coutIntrants | number:'1.0-0' }} F</p>
            </div>
            <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
              <p class="text-xs text-orange-600 dark:text-orange-400">Main-d'oeuvre</p>
              <p class="text-lg font-bold text-orange-800 dark:text-orange-300">{{ budget.coutMainOeuvre | number:'1.0-0' }} F</p>
            </div>
            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
              <p class="text-xs text-purple-600 dark:text-purple-400">Transport</p>
              <p class="text-lg font-bold text-purple-800 dark:text-purple-300">{{ budget.coutTransport | number:'1.0-0' }} F</p>
            </div>
            <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
              <p class="text-xs text-red-600 dark:text-red-400">Coût total</p>
              <p class="text-lg font-bold text-red-800 dark:text-red-300">{{ budget.coutTotal | number:'1.0-0' }} F</p>
            </div>
          </div>

          <!-- Barre répartition -->
          <div class="mb-4">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Répartition des coûts</p>
            <div class="h-4 rounded-full overflow-hidden flex bg-gray-100 dark:bg-gray-700">
              <div class="bg-blue-500 h-full" [style.width.%]="(budget.coutIntrants / budget.coutTotal) * 100" title="Intrants"></div>
              <div class="bg-orange-500 h-full" [style.width.%]="(budget.coutMainOeuvre / budget.coutTotal) * 100" title="Main-d'oeuvre"></div>
              <div class="bg-purple-500 h-full" [style.width.%]="(budget.coutTransport / budget.coutTotal) * 100" title="Transport"></div>
            </div>
            <div class="flex justify-between mt-1 text-[10px] text-gray-500 dark:text-gray-400">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-500"></span> Intrants</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-orange-500"></span> Main-d'oeuvre</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-purple-500"></span> Transport</span>
            </div>
          </div>

          <!-- Projection -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Projection économique</h3>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Rendement estimé</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ budget.rendementEstime }} t</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Revenu estimé</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ budget.revenuEstime | number:'1.0-0' }} F</span>
            </div>
            <div class="flex justify-between text-sm border-t border-gray-200 dark:border-gray-600 pt-2">
              <span class="font-medium" [class.text-green-600]="budget.margeEstimee > 0" [class.text-red-600]="budget.margeEstimee <= 0">
                Marge estimée
              </span>
              <span class="font-bold" [class.text-green-600]="budget.margeEstimee > 0" [class.text-red-600]="budget.margeEstimee <= 0">
                {{ budget.margeEstimee | number:'1.0-0' }} F
              </span>
            </div>
          </div>

          <!-- Bouton lancer -->
          <button (click)="lancerCampagne()"
            class="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <span class="material-icons text-[18px]" aria-hidden="true">rocket_launch</span>
            Lancer la campagne
          </button>
        </div>
      </div>

      <!-- Détail intrants -->
      <div *ngIf="budget" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Tableau intrants -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span class="material-icons text-blue-600 text-[18px]" aria-hidden="true">inventory_2</span>
            Détail besoins intrants
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th class="pb-2 font-medium">Produit</th>
                  <th class="pb-2 font-medium text-right">Dose/ha</th>
                  <th class="pb-2 font-medium text-right">Total</th>
                  <th class="pb-2 font-medium text-right">Coût (F)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of budget.detailIntrants" class="border-b border-gray-100 dark:border-gray-700/50">
                  <td class="py-2">
                    <p class="font-medium text-gray-900 dark:text-white">{{ item.produit }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.moment }}</p>
                  </td>
                  <td class="py-2 text-right text-gray-600 dark:text-gray-300">{{ item.doseParHa }} {{ item.unite }}</td>
                  <td class="py-2 text-right font-medium text-gray-900 dark:text-white">{{ item.quantiteTotale }} {{ item.unite }}</td>
                  <td class="py-2 text-right font-medium text-blue-600 dark:text-blue-400">{{ item.coutTotal | number:'1.0-0' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="font-semibold text-gray-900 dark:text-white">
                  <td colspan="3" class="pt-2">Total intrants</td>
                  <td class="pt-2 text-right text-blue-700 dark:text-blue-400">{{ budget.coutIntrants | number:'1.0-0' }} F</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Tableau main-d'oeuvre -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span class="material-icons text-orange-600 text-[18px]" aria-hidden="true">engineering</span>
            Détail main-d'oeuvre
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th class="pb-2 font-medium">Étape</th>
                  <th class="pb-2 font-medium text-right">Pers/ha</th>
                  <th class="pb-2 font-medium text-right">Total p-j</th>
                  <th class="pb-2 font-medium text-right">Coût (F)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of budget.detailMainOeuvre" class="border-b border-gray-100 dark:border-gray-700/50">
                  <td class="py-2">
                    <p class="font-medium text-gray-900 dark:text-white">{{ item.etape }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.description }}</p>
                  </td>
                  <td class="py-2 text-right text-gray-600 dark:text-gray-300">{{ item.personnesJour }}</td>
                  <td class="py-2 text-right font-medium text-gray-900 dark:text-white">{{ item.totalPersonnesJour }}</td>
                  <td class="py-2 text-right font-medium text-orange-600 dark:text-orange-400">{{ item.coutTotal | number:'1.0-0' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="font-semibold text-gray-900 dark:text-white">
                  <td colspan="3" class="pt-2">Total main-d'oeuvre</td>
                  <td class="pt-2 text-right text-orange-700 dark:text-orange-400">{{ budget.coutMainOeuvre | number:'1.0-0' }} F</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ TAB: Fiches techniques ═══════ -->
    <div *ngIf="activeTab === 'fiches'" class="space-y-6">
      <!-- Sélecteur culture -->
      <div class="flex flex-wrap gap-2">
        <button *ngFor="let c of cultures"
          (click)="selectFiche(c.value)"
          [ngClass]="ficheCultureActive === c.value
            ? 'bg-green-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'"
          class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20">
          {{ c.emoji }} {{ c.label }}
        </button>
      </div>

      <div *ngIf="ficheDetail" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Info générale -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">{{ ficheDetail.emoji }} {{ ficheDetail.label }}</h3>
          <div class="space-y-3 text-sm">
            <div>
              <p class="font-medium text-gray-700 dark:text-gray-300">Densité de semis</p>
              <p class="text-gray-500 dark:text-gray-400">{{ ficheDetail.densiteSemis }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700 dark:text-gray-300">Écartement</p>
              <p class="text-gray-500 dark:text-gray-400">{{ ficheDetail.ecartement }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700 dark:text-gray-300">Besoins en eau</p>
              <p class="text-gray-500 dark:text-gray-400">{{ ficheDetail.besoinsEau }}</p>
            </div>
          </div>

          <!-- Calendrier -->
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-5 mb-2">Calendrier cultural</h4>
          <div *ngFor="let cal of ficheDetail.calendrier" class="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 mb-2">
            <p class="text-xs font-medium text-green-800 dark:text-green-300">{{ cal.zone }}</p>
            <p class="text-xs text-green-700 dark:text-green-400">Semis : {{ cal.semisDe }} → {{ cal.semisA }}</p>
            <p class="text-xs text-green-700 dark:text-green-400">Récolte : {{ cal.recolteDe }} → {{ cal.recolteA }}</p>
          </div>
        </div>

        <!-- Variétés -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-green-600 text-[18px]" aria-hidden="true">eco</span>
            Variétés recommandées
          </h3>
          <div class="space-y-3">
            <div *ngFor="let v of ficheDetail.varietes" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div class="flex justify-between items-start">
                <p class="font-medium text-gray-900 dark:text-white text-sm">{{ v.nom }}</p>
                <span class="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                  {{ v.rendementPotentiel }} t/ha
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Cycle : {{ v.cycle }} jours</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ v.description }}</p>
            </div>
          </div>
        </div>

        <!-- Doses intrants -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-icons text-blue-600 text-[18px]" aria-hidden="true">science</span>
            Doses recommandées / ha
          </h3>
          <div class="space-y-2">
            <div *ngFor="let d of ficheDetail.dosesIntrants"
              class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ d.produit }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ d.moment }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ d.doseParHa }} {{ d.unite }}/ha</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ d.prixUnitaire | number:'1.0-0' }} F/{{ d.unite }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ TAB: Alertes proactives ═══════ -->
    <div *ngIf="activeTab === 'alertes'" class="space-y-4">
      <div *ngIf="alertes.length === 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
        <span class="material-icons text-5xl text-gray-300 dark:text-gray-600" aria-hidden="true">notifications_off</span>
        <p class="text-gray-500 dark:text-gray-400 mt-3">Aucune alerte pour les 15 prochains jours</p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Les alertes sont générées automatiquement à partir des dates de semis</p>
      </div>

      <div *ngFor="let alerte of alertes"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 p-4 flex items-start gap-4"
        [ngClass]="{
          'border-red-500': alerte.type === 'urgent',
          'border-amber-500': alerte.type === 'action',
          'border-blue-500': alerte.type === 'info',
          'border-gray-100 dark:border-gray-700': true
        }">
        <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          [ngClass]="{
            'bg-red-100 dark:bg-red-900/30': alerte.type === 'urgent',
            'bg-amber-100 dark:bg-amber-900/30': alerte.type === 'action',
            'bg-blue-100 dark:bg-blue-900/30': alerte.type === 'info'
          }">
          <span class="material-icons text-[20px]" aria-hidden="true"
            [class.text-red-600]="alerte.type === 'urgent'"
            [class.text-amber-600]="alerte.type === 'action'"
            [class.text-blue-600]="alerte.type === 'info'">
            {{ alerte.type === 'urgent' ? 'warning' : alerte.type === 'action' ? 'schedule' : 'info' }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <a [routerLink]="['/parcelles', alerte.parcelleId]" class="text-sm font-semibold text-green-700 dark:text-green-400 hover:underline">
              {{ alerte.parcelleNom }}
            </a>
            <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{{ alerte.culture }}</span>
          </div>
          <p class="text-sm text-gray-900 dark:text-white">{{ alerte.message }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Prévu le {{ alerte.datePrevue | date:'d MMMM yyyy':'':'fr' }}
          </p>
        </div>
        <span class="text-xs font-bold px-2 py-1 rounded-full"
          [ngClass]="{
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': alerte.type === 'urgent',
            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': alerte.type === 'action',
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': alerte.type === 'info'
          }">
          {{ alerte.joursRestants <= 0 ? 'En retard' : 'J-' + alerte.joursRestants }}
        </span>
      </div>
    </div>

    <!-- ═══════ TAB: Calendrier ═══════ -->
    <div *ngIf="activeTab === 'calendrier'" class="space-y-4">
      <!-- Filtres -->
      <div class="flex flex-wrap gap-3 items-center">
        <select [(ngModel)]="filtreParcelleCalendrier" (ngModelChange)="chargerCalendrier()"
          class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white">
          <option value="">Toutes les parcelles</option>
          <option *ngFor="let p of parcelles" [value]="p.id">{{ p.nom }}</option>
        </select>
        <div class="flex gap-2">
          <button *ngFor="let f of filtresStatut"
            (click)="filtreStatutCal = f.value; filtrerCalendrier()"
            [ngClass]="filtreStatutCal === f.value
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 transition-colors">
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Timeline calendrier -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div *ngIf="calendrierFiltre.length === 0" class="p-12 text-center">
          <span class="material-icons text-5xl text-gray-300 dark:text-gray-600" aria-hidden="true">event_busy</span>
          <p class="text-gray-500 dark:text-gray-400 mt-3">Aucune intervention planifiée</p>
        </div>

        <div *ngFor="let intervention of calendrierFiltre; let i = index"
          class="flex items-start gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
          <!-- Date -->
          <div class="flex-shrink-0 w-16 text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ intervention.dateDebut | date:'MMM':'':'fr' }}</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ intervention.dateDebut | date:'dd' }}</p>
          </div>

          <!-- Indicateur statut -->
          <div class="flex-shrink-0 mt-1">
            <div class="w-3 h-3 rounded-full"
              [ngClass]="{
                'bg-green-500': intervention.statut === 'passee',
                'bg-amber-500': intervention.statut === 'en_cours',
                'bg-gray-300 dark:bg-gray-600': intervention.statut === 'a_venir'
              }">
            </div>
          </div>

          <!-- Contenu -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ intervention.etape }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ intervention.description }}</p>
            <div class="flex items-center gap-2 mt-1">
              <a [routerLink]="['/parcelles', intervention.parcelleId]" class="text-xs text-green-600 dark:text-green-400 hover:underline">
                {{ intervention.parcelleNom }}
              </a>
              <span class="text-xs text-gray-400 dark:text-gray-500">{{ intervention.culture }}</span>
            </div>
          </div>

          <!-- Badge durée -->
          <div class="flex-shrink-0 text-right">
            <span class="text-xs px-2 py-1 rounded-full"
              [ngClass]="{
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': intervention.statut === 'passee',
                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': intervention.statut === 'en_cours',
                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400': intervention.statut === 'a_venir'
              }">
              {{ intervention.statut === 'passee' ? 'Terminé' : intervention.statut === 'en_cours' ? 'En cours' : 'À venir' }}
            </span>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              {{ intervention.dateDebut | date:'dd/MM' }} → {{ intervention.dateFin | date:'dd/MM' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PlanificationComponent implements OnInit {
  private planificationService: PlanificationService;
  private parcelleService: ParcelleService;
  private campagneService: CampagneService;
  private toastService: ToastService;
  private cdr: ChangeDetectorRef;

  constructor(
    planificationService: PlanificationService,
    parcelleService: ParcelleService,
    campagneService: CampagneService,
    toastService: ToastService,
    cdr: ChangeDetectorRef,
  ) {
    this.planificationService = planificationService;
    this.parcelleService = parcelleService;
    this.campagneService = campagneService;
    this.toastService = toastService;
    this.cdr = cdr;
  }

  activeTab = 'planifier';
  tabs = [
    { id: 'planifier', label: 'Planifier', icon: 'event_note' },
    { id: 'fiches', label: 'Fiches techniques', icon: 'menu_book' },
    { id: 'alertes', label: 'Alertes', icon: 'notifications_active' },
    { id: 'calendrier', label: 'Calendrier', icon: 'calendar_month' },
  ];

  cultures: { value: CultureType; label: string; emoji: string }[] = [
    { value: 'riz', label: 'Riz', emoji: '🌾' },
    { value: 'arachide', label: 'Arachide', emoji: '🥜' },
    { value: 'mais', label: 'Maïs', emoji: '🌽' },
    { value: 'mil', label: 'Mil', emoji: '🌿' },
    { value: 'oignon', label: 'Oignon', emoji: '🧅' },
    { value: 'tomate', label: 'Tomate', emoji: '🍅' },
  ];

  parcelles: Parcelle[] = [];
  form = {
    parcelleId: '',
    culture: '' as CultureType | '',
    variete: '',
    typeCampagne: 'hivernage' as TypeCampagne,
    dateSemisPrevue: '',
  };

  ficheActive: FicheTechnique | null = null;
  budget: BudgetPrevisionnel | null = null;

  // Fiches techniques
  ficheCultureActive: CultureType = 'riz';
  ficheDetail: FicheTechnique | null = null;

  // Alertes
  alertes: AlerteProactive[] = [];

  // Calendrier
  calendrier: InterventionCalendrier[] = [];
  calendrierFiltre: InterventionCalendrier[] = [];
  filtreParcelleCalendrier = '';
  filtreStatutCal = '';
  filtresStatut = [
    { value: '', label: 'Tous' },
    { value: 'a_venir', label: 'À venir' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'passee', label: 'Terminé' },
  ];

  get selectedVariete() {
    if (!this.ficheActive || !this.form.variete) return null;
    return this.ficheActive.varietes.find(v => v.nom === this.form.variete) || null;
  }

  ngOnInit(): void {
    this.parcelleService.getAll().pipe(take(1)).subscribe(p => {
      this.parcelles = p;
      this.cdr.markForCheck();
    });

    this.selectFiche('riz');
    this.chargerAlertes();
    this.chargerCalendrier();
  }

  onParcelleChange(): void {
    const parcelle = this.parcelles.find(p => p.id === this.form.parcelleId);
    if (parcelle) {
      this.form.culture = parcelle.culture;
      this.onCultureChange();
      if (parcelle.typeCampagne) this.form.typeCampagne = parcelle.typeCampagne;
    }
  }

  onCultureChange(): void {
    if (this.form.culture) {
      this.ficheActive = FICHES_TECHNIQUES[this.form.culture as CultureType];
      this.form.variete = '';
    } else {
      this.ficheActive = null;
    }
    this.budget = null;
    this.cdr.markForCheck();
  }

  calculerEstimations(): void {
    if (!this.form.parcelleId || !this.form.culture) return;
    const parcelle = this.parcelles.find(p => p.id === this.form.parcelleId);
    if (!parcelle) return;

    this.planificationService.getBudgetPrevisionnel(
      this.form.culture as CultureType,
      parcelle.superficie,
    ).pipe(take(1)).subscribe(budget => {
      this.budget = budget;
      this.cdr.markForCheck();
    });
  }

  lancerCampagne(): void {
    const parcelle = this.parcelles.find(p => p.id === this.form.parcelleId);
    if (!parcelle || !this.form.culture || !this.form.dateSemisPrevue) return;

    this.campagneService.creerCampagne({
      parcelleId: this.form.parcelleId,
      culture: this.form.culture as CultureType,
      variete: this.form.variete || undefined,
      typeCampagne: this.form.typeCampagne,
      dateSemis: new Date(this.form.dateSemisPrevue),
      equipeId: 'eq001',
    }).pipe(take(1)).subscribe(() => {
      this.toastService.success('Campagne lancée avec succès ! Les tâches ont été générées.');
      this.budget = null;
      this.form = { parcelleId: '', culture: '', variete: '', typeCampagne: 'hivernage', dateSemisPrevue: '' };
      this.ficheActive = null;
      this.chargerCalendrier();
      this.cdr.markForCheck();
    });
  }

  selectFiche(culture: CultureType): void {
    this.ficheCultureActive = culture;
    this.planificationService.getFicheTechnique(culture).pipe(take(1)).subscribe(fiche => {
      this.ficheDetail = fiche;
      this.cdr.markForCheck();
    });
  }

  chargerAlertes(): void {
    this.planificationService.getAlertesProactives().pipe(take(1)).subscribe(alertes => {
      this.alertes = alertes;
      this.cdr.markForCheck();
    });
  }

  chargerCalendrier(): void {
    const parcelleId = this.filtreParcelleCalendrier || undefined;
    this.planificationService.getCalendrierPrevisionnel(parcelleId).pipe(take(1)).subscribe(cal => {
      this.calendrier = cal;
      this.filtrerCalendrier();
      this.cdr.markForCheck();
    });
  }

  filtrerCalendrier(): void {
    this.calendrierFiltre = this.filtreStatutCal
      ? this.calendrier.filter(c => c.statut === this.filtreStatutCal)
      : [...this.calendrier];
    this.cdr.markForCheck();
  }
}
