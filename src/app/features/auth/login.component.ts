import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <!-- Left panel - illustration -->
      <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden" style="background: #1A7A4A;">
        <!-- Motif géométrique SVG -->
        <svg class="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
          <circle cx="100" cy="100" r="200" fill="white"/>
          <circle cx="500" cy="700" r="300" fill="white"/>
          <circle cx="600" cy="200" r="150" fill="white"/>
          <rect x="50" y="400" width="100" height="100" rx="20" fill="white" transform="rotate(30 100 450)"/>
          <rect x="400" y="100" width="80" height="80" rx="15" fill="white" transform="rotate(15 440 140)"/>
        </svg>

        <div class="relative z-10 flex flex-col justify-center px-14 py-12">
          <!-- Logo -->
          <div class="flex items-center gap-3 mb-16">
            <div class="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M17 8c0-2.76-2.24-5-5-5S7 5.24 7 8c0 1.5.66 2.85 1.7 3.79L12 15l3.3-3.21A4.97 4.97 0 0017 8z"/>
                <path d="M12 17l-5 5h10l-5-5z" opacity="0.5"/>
              </svg>
            </div>
            <div>
              <p class="text-white font-bold text-xl">AgroAssist</p>
              <p class="text-white/60 text-sm">Supervision agricole</p>
            </div>
          </div>

          <!-- Illustration SVG agricole -->
          <div class="mb-10">
            <svg viewBox="0 0 400 280" class="w-full max-w-sm" fill="none">
              <!-- Ciel -->
              <rect width="400" height="280" rx="16" fill="white" fill-opacity="0.05"/>
              <!-- Sol -->
              <ellipse cx="200" cy="240" rx="180" ry="20" fill="white" fill-opacity="0.08"/>
              <!-- Plantes de riz stylisées -->
              <g stroke="white" stroke-opacity="0.6" stroke-width="2">
                <line x1="80" y1="200" x2="80" y2="140"/><line x1="80" y1="160" x2="60" y2="130"/><line x1="80" y1="150" x2="100" y2="120"/>
                <line x1="140" y1="200" x2="140" y2="130"/><line x1="140" y1="155" x2="120" y2="120"/><line x1="140" y1="145" x2="160" y2="115"/>
                <line x1="200" y1="200" x2="200" y2="120"/><line x1="200" y1="150" x2="180" y2="110"/><line x1="200" y1="135" x2="220" y2="105"/>
                <line x1="260" y1="200" x2="260" y2="135"/><line x1="260" y1="160" x2="240" y2="125"/><line x1="260" y1="148" x2="280" y2="118"/>
                <line x1="320" y1="200" x2="320" y2="145"/><line x1="320" y1="168" x2="300" y2="135"/><line x1="320" y1="155" x2="340" y2="125"/>
              </g>
              <!-- Soleil -->
              <circle cx="340" cy="60" r="30" fill="white" fill-opacity="0.15"/>
              <circle cx="340" cy="60" r="18" fill="white" fill-opacity="0.25"/>
              <!-- Nuages -->
              <ellipse cx="100" cy="70" rx="40" ry="18" fill="white" fill-opacity="0.1"/>
              <ellipse cx="130" cy="65" rx="30" ry="15" fill="white" fill-opacity="0.1"/>
              <!-- Oiseau -->
              <path d="M180 50 Q190 42 200 50 Q210 42 220 50" stroke="white" stroke-opacity="0.4" stroke-width="1.5" fill="none"/>
            </svg>
          </div>

          <h2 class="text-white text-3xl font-bold leading-tight mb-3">
            Pilotez vos exploitations<br/>depuis partout
          </h2>
          <p class="text-white/70 text-base leading-relaxed max-w-sm">
            Supervision en temps réel, gestion des équipes et traçabilité des intrants pour une agriculture performante au Sénégal.
          </p>

          <!-- Stats rapides -->
          <div class="grid grid-cols-3 gap-4 mt-10">
            <div class="bg-white/10 rounded-xl p-4 text-center">
              <p class="text-white text-2xl font-bold">89ha</p>
              <p class="text-white/60 text-xs mt-0.5">Supervisés</p>
            </div>
            <div class="bg-white/10 rounded-xl p-4 text-center">
              <p class="text-white text-2xl font-bold">8</p>
              <p class="text-white/60 text-xs mt-0.5">Techniciens</p>
            </div>
            <div class="bg-white/10 rounded-xl p-4 text-center">
              <p class="text-white text-2xl font-bold">98%</p>
              <p class="text-white/60 text-xs mt-0.5">Disponibilité</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right panel - formulaire -->
      <div class="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-12">
        <div class="w-full max-w-md">
          <!-- Logo mobile -->
          <div class="flex items-center gap-3 mb-8 lg:hidden">
            <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M17 8c0-2.76-2.24-5-5-5S7 5.24 7 8c0 1.5.66 2.85 1.7 3.79L12 15l3.3-3.21A4.97 4.97 0 0017 8z"/>
              </svg>
            </div>
            <p class="text-primary-600 font-bold text-xl">AgroAssist</p>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Bon retour 👋</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-8">Connectez-vous à votre espace de supervision</p>

          <!-- Alerte erreur -->
          <div *ngIf="errorMsg" role="alert" class="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-5">
            <span class="material-icons text-red-500 text-[18px]" aria-hidden="true">error_outline</span>
            <p class="text-sm text-red-700">{{ errorMsg }}</p>
          </div>

          <!-- Formulaire -->
          <form (ngSubmit)="onLogin()" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Adresse email</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]" aria-hidden="true">email</span>
                <input
                  id="email"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="admin@agroassist.sn"
                  class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mot de passe</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]" aria-hidden="true">lock</span>
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  class="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                />
                <button type="button" (click)="showPassword = !showPassword"
                  class="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600 w-10 h-10 flex items-center justify-center"
                  [attr.aria-label]="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
                  <span class="material-icons text-[18px]" aria-hidden="true">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              [disabled]="loading"
              class="w-full btn-primary py-2.5 flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg *ngIf="loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-live="polite" role="status">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
              </svg>
              {{ loading ? 'Connexion en cours…' : 'Se connecter' }}
            </button>
          </form>

          <!-- Hint credentials -->
          <div class="mt-6 p-4 bg-primary-50 border border-primary-100 rounded-lg">
            <p class="text-xs font-semibold text-primary-700 mb-2">Comptes de démonstration :</p>
            <div class="space-y-1">
              <p class="text-xs text-primary-600"><span class="font-medium">Directeur :</span> admin&#64;agroassist.sn / password</p>
              <p class="text-xs text-primary-600"><span class="font-medium">Superviseur :</span> superviseur&#64;agroassist.sn / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = 'admin@agroassist.sn';
  password = 'password';
  loading = false;
  errorMsg = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  onLogin(): void {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.errorMsg = '';
    this.cdr.markForCheck();

    this.auth.login({ email: this.email, password: this.password }).subscribe(res => {
      this.loading = false;
      if (res.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMsg = res.error ?? 'Erreur de connexion';
      }
      this.cdr.markForCheck();
    });
  }
}
