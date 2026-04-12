import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="text-center max-w-md">
        <div class="mb-8">
          <svg class="mx-auto w-48 h-48 text-orange-200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" stroke="currentColor" stroke-width="4" stroke-dasharray="8 8"/>
            <text x="100" y="90" text-anchor="middle" fill="#D97706" font-size="56" font-weight="bold" font-family="sans-serif">403</text>
            <text x="100" y="120" text-anchor="middle" fill="#6B7280" font-size="14" font-family="sans-serif">Accès interdit</text>
            <!-- Lock icon -->
            <rect x="88" y="138" width="24" height="18" rx="3" fill="#D97706" opacity="0.3"/>
            <path d="M93 138 V132 C93 128 96 125 100 125 C104 125 107 128 107 132 V138" stroke="#D97706" stroke-width="2" fill="none" opacity="0.3"/>
          </svg>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-3">Accès interdit</h1>
        <p class="text-gray-500 mb-8 text-base leading-relaxed">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          Contactez votre administrateur si vous pensez qu'il s'agit d'une erreur.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a routerLink="/dashboard"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm">
            <span class="material-icons text-[20px]" aria-hidden="true">home</span>
            Tableau de bord
          </a>
          <button (click)="goBack()"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-200">
            <span class="material-icons text-[20px]" aria-hidden="true">arrow_back</span>
            Page précédente
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ForbiddenComponent {
  goBack(): void {
    window.history.back();
  }
}
