import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  toasts = signal<Toast[]>([]);

  success(message: string, duration = 3000): void {
    this.add('success', message, duration);
  }

  error(message: string, duration = 5000): void {
    this.add('error', message, duration);
  }

  warning(message: string, duration = 4000): void {
    this.add('warning', message, duration);
  }

  info(message: string, duration = 3000): void {
    this.add('info', message, duration);
  }

  remove(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private add(type: ToastType, message: string, duration: number): void {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }
}
