import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

export interface ShortcutEvent {
  action: 'search' | 'new' | 'escape' | 'navigate';
  target?: string;
}

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutsService {
  readonly shortcut$ = new Subject<ShortcutEvent>();

  private shortcuts: { key: string; ctrl?: boolean; shift?: boolean; action: ShortcutEvent }[] = [
    { key: 'k', ctrl: true, action: { action: 'search' } },
    { key: '/', action: { action: 'search' } },
    { key: 'Escape', action: { action: 'escape' } },
    { key: 'd', ctrl: true, shift: true, action: { action: 'navigate', target: '/dashboard' } },
    { key: 'p', ctrl: true, shift: true, action: { action: 'navigate', target: '/parcelles' } },
    { key: 't', ctrl: true, shift: true, action: { action: 'navigate', target: '/taches' } },
  ];

  constructor(private router: Router, private zone: NgZone) {
    this.zone.runOutsideAngular(() => {
      document.addEventListener('keydown', (e) => this.handleKeydown(e));
    });
  }

  private handleKeydown(event: KeyboardEvent): void {
    // Don't trigger when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) {
      if (event.key === 'Escape') {
        this.zone.run(() => this.shortcut$.next({ action: 'escape' }));
      }
      return;
    }

    for (const shortcut of this.shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

      if (event.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && shiftMatch) {
        event.preventDefault();
        this.zone.run(() => {
          if (shortcut.action.action === 'navigate' && shortcut.action.target) {
            this.router.navigate([shortcut.action.target]);
          }
          this.shortcut$.next(shortcut.action);
        });
        return;
      }
    }
  }
}
