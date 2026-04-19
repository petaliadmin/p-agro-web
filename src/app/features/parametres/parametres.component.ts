import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/shared-components';
import { ToastService } from '../../core/services/toast.service';
import { ThemeService, ThemeMode } from '../../core/services/theme.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Paramètres" subtitle="Personnalisez votre expérience"></app-page-header>

    <div class="max-w-2xl space-y-6">
      <!-- Notifications -->
      <div class="card p-6">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span class="material-icons text-[18px] text-gray-500 dark:text-gray-400" aria-hidden="true">notifications</span>
          Préférences de notifications
        </h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Alertes stock critique</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Recevoir une notification quand un intrant passe sous le seuil</p>
            </div>
            <button (click)="prefs.alerteStock = !prefs.alerteStock"
              class="relative w-11 h-6 rounded-full transition-colors" [ngClass]="prefs.alerteStock ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'"
              [attr.aria-label]="'Alertes stock critique : ' + (prefs.alerteStock ? 'activé' : 'désactivé')" role="switch" [attr.aria-checked]="prefs.alerteStock">
              <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                [class.translate-x-5]="prefs.alerteStock" [class.translate-x-0.5]="!prefs.alerteStock"></span>
            </button>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Visites planifiées</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Rappel avant les visites terrain prévues</p>
            </div>
            <button (click)="prefs.rappelVisite = !prefs.rappelVisite"
              class="relative w-11 h-6 rounded-full transition-colors" [ngClass]="prefs.rappelVisite ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'"
              [attr.aria-label]="'Visites planifiées : ' + (prefs.rappelVisite ? 'activé' : 'désactivé')" role="switch" [attr.aria-checked]="prefs.rappelVisite">
              <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                [class.translate-x-5]="prefs.rappelVisite" [class.translate-x-0.5]="!prefs.rappelVisite"></span>
            </button>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Tâches en retard</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Alerte quand une tâche dépasse sa date de fin</p>
            </div>
            <button (click)="prefs.alerteTache = !prefs.alerteTache"
              class="relative w-11 h-6 rounded-full transition-colors" [ngClass]="prefs.alerteTache ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'"
              [attr.aria-label]="'Tâches en retard : ' + (prefs.alerteTache ? 'activé' : 'désactivé')" role="switch" [attr.aria-checked]="prefs.alerteTache">
              <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                [class.translate-x-5]="prefs.alerteTache" [class.translate-x-0.5]="!prefs.alerteTache"></span>
            </button>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Rapports hebdomadaires</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Résumé automatique chaque lundi matin</p>
            </div>
            <button (click)="prefs.rapportHebdo = !prefs.rapportHebdo"
              class="relative w-11 h-6 rounded-full transition-colors" [ngClass]="prefs.rapportHebdo ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'"
              [attr.aria-label]="'Rapports hebdomadaires : ' + (prefs.rapportHebdo ? 'activé' : 'désactivé')" role="switch" [attr.aria-checked]="prefs.rapportHebdo">
              <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                [class.translate-x-5]="prefs.rapportHebdo" [class.translate-x-0.5]="!prefs.rapportHebdo"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Langue -->
      <div class="card p-6">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span class="material-icons text-[18px] text-gray-500 dark:text-gray-400" aria-hidden="true">language</span>
          Langue
        </h3>
        <select [(ngModel)]="prefs.langue"
          class="text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 w-full max-w-xs">
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="wo">Wolof</option>
        </select>
      </div>

      <!-- Thème -->
      <div class="card p-6">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span class="material-icons text-[18px] text-gray-500 dark:text-gray-400" aria-hidden="true">palette</span>
          Apparence
        </h3>
        <div class="flex gap-3">
          <button *ngFor="let t of themes" (click)="setTheme(t.id)"
            class="flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all"
            [ngClass]="prefs.theme === t.id
              ? 'border-primary-600 bg-primary-50'
              : 'border-gray-200 dark:border-gray-600'"
            [attr.aria-label]="'Thème ' + t.label">
            <span class="material-icons text-[24px]" aria-hidden="true" [class.text-primary-600]="prefs.theme === t.id" [class.text-gray-500]="prefs.theme !== t.id">{{ t.icon }}</span>
            <span class="text-xs font-medium" [ngClass]="prefs.theme === t.id ? 'text-primary-700' : 'text-gray-600 dark:text-gray-300'">{{ t.label }}</span>
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end">
        <button (click)="save()" class="btn-primary text-sm flex items-center gap-2">
          <span class="material-icons text-[16px]" aria-hidden="true">save</span> Enregistrer les préférences
        </button>
      </div>
    </div>
  `,
})
export class ParametresComponent implements OnInit {
  private themeService = inject(ThemeService);
  private settingsService = inject(SettingsService);

  prefs = {
    alerteStock: true,
    rappelVisite: true,
    alerteTache: true,
    rapportHebdo: false,
    langue: 'fr',
    theme: 'light' as string,
  };

  themes = [
    { id: 'light', label: 'Clair', icon: 'light_mode' },
    { id: 'dark', label: 'Sombre', icon: 'dark_mode' },
    { id: 'system', label: 'Système', icon: 'settings_brightness' },
  ];

  constructor(private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Charger les préférences sauvegardées
    const saved = this.settingsService.getAll();
    this.prefs = { ...this.prefs, ...saved };
    this.prefs.theme = this.themeService.mode();
  }

  setTheme(themeId: string): void {
    this.prefs.theme = themeId;
    this.themeService.setMode(themeId as ThemeMode);
  }

  save(): void {
    this.settingsService.saveAll(this.prefs);
    this.themeService.setMode(this.prefs.theme as ThemeMode);
    this.toast.success('Préférences enregistrées avec succès');
    this.cdr.markForCheck();
  }
}
