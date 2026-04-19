import { Component, inject, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { ToastComponent } from './shared/components/toast.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, CommonModule],
  template: `
    <!-- Offline banner -->
    <div *ngIf="isOffline()" class="fixed top-0 left-0 right-0 z-[10000] bg-amber-600 text-white px-4 py-2.5 flex items-center justify-center gap-2 shadow-lg animate-slideDown" role="alert">
      <span class="material-icons text-[18px] animate-pulse" aria-hidden="true">wifi_off</span>
      <span class="text-sm font-medium">Vous êtes hors connexion — les données affichées peuvent ne pas être à jour</span>
    </div>

    <!-- Online restored banner -->
    <div *ngIf="showOnlineRestored()" class="fixed top-0 left-0 right-0 z-[10000] bg-green-600 text-white px-4 py-2.5 flex items-center justify-center gap-2 shadow-lg animate-slideDown" role="status">
      <span class="material-icons text-[18px]" aria-hidden="true">wifi</span>
      <span class="text-sm font-medium">Connexion rétablie</span>
    </div>

    <!-- SW Update banner -->
    <div *ngIf="showUpdateBanner" class="fixed top-0 left-0 right-0 z-[9999] bg-primary-600 text-white px-4 py-3 flex items-center justify-between shadow-lg"
      [class.mt-10]="isOffline()">
      <div class="flex items-center gap-2">
        <span class="material-icons text-[20px]" aria-hidden="true">system_update</span>
        <span class="text-sm font-medium">Une nouvelle version d'Petalia Farm OS est disponible.</span>
      </div>
      <button (click)="updateApp()" class="bg-white text-primary-700 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-50 transition-colors">
        Mettre à jour
      </button>
    </div>

    <!-- PWA Install prompt -->
    <div *ngIf="showInstallPrompt()" class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[9999] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-slideUp">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
          <span class="text-2xl">🌾</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 dark:text-white">Installer Petalia Farm OS</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Accédez à l'application depuis votre écran d'accueil, même hors connexion.</p>
        </div>
        <button (click)="dismissInstall()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Fermer">
          <span class="material-icons text-[18px]" aria-hidden="true">close</span>
        </button>
      </div>
      <div class="flex gap-2 mt-3">
        <button (click)="dismissInstall()" class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          Plus tard
        </button>
        <button (click)="installApp()" class="flex-1 px-3 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
          Installer
        </button>
      </div>
    </div>

    <router-outlet></router-outlet>
    <app-toast></app-toast>
  `,
  styles: [`
    @keyframes slideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-slideDown { animation: slideDown 0.3s ease-out; }
    .animate-slideUp { animation: slideUp 0.3s ease-out; }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  private theme = inject(ThemeService);
  private swUpdate = inject(SwUpdate, { optional: true });
  showUpdateBanner = false;

  isOffline = signal(!navigator.onLine);
  showOnlineRestored = signal(false);
  showInstallPrompt = signal(false);
  private deferredPrompt: any = null;
  private onlineRestoredTimeout: ReturnType<typeof setTimeout> | null = null;

  @HostListener('window:online')
  onOnline(): void {
    this.isOffline.set(false);
    this.showOnlineRestored.set(true);
    this.onlineRestoredTimeout = setTimeout(() => this.showOnlineRestored.set(false), 3000);
  }

  @HostListener('window:offline')
  onOffline(): void {
    this.isOffline.set(true);
    this.showOnlineRestored.set(false);
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: Event): void {
    event.preventDefault();
    this.deferredPrompt = event;
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (!dismissed) {
      setTimeout(() => this.showInstallPrompt.set(true), 5000);
    }
  }

  ngOnInit(): void {
    if (this.swUpdate?.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(event => {
        if (event.type === 'VERSION_READY') {
          this.showUpdateBanner = true;
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.onlineRestoredTimeout) {
      clearTimeout(this.onlineRestoredTimeout);
    }
  }

  updateApp(): void {
    document.location.reload();
  }

  async installApp(): Promise<void> {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const result = await this.deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      this.showInstallPrompt.set(false);
    }
    this.deferredPrompt = null;
  }

  dismissInstall(): void {
    this.showInstallPrompt.set(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    this.deferredPrompt = null;
  }
}
