import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { DialogConfig, DialogRef } from '../../core/services/dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4" (click)="onBackdropClick($event)">
      <div class="fixed inset-0 bg-black/40 transition-opacity" aria-hidden="true"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-dialog-in" role="dialog" aria-modal="true" [attr.aria-label]="dialogConfig.title || 'Confirmation'" cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
        <!-- Header -->
        <div class="px-6 pt-6 pb-2">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center"
              [class.bg-red-100]="dialogConfig.confirmColor === 'danger'"
              [class.bg-primary-100]="dialogConfig.confirmColor !== 'danger'">
              <span class="material-icons text-[20px]" aria-hidden="true"
                [class.text-red-600]="dialogConfig.confirmColor === 'danger'"
                [class.text-primary-600]="dialogConfig.confirmColor !== 'danger'">
                {{ dialogConfig.confirmColor === 'danger' ? 'warning' : 'help_outline' }}
              </span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">{{ dialogConfig.title || 'Confirmation' }}</h3>
          </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-4">
          <p class="text-sm text-gray-600 leading-relaxed">{{ dialogConfig.message || 'Êtes-vous sûr ?' }}</p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button (click)="onCancel()" class="btn-secondary text-sm px-4 py-2">
            {{ dialogConfig.cancelLabel || 'Annuler' }}
          </button>
          <button (click)="onConfirm()" class="text-sm px-4 py-2 rounded-lg font-medium text-white transition-colors"
            [class.bg-red-600]="dialogConfig.confirmColor === 'danger'"
            [class.hover:bg-red-700]="dialogConfig.confirmColor === 'danger'"
            [class.bg-primary-600]="dialogConfig.confirmColor !== 'danger'"
            [class.hover:bg-primary-800]="dialogConfig.confirmColor !== 'danger'">
            {{ dialogConfig.confirmLabel || 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes dialogIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-dialog-in { animation: dialogIn 0.2s ease-out; }
  `],
})
export class ConfirmDialogComponent {
  dialogConfig: DialogConfig = {};
  dialogRef!: DialogRef;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onCancel();
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.onCancel();
    }
  }
}
