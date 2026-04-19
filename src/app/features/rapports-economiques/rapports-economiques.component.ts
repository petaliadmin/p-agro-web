import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  RapportTechnicoEconomiqueService,
  BilanCampagne,
  BilanParcelle,
  ComparaisonParcelles,
  ComparaisonCampagnes,
} from '../../core/services/rapport-technico-economique.service';
import { ParcelleService } from '../../core/services/parcelle.service';
import { ToastService } from '../../core/services/toast.service';
import { EconomicReportService, ParcelleEconomicReportData } from '../../core/services/economic-report.service';
import { Parcelle } from '../../core/models/parcelle.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-rapports-economiques',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Header -->
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Rapports Technico-Économiques</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Bilans financiers, rendements et comparaisons de performance</p>
        </div>
        <div class="flex gap-2">
          <button (click)="exportPDF()" [disabled]="!bilanCampagne || generatingPdf" class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
            <span class="material-icons text-[18px]" aria-hidden="true">{{ generatingPdf ? 'hourglass_empty' : 'picture_as_pdf' }}</span>
            {{ generatingPdf ? 'Génération…' : 'Export PDF' }}
          </button>
          <button (click)="exportExcel()" [disabled]="!bilanCampagne" class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
            <span class="material-icons text-[18px]" aria-hidden="true">table_chart</span>
            Export Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="flex gap-6 -mb-px" role="tablist">
        <button *ngFor="let tab of tabs"
          (click)="activeTab = tab.id; onTabChange()"
          [ngClass]="activeTab === tab.id
            ? 'border-green-600 text-green-700 dark:text-green-400'
            : 'border-transparent text-gray-500'"
          class="flex items-center gap-2 pb-3 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap"
          [attr.aria-selected]="activeTab === tab.id" role="tab">
          <span class="material-icons text-[18px]" aria-hidden="true">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- ═══════ TAB: Bilan campagne ═══════ -->
    <div *ngIf="activeTab === 'campagne'" class="space-y-6">
      <!-- KPIs globaux -->
      <div *ngIf="bilanCampagne" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">Investissement total</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white mt-1">{{ bilanCampagne.investissementTotal | number:'1.0-0' }}</p>
          <p class="text-[10px] text-gray-400">FCFA</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">Revenu total</p>
          <p class="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{{ bilanCampagne.revenuTotal | number:'1.0-0' }}</p>
          <p class="text-[10px] text-gray-400">FCFA</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">Marge totale</p>
          <p class="text-xl font-bold mt-1" [class.text-green-600]="bilanCampagne.margeTotale > 0" [class.text-red-600]="bilanCampagne.margeTotale <= 0">
            {{ bilanCampagne.margeTotale | number:'1.0-0' }}
          </p>
          <p class="text-[10px] text-gray-400">FCFA</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">Rentabilité moyenne</p>
          <p class="text-xl font-bold mt-1" [class.text-green-600]="bilanCampagne.rentabiliteMoyenne > 0" [class.text-red-600]="bilanCampagne.rentabiliteMoyenne <= 0">
            {{ bilanCampagne.rentabiliteMoyenne }}%
          </p>
          <p class="text-[10px] text-gray-400">{{ bilanCampagne.nbParcelles }} parcelles · {{ bilanCampagne.superficieTotale }} ha</p>
        </div>
      </div>

      <!-- Résumé secondaire -->
      <div *ngIf="bilanCampagne" class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <p class="text-xs text-blue-600 dark:text-blue-400">Rendement moyen</p>
          <p class="text-lg font-bold text-blue-800 dark:text-blue-300">{{ bilanCampagne.rendementMoyen }} t/ha</p>
        </div>
        <div class="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center">
          <p class="text-xs text-amber-600 dark:text-amber-400">Taux perte moyen</p>
          <p class="text-lg font-bold text-amber-800 dark:text-amber-300">{{ bilanCampagne.tauxPerteMoyen }}%</p>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
          <p class="text-xs text-purple-600 dark:text-purple-400">Superficie totale</p>
          <p class="text-lg font-bold text-purple-800 dark:text-purple-300">{{ bilanCampagne.superficieTotale }} ha</p>
        </div>
      </div>

      <!-- Tableau détaillé par parcelle -->
      <div *ngIf="bilanCampagne" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Détail par parcelle</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                <th class="px-4 py-3 font-medium">Parcelle</th>
                <th class="px-4 py-3 font-medium">Culture</th>
                <th class="px-4 py-3 font-medium text-right">Ha</th>
                <th class="px-4 py-3 font-medium text-right">Investissement</th>
                <th class="px-4 py-3 font-medium text-right">Rendement</th>
                <th class="px-4 py-3 font-medium text-right">Pertes</th>
                <th class="px-4 py-3 font-medium text-right">Revenu</th>
                <th class="px-4 py-3 font-medium text-right">Marge</th>
                <th class="px-4 py-3 font-medium text-right">Rentabilité</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let bp of bilanCampagne.bilansParParcelle"
                class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td class="px-4 py-3">
                  <a [routerLink]="['/parcelles', bp.parcelleId]" class="font-medium text-green-700 dark:text-green-400 hover:underline">
                    {{ bp.parcelleNom }}
                  </a>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300 capitalize">{{ bp.culture }}</td>
                <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{{ bp.superficie }}</td>
                <td class="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">{{ bp.investissementTotal | number:'1.0-0' }}</td>
                <td class="px-4 py-3 text-right">
                  <span class="font-medium text-gray-900 dark:text-white">{{ bp.rendement }} t/ha</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': bp.tauxPerte < 15,
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': bp.tauxPerte >= 15 && bp.tauxPerte < 30,
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': bp.tauxPerte >= 30
                    }">
                    {{ bp.tauxPerte }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">{{ bp.revenuBrut | number:'1.0-0' }}</td>
                <td class="px-4 py-3 text-right font-semibold" [class.text-green-600]="bp.margeBrute > 0" [class.text-red-600]="bp.margeBrute <= 0">
                  {{ bp.margeBrute | number:'1.0-0' }}
                </td>
                <td class="px-4 py-3 text-right">
                  <span class="font-bold" [class.text-green-600]="bp.rentabilite > 0" [class.text-red-600]="bp.rentabilite <= 0">
                    {{ bp.rentabilite }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════ TAB: Bilan par parcelle ═══════ -->
    <div *ngIf="activeTab === 'parcelle'" class="space-y-6">
      <!-- Sélecteur parcelle + export PDF -->
      <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <select [(ngModel)]="selectedParcelleId" (ngModelChange)="chargerBilanParcelle()"
          class="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 min-w-[250px]">
          <option value="">Sélectionner une parcelle</option>
          <option *ngFor="let p of parcelles" [value]="p.id">{{ p.nom }} — {{ p.superficie }} ha ({{ p.culture }})</option>
        </select>
        <button (click)="exportPDFParcelle()" [disabled]="!bilanParcelle || generatingPdfParcelle"
          class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
          <span class="material-icons text-[18px]" aria-hidden="true">{{ generatingPdfParcelle ? 'hourglass_empty' : 'picture_as_pdf' }}</span>
          {{ generatingPdfParcelle ? 'Génération…' : 'PDF parcelle' }}
        </button>
      </div>

      <div *ngIf="bilanParcelle" class="space-y-6">
        <!-- KPIs parcelle -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400">Investissement</p>
            <p class="text-lg font-bold text-gray-900 dark:text-white mt-1">{{ bilanParcelle.investissementTotal | number:'1.0-0' }} F</p>
            <div class="mt-2 space-y-1">
              <div class="flex justify-between text-[10px]">
                <span class="text-gray-400">Intrants</span>
                <span class="text-gray-600 dark:text-gray-300">{{ bilanParcelle.coutIntrants | number:'1.0-0' }} F</span>
              </div>
              <div class="flex justify-between text-[10px]">
                <span class="text-gray-400">Main-d'oeuvre</span>
                <span class="text-gray-600 dark:text-gray-300">{{ bilanParcelle.coutMainOeuvre | number:'1.0-0' }} F</span>
              </div>
              <div class="flex justify-between text-[10px]">
                <span class="text-gray-400">Transport</span>
                <span class="text-gray-600 dark:text-gray-300">{{ bilanParcelle.coutTransport | number:'1.0-0' }} F</span>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400">Rendement</p>
            <p class="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">{{ bilanParcelle.rendement }} t/ha</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">{{ bilanParcelle.quantiteRecoltee | number:'1.0-0' }} kg récoltés</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Qualité : {{ bilanParcelle.qualite }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400">Revenu & Marge</p>
            <p class="text-lg font-bold text-green-600 dark:text-green-400 mt-1">{{ bilanParcelle.revenuBrut | number:'1.0-0' }} F</p>
            <p class="text-sm mt-1" [class.text-green-600]="bilanParcelle.margeBrute > 0" [class.text-red-600]="bilanParcelle.margeBrute <= 0">
              Marge : {{ bilanParcelle.margeBrute | number:'1.0-0' }} F
            </p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <p class="text-xs text-gray-500 dark:text-gray-400">Performance</p>
            <p class="text-lg font-bold mt-1" [class.text-green-600]="bilanParcelle.rentabilite > 0" [class.text-red-600]="bilanParcelle.rentabilite <= 0">
              {{ bilanParcelle.rentabilite }}%
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Coût/kg : {{ bilanParcelle.coutParKg }} F</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Marge/ha : {{ bilanParcelle.margeParHa | number:'1.0-0' }} F</p>
          </div>
        </div>

        <!-- Barre investissement -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Répartition des investissements</h3>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600 dark:text-gray-400">Intrants</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ pctIntrants }}%</span>
              </div>
              <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500 rounded-full transition-all" [style.width.%]="pctIntrants"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600 dark:text-gray-400">Main-d'oeuvre</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ pctMO }}%</span>
              </div>
              <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-orange-500 rounded-full transition-all" [style.width.%]="pctMO"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600 dark:text-gray-400">Transport</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ pctTransport }}%</span>
              </div>
              <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-purple-500 rounded-full transition-all" [style.width.%]="pctTransport"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!bilanParcelle && selectedParcelleId" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
        <span class="material-icons text-5xl text-gray-300 dark:text-gray-600" aria-hidden="true">search_off</span>
        <p class="text-gray-500 dark:text-gray-400 mt-3">Aucune donnée de récolte pour cette parcelle</p>
      </div>
    </div>

    <!-- ═══════ TAB: Comparaison parcelles ═══════ -->
    <div *ngIf="activeTab === 'comparaison'" class="space-y-6">
      <div *ngIf="comparaisonParcelles">
        <!-- Podium -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div *ngIf="comparaisonParcelles.meilleurRendement" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-green-200 dark:border-green-800 p-5 text-center">
            <span class="material-icons text-3xl text-green-500" aria-hidden="true">emoji_events</span>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Meilleur rendement</p>
            <p class="text-lg font-bold text-gray-900 dark:text-white">{{ comparaisonParcelles.meilleurRendement.parcelleNom }}</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ comparaisonParcelles.meilleurRendement.rendement }} t/ha</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ comparaisonParcelles.meilleurRendement.culture }}</p>
          </div>
          <div *ngIf="comparaisonParcelles.meilleureRentabilite" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-blue-200 dark:border-blue-800 p-5 text-center">
            <span class="material-icons text-3xl text-blue-500" aria-hidden="true">trending_up</span>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Meilleure rentabilité</p>
            <p class="text-lg font-bold text-gray-900 dark:text-white">{{ comparaisonParcelles.meilleureRentabilite.parcelleNom }}</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ comparaisonParcelles.meilleureRentabilite.rentabilite }}%</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Marge : {{ comparaisonParcelles.meilleureRentabilite.margeBrute | number:'1.0-0' }} F</p>
          </div>
          <div *ngIf="comparaisonParcelles.moinsBonRendement" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-amber-200 dark:border-amber-800 p-5 text-center">
            <span class="material-icons text-3xl text-amber-500" aria-hidden="true">priority_high</span>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">À améliorer</p>
            <p class="text-lg font-bold text-gray-900 dark:text-white">{{ comparaisonParcelles.moinsBonRendement.parcelleNom }}</p>
            <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ comparaisonParcelles.moinsBonRendement.rendement }} t/ha</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Pertes : {{ comparaisonParcelles.moinsBonRendement.tauxPerte }}%</p>
          </div>
        </div>

        <!-- Tableau croisé -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Tableau comparatif croisé</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                  <th class="px-4 py-3 font-medium">Parcelle</th>
                  <th class="px-4 py-3 font-medium text-right">Superficie</th>
                  <th class="px-4 py-3 font-medium text-right">Rendement</th>
                  <th class="px-4 py-3 font-medium text-right">Invest./ha</th>
                  <th class="px-4 py-3 font-medium text-right">Marge/ha</th>
                  <th class="px-4 py-3 font-medium text-right">Coût/kg</th>
                  <th class="px-4 py-3 font-medium text-right">Rentabilité</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let bp of comparaisonParcelles.parcelles"
                  class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td class="px-4 py-3">
                    <p class="font-medium text-gray-900 dark:text-white">{{ bp.parcelleNom }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ bp.culture }}</p>
                  </td>
                  <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{{ bp.superficie }} ha</td>
                  <td class="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{{ bp.rendement }} t/ha</td>
                  <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {{ (bp.investissementTotal / bp.superficie) | number:'1.0-0' }} F
                  </td>
                  <td class="px-4 py-3 text-right font-medium" [class.text-green-600]="bp.margeParHa > 0" [class.text-red-600]="bp.margeParHa <= 0">
                    {{ bp.margeParHa | number:'1.0-0' }} F
                  </td>
                  <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{{ bp.coutParKg }} F</td>
                  <td class="px-4 py-3 text-right">
                    <span class="font-bold px-2 py-0.5 rounded-full text-xs"
                      [ngClass]="{
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': bp.rentabilite > 50,
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': bp.rentabilite > 0 && bp.rentabilite <= 50,
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': bp.rentabilite <= 0
                      }">
                      {{ bp.rentabilite }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ TAB: Comparaison campagnes ═══════ -->
    <div *ngIf="activeTab === 'evolution'" class="space-y-6">
      <div *ngIf="comparaisonCampagnes">
        <!-- Évolution KPIs -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400">Rendement</p>
            <div class="flex items-center justify-center gap-1 mt-1">
              <span class="material-icons text-[16px]" [class.text-green-500]="comparaisonCampagnes.evolutionRendement > 0" [class.text-red-500]="comparaisonCampagnes.evolutionRendement < 0" aria-hidden="true">
                {{ comparaisonCampagnes.evolutionRendement >= 0 ? 'trending_up' : 'trending_down' }}
              </span>
              <span class="text-lg font-bold" [class.text-green-600]="comparaisonCampagnes.evolutionRendement > 0" [class.text-red-600]="comparaisonCampagnes.evolutionRendement < 0">
                {{ comparaisonCampagnes.evolutionRendement > 0 ? '+' : '' }}{{ comparaisonCampagnes.evolutionRendement }}%
              </span>
            </div>
            <p class="text-[10px] text-gray-400 mt-1">
              {{ comparaisonCampagnes.campagneN1.rendementMoyen }} → {{ comparaisonCampagnes.campagneN.rendementMoyen }} t/ha
            </p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400">Revenu</p>
            <div class="flex items-center justify-center gap-1 mt-1">
              <span class="material-icons text-[16px]" [class.text-green-500]="comparaisonCampagnes.evolutionRevenu > 0" [class.text-red-500]="comparaisonCampagnes.evolutionRevenu < 0" aria-hidden="true">
                {{ comparaisonCampagnes.evolutionRevenu >= 0 ? 'trending_up' : 'trending_down' }}
              </span>
              <span class="text-lg font-bold" [class.text-green-600]="comparaisonCampagnes.evolutionRevenu > 0" [class.text-red-600]="comparaisonCampagnes.evolutionRevenu < 0">
                {{ comparaisonCampagnes.evolutionRevenu > 0 ? '+' : '' }}{{ comparaisonCampagnes.evolutionRevenu }}%
              </span>
            </div>
            <p class="text-[10px] text-gray-400 mt-1">
              {{ comparaisonCampagnes.campagneN1.revenuTotal | number:'1.0-0' }} → {{ comparaisonCampagnes.campagneN.revenuTotal | number:'1.0-0' }} F
            </p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400">Marge</p>
            <div class="flex items-center justify-center gap-1 mt-1">
              <span class="material-icons text-[16px]" [class.text-green-500]="comparaisonCampagnes.evolutionMarge > 0" [class.text-red-500]="comparaisonCampagnes.evolutionMarge < 0" aria-hidden="true">
                {{ comparaisonCampagnes.evolutionMarge >= 0 ? 'trending_up' : 'trending_down' }}
              </span>
              <span class="text-lg font-bold" [class.text-green-600]="comparaisonCampagnes.evolutionMarge > 0" [class.text-red-600]="comparaisonCampagnes.evolutionMarge < 0">
                {{ comparaisonCampagnes.evolutionMarge > 0 ? '+' : '' }}{{ comparaisonCampagnes.evolutionMarge }}%
              </span>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 text-center">
            <p class="text-xs text-gray-500 dark:text-gray-400">Pertes</p>
            <div class="flex items-center justify-center gap-1 mt-1">
              <span class="material-icons text-[16px]" [class.text-green-500]="comparaisonCampagnes.evolutionPertes < 0" [class.text-red-500]="comparaisonCampagnes.evolutionPertes > 0" aria-hidden="true">
                {{ comparaisonCampagnes.evolutionPertes <= 0 ? 'trending_down' : 'trending_up' }}
              </span>
              <span class="text-lg font-bold" [class.text-green-600]="comparaisonCampagnes.evolutionPertes < 0" [class.text-red-600]="comparaisonCampagnes.evolutionPertes > 0">
                {{ comparaisonCampagnes.evolutionPertes > 0 ? '+' : '' }}{{ comparaisonCampagnes.evolutionPertes }} pts
              </span>
            </div>
            <p class="text-[10px] text-gray-400 mt-1">
              {{ comparaisonCampagnes.campagneN1.tauxPerteMoyen }}% → {{ comparaisonCampagnes.campagneN.tauxPerteMoyen }}%
            </p>
          </div>
        </div>

        <!-- Tableau comparaison n vs n-1 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ comparaisonCampagnes.campagneN1.periode }} vs {{ comparaisonCampagnes.campagneN.periode }}
            </h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                  <th class="px-4 py-3 font-medium">Indicateur</th>
                  <th class="px-4 py-3 font-medium text-right">{{ comparaisonCampagnes.campagneN1.periode }}</th>
                  <th class="px-4 py-3 font-medium text-right">{{ comparaisonCampagnes.campagneN.periode }}</th>
                  <th class="px-4 py-3 font-medium text-right">Évolution</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-gray-100 dark:border-gray-700/50">
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">Parcelles</td>
                  <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{{ comparaisonCampagnes.campagneN1.nbParcelles }}</td>
                  <td class="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">{{ comparaisonCampagnes.campagneN.nbParcelles }}</td>
                  <td class="px-4 py-3 text-right text-gray-500">—</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-700/50">
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">Superficie (ha)</td>
                  <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{{ comparaisonCampagnes.campagneN1.superficieTotale }}</td>
                  <td class="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">{{ comparaisonCampagnes.campagneN.superficieTotale }}</td>
                  <td class="px-4 py-3 text-right text-gray-500">—</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-700/50">
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">Investissement (FCFA)</td>
                  <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{{ comparaisonCampagnes.campagneN1.investissementTotal | number:'1.0-0' }}</td>
                  <td class="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">{{ comparaisonCampagnes.campagneN.investissementTotal | number:'1.0-0' }}</td>
                  <td class="px-4 py-3 text-right text-gray-500">—</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-700/50">
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">Rendement moyen (t/ha)</td>
                  <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{{ comparaisonCampagnes.campagneN1.rendementMoyen }}</td>
                  <td class="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">{{ comparaisonCampagnes.campagneN.rendementMoyen }}</td>
                  <td class="px-4 py-3 text-right font-bold" [class.text-green-600]="comparaisonCampagnes.evolutionRendement > 0" [class.text-red-600]="comparaisonCampagnes.evolutionRendement < 0">
                    {{ comparaisonCampagnes.evolutionRendement > 0 ? '+' : '' }}{{ comparaisonCampagnes.evolutionRendement }}%
                  </td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-700/50">
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">Revenu total (FCFA)</td>
                  <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{{ comparaisonCampagnes.campagneN1.revenuTotal | number:'1.0-0' }}</td>
                  <td class="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">{{ comparaisonCampagnes.campagneN.revenuTotal | number:'1.0-0' }}</td>
                  <td class="px-4 py-3 text-right font-bold" [class.text-green-600]="comparaisonCampagnes.evolutionRevenu > 0" [class.text-red-600]="comparaisonCampagnes.evolutionRevenu < 0">
                    {{ comparaisonCampagnes.evolutionRevenu > 0 ? '+' : '' }}{{ comparaisonCampagnes.evolutionRevenu }}%
                  </td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-700/50">
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">Marge totale (FCFA)</td>
                  <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{{ comparaisonCampagnes.campagneN1.margeTotale | number:'1.0-0' }}</td>
                  <td class="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">{{ comparaisonCampagnes.campagneN.margeTotale | number:'1.0-0' }}</td>
                  <td class="px-4 py-3 text-right font-bold" [class.text-green-600]="comparaisonCampagnes.evolutionMarge > 0" [class.text-red-600]="comparaisonCampagnes.evolutionMarge < 0">
                    {{ comparaisonCampagnes.evolutionMarge > 0 ? '+' : '' }}{{ comparaisonCampagnes.evolutionMarge }}%
                  </td>
                </tr>
                <tr>
                  <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">Taux perte moyen</td>
                  <td class="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{{ comparaisonCampagnes.campagneN1.tauxPerteMoyen }}%</td>
                  <td class="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">{{ comparaisonCampagnes.campagneN.tauxPerteMoyen }}%</td>
                  <td class="px-4 py-3 text-right font-bold" [class.text-green-600]="comparaisonCampagnes.evolutionPertes < 0" [class.text-red-600]="comparaisonCampagnes.evolutionPertes > 0">
                    {{ comparaisonCampagnes.evolutionPertes > 0 ? '+' : '' }}{{ comparaisonCampagnes.evolutionPertes }} pts
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Export modal -->
    <div *ngIf="showExportPreview" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="showExportPreview = false">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ exportTitle }}</h3>
          <button (click)="showExportPreview = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Fermer">
            <span class="material-icons" aria-hidden="true">close</span>
          </button>
        </div>
        <div class="flex-1 overflow-auto p-6">
          <pre class="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 rounded-lg p-4">{{ exportContent }}</pre>
        </div>
        <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button (click)="telechargerExport()" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <span class="material-icons text-[18px]" aria-hidden="true">download</span>
            Télécharger
          </button>
        </div>
      </div>
    </div>
  `,
})
export class RapportsEconomiquesComponent implements OnInit {
  private rapportService: RapportTechnicoEconomiqueService;
  private parcelleService: ParcelleService;
  private toastService: ToastService;
  private economicReportService: EconomicReportService;
  private cdr: ChangeDetectorRef;

  constructor(
    rapportService: RapportTechnicoEconomiqueService,
    parcelleService: ParcelleService,
    toastService: ToastService,
    economicReportService: EconomicReportService,
    cdr: ChangeDetectorRef,
  ) {
    this.rapportService = rapportService;
    this.parcelleService = parcelleService;
    this.toastService = toastService;
    this.economicReportService = economicReportService;
    this.cdr = cdr;
  }

  activeTab = 'campagne';
  tabs = [
    { id: 'campagne', label: 'Bilan campagne', icon: 'assessment' },
    { id: 'parcelle', label: 'Bilan parcelle', icon: 'grass' },
    { id: 'comparaison', label: 'Comparaison parcelles', icon: 'compare' },
    { id: 'evolution', label: 'Évolution n/n-1', icon: 'timeline' },
  ];

  parcelles: Parcelle[] = [];
  bilanCampagne: BilanCampagne | null = null;
  bilanParcelle: BilanParcelle | null = null;
  comparaisonParcelles: ComparaisonParcelles | null = null;
  comparaisonCampagnes: ComparaisonCampagnes | null = null;

  selectedParcelleId = '';

  // Export
  showExportPreview = false;
  exportContent = '';
  exportTitle = '';
  exportFilename = '';
  generatingPdf = false;
  generatingPdfParcelle = false;

  // Pourcentages pour le bilan parcelle
  get pctIntrants(): number {
    return this.bilanParcelle && this.bilanParcelle.investissementTotal > 0
      ? Math.round((this.bilanParcelle.coutIntrants / this.bilanParcelle.investissementTotal) * 100) : 0;
  }
  get pctMO(): number {
    return this.bilanParcelle && this.bilanParcelle.investissementTotal > 0
      ? Math.round((this.bilanParcelle.coutMainOeuvre / this.bilanParcelle.investissementTotal) * 100) : 0;
  }
  get pctTransport(): number {
    return this.bilanParcelle && this.bilanParcelle.investissementTotal > 0
      ? Math.round((this.bilanParcelle.coutTransport / this.bilanParcelle.investissementTotal) * 100) : 0;
  }

  ngOnInit(): void {
    this.parcelleService.getAll().pipe(take(1)).subscribe(p => {
      this.parcelles = p;
      this.cdr.markForCheck();
    });

    this.chargerBilanCampagne();
    this.chargerComparaisonParcelles();
    this.chargerComparaisonCampagnes();
  }

  onTabChange(): void {
    // données sont déjà chargées au init
  }

  chargerBilanCampagne(): void {
    this.rapportService.getBilanCampagne().pipe(take(1)).subscribe(bilan => {
      this.bilanCampagne = bilan;
      this.cdr.markForCheck();
    });
  }

  chargerBilanParcelle(): void {
    if (!this.selectedParcelleId) {
      this.bilanParcelle = null;
      this.cdr.markForCheck();
      return;
    }
    this.rapportService.getBilanParcelle(this.selectedParcelleId).pipe(take(1)).subscribe(bilan => {
      this.bilanParcelle = bilan;
      this.cdr.markForCheck();
    });
  }

  chargerComparaisonParcelles(): void {
    this.rapportService.getComparaisonParcelles().pipe(take(1)).subscribe(comp => {
      this.comparaisonParcelles = comp;
      this.cdr.markForCheck();
    });
  }

  chargerComparaisonCampagnes(): void {
    const annee = new Date().getFullYear();
    this.rapportService.getComparaisonCampagnes(annee).pipe(take(1)).subscribe(comp => {
      this.comparaisonCampagnes = comp;
      this.cdr.markForCheck();
    });
  }

  async exportPDF(): Promise<void> {
    if (!this.bilanCampagne || this.generatingPdf) return;
    this.generatingPdf = true;
    this.cdr.markForCheck();
    try {
      await this.economicReportService.generateEconomicReport({
        bilan: this.bilanCampagne,
        comparaisonParcelles: this.comparaisonParcelles,
        comparaisonCampagnes: this.comparaisonCampagnes,
      });
      this.toastService.success('Rapport PDF généré');
    } catch (err) {
      console.error('[rapports-economiques] PDF error', err);
      this.toastService.error('Erreur lors de la génération du PDF');
    } finally {
      this.generatingPdf = false;
      this.cdr.markForCheck();
    }
  }

  async exportPDFParcelle(): Promise<void> {
    if (!this.bilanParcelle || this.generatingPdfParcelle) return;
    this.generatingPdfParcelle = true;
    this.cdr.markForCheck();
    try {
      const payload: ParcelleEconomicReportData = {
        bilanParcelle: this.bilanParcelle,
        periode: this.bilanCampagne?.periode || new Date().getFullYear().toString(),
        ranking: this.buildParcelleRanking(this.bilanParcelle.parcelleId),
      };
      await this.economicReportService.generateParcelleEconomicReport(payload);
      this.toastService.success('Rapport PDF parcelle généré');
    } catch (err) {
      console.error('[rapports-economiques] PDF parcelle error', err);
      this.toastService.error('Erreur lors de la génération du PDF parcelle');
    } finally {
      this.generatingPdfParcelle = false;
      this.cdr.markForCheck();
    }
  }

  private buildParcelleRanking(parcelleId: string): ParcelleEconomicReportData['ranking'] {
    const all = this.bilanCampagne?.bilansParParcelle;
    if (!all || all.length === 0) return null;

    const byRent = [...all].sort((a, b) => b.rentabilite - a.rentabilite);
    const byRend = [...all].sort((a, b) => b.rendement - a.rendement);
    const rangRentabilite = byRent.findIndex(b => b.parcelleId === parcelleId) + 1;
    const rangRendement = byRend.findIndex(b => b.parcelleId === parcelleId) + 1;

    const moyenne = (arr: number[]): number =>
      arr.length ? Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 100) / 100 : 0;

    return {
      rangRentabilite: rangRentabilite || all.length,
      rangRendement: rangRendement || all.length,
      totalParcelles: all.length,
      moyenneRentabilite: moyenne(all.map(b => b.rentabilite)),
      moyenneRendement: moyenne(all.map(b => b.rendement)),
      moyenneMargeParHa: Math.round(moyenne(all.map(b => b.margeParHa))),
    };
  }

  exportExcel(): void {
    if (!this.bilanCampagne) return;
    this.rapportService.genererExcelBilan(this.bilanCampagne).pipe(take(1)).subscribe(content => {
      this.exportContent = content;
      this.exportTitle = 'Export Excel (CSV)';
      this.exportFilename = `bilan_technico_economique_${new Date().toISOString().split('T')[0]}.csv`;
      this.showExportPreview = true;
      this.cdr.markForCheck();
    });
  }

  telechargerExport(): void {
    const blob = new Blob([this.exportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.exportFilename;
    a.click();
    window.URL.revokeObjectURL(url);
    this.showExportPreview = false;
    this.toastService.success('Fichier téléchargé avec succès');
  }
}
