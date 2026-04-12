import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
      <div *ngFor="let toast of toastService.toasts(); trackBy: trackById"
        class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-toast-in"
        [class.bg-green-50]="toast.type === 'success'" [class.border-green-200]="toast.type === 'success'" [class.text-green-800]="toast.type === 'success'"
        [class.bg-red-50]="toast.type === 'error'" [class.border-red-200]="toast.type === 'error'" [class.text-red-800]="toast.type === 'error'"
        [class.bg-yellow-50]="toast.type === 'warning'" [class.border-yellow-200]="toast.type === 'warning'" [class.text-yellow-800]="toast.type === 'warning'"
        [class.bg-blue-50]="toast.type === 'info'" [class.border-blue-200]="toast.type === 'info'" [class.text-blue-800]="toast.type === 'info'"
      >
        <span class="material-icons text-[18px]" aria-hidden="true">{{ icon(toast.type) }}</span>
        <span class="flex-1">{{ toast.message }}</span>
        <button (click)="toastService.remove(toast.id)" class="opacity-60 hover:opacity-100 transition-opacity">
          <span class="material-icons text-[16px]" aria-hidden="true">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-toast-in { animation: toastIn 0.25s ease-out; }
  `],
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  icon(type: string): string {
    return { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' }[type] ?? 'info';
  }

  trackById(_: number, toast: Toast): number { return toast.id; }
}
