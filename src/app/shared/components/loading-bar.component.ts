import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="loading.isLoading()" class="fixed top-0 left-0 right-0 z-[200] h-1">
      <div class="h-full bg-primary-600 animate-loading-bar rounded-r-full"></div>
    </div>
  `,
  styles: [`
    @keyframes loadingBar {
      0% { width: 0; margin-left: 0; }
      50% { width: 70%; margin-left: 0; }
      75% { width: 20%; margin-left: 80%; }
      100% { width: 0; margin-left: 100%; }
    }
    .animate-loading-bar {
      animation: loadingBar 1.5s ease-in-out infinite;
    }
  `],
})
export class LoadingBarComponent {
  loading = inject(LoadingService);
}
