import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [CommonModule, A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 dialog-backdrop" (click)="onBackdropClick($event)">
      <div class="fixed inset-0 bg-black/40 transition-opacity" aria-hidden="true"></div>
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full transform overflow-hidden" role="dialog" aria-modal="true" [attr.aria-label]="title" cdkTrapFocus [cdkTrapFocusAutoCapture]="true"
        [ngClass]="{
          'max-w-md': size === 'sm',
          'max-w-lg': size === 'md',
          'max-w-2xl': size === 'lg',
          'max-w-4xl': size === 'xl',
          'animate-dialog-in': true
        }">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h3>
            <p *ngIf="subtitle" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ subtitle }}</p>
          </div>
          <button (click)="onClose()" class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Fermer la boîte de dialogue">
            <span class="material-icons text-[18px]" aria-hidden="true">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 max-h-[70vh] overflow-y-auto">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <button (click)="onClose()" class="btn-secondary text-sm px-4 py-2" [disabled]="loading">
            {{ cancelLabel }}
          </button>
          <button (click)="onSubmit()" class="btn-primary text-sm px-4 py-2 flex items-center gap-2" [disabled]="loading || submitDisabled">
            <span *ngIf="loading" class="material-icons text-[16px] animate-spin" aria-hidden="true">refresh</span>
            {{ loading ? loadingLabel : submitLabel }}
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
    .animate-dialog-in { animation: dialogIn 0.2s ease-out forwards; }
    @keyframes backdropIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    :host { display: contents; }
  `],
})
export class FormDialogComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() submitLabel = 'Enregistrer';
  @Input() cancelLabel = 'Annuler';
  @Input() loadingLabel = 'Enregistrement…';
  @Input() loading = false;
  @Input() submitDisabled = false;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (!this.loading) this.onClose();
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    this.submit.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (!this.loading && (event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.onClose();
    }
  }
}
