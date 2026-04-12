import { Injectable, ComponentRef, ViewContainerRef, Type, signal } from '@angular/core';

export interface DialogConfig {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'danger';
  data?: any;
}

export interface DialogRef<T = any> {
  close: (result?: T) => void;
  afterClosed: () => Promise<T | undefined>;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  private viewContainerRef!: ViewContainerRef;
  private activeDialogs: ComponentRef<any>[] = [];

  isOpen = signal(false);

  registerViewContainer(vcr: ViewContainerRef): void {
    this.viewContainerRef = vcr;
  }

  open<T>(component: Type<T>, config?: DialogConfig): DialogRef {
    if (!this.viewContainerRef) {
      throw new Error('DialogService: ViewContainerRef not registered. Add <ng-container #dialogHost></ng-container> to ShellComponent.');
    }

    const componentRef = this.viewContainerRef.createComponent(component);
    const instance = componentRef.instance as any;

    if (config) {
      Object.assign(instance, { dialogConfig: config });
    }

    this.activeDialogs.push(componentRef);
    this.isOpen.set(true);

    let resolvePromise: (value: any) => void;
    const resultPromise = new Promise<any>(resolve => { resolvePromise = resolve; });

    const dialogRef: DialogRef = {
      close: (result?: any) => {
        const idx = this.activeDialogs.indexOf(componentRef);
        if (idx >= 0) {
          this.activeDialogs.splice(idx, 1);
        }
        componentRef.destroy();
        this.isOpen.set(this.activeDialogs.length > 0);
        resolvePromise!(result);
      },
      afterClosed: () => resultPromise,
    };

    instance.dialogRef = dialogRef;

    return dialogRef;
  }

  async confirm(config: DialogConfig): Promise<boolean> {
    const { ConfirmDialogComponent } = await import('../../shared/components/confirm-dialog.component');
    const ref = this.open(ConfirmDialogComponent, config);
    const result = await ref.afterClosed();
    return result === true;
  }

  closeAll(): void {
    [...this.activeDialogs].forEach(ref => ref.destroy());
    this.activeDialogs = [];
    this.isOpen.set(false);
  }
}
