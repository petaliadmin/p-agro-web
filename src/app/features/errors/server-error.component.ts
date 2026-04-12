import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="text-center max-w-md">
        <div class="mb-8">
          <svg class="mx-auto w-48 h-48 text-red-200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" stroke="currentColor" stroke-width="4" stroke-dasharray="8 8"/>
            <text x="100" y="90" text-anchor="middle" fill="#DC2626" font-size="56" font-weight="bold" font-family="sans-serif">500</text>
            <text x="100" y="120" text-anchor="middle" fill="#6B7280" font-size="14" font-family="sans-serif">Erreur serveur</text>
            <!-- Warning triangle -->
            <path d="M100 135 L90 152 L110 152 Z" fill="#DC2626" opacity="0.3"/>
            <text x="100" y="150" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="sans-serif">!</text>
          </svg>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-3">Erreur serveur</h1>
        <p class="text-gray-500 mb-8 text-base leading-relaxed">
          Une erreur interne est survenue. Notre équipe a été notifiée.
          Veuillez réessayer dans quelques instants.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button (click)="retry()"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm">
            <span class="material-icons text-[20px]" aria-hidden="true">refresh</span>
            Réessayer
          </button>
          <a routerLink="/dashboard"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-200">
            <span class="material-icons text-[20px]" aria-hidden="true">home</span>
            Tableau de bord
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ServerErrorComponent {
  retry(): void {
    window.location.reload();
  }
}
