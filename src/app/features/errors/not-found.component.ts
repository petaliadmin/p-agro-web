import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="text-center max-w-md">
        <!-- Illustration -->
        <div class="mb-8">
          <svg class="mx-auto w-48 h-48 text-primary-200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" stroke="currentColor" stroke-width="4" stroke-dasharray="8 8"/>
            <text x="100" y="90" text-anchor="middle" fill="#1A7A4A" font-size="56" font-weight="bold" font-family="sans-serif">404</text>
            <text x="100" y="120" text-anchor="middle" fill="#6B7280" font-size="14" font-family="sans-serif">Page introuvable</text>
            <!-- Leaf icon -->
            <path d="M85 140 C90 130, 105 125, 115 140 C105 135, 95 138, 85 140Z" fill="#1A7A4A" opacity="0.3"/>
            <path d="M100 140 L100 155" stroke="#1A7A4A" stroke-width="2" opacity="0.3"/>
          </svg>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-3">Page introuvable</h1>
        <p class="text-gray-500 mb-8 text-base leading-relaxed">
          La page que vous recherchez n'existe pas ou a été déplacée.
          Vérifiez l'URL ou retournez au tableau de bord.
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
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}
