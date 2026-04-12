import { Injectable, signal, computed } from '@angular/core';

/**
 * Service global de loading.
 * Suit le nombre de requêtes HTTP en cours.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeRequests = signal(0);

  /** True si au moins une requête HTTP est en cours */
  readonly isLoading = computed(() => this.activeRequests() > 0);

  start(): void {
    this.activeRequests.update(n => n + 1);
  }

  stop(): void {
    this.activeRequests.update(n => Math.max(0, n - 1));
  }
}
