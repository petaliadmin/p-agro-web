import { Injectable, signal, effect, untracked } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'agroassist_theme';

  /** Mode choisi par l'utilisateur */
  readonly mode = signal<ThemeMode>(this.loadSaved());

  /** True si le thème effectif est dark */
  readonly isDark = signal(false);

  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    // Réagir aux changements de mode
    effect(() => {
      const m = this.mode();
      untracked(() => {
        localStorage.setItem(this.STORAGE_KEY, m);
        this.applyTheme(m);
      });
    }, { allowSignalWrites: true });

    // Écouter changement OS
    this.mediaQuery.addEventListener('change', () => {
      if (this.mode() === 'system') {
        this.applyTheme('system');
      }
    });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  private applyTheme(mode: ThemeMode): void {
    const dark = mode === 'dark' || (mode === 'system' && this.mediaQuery.matches);
    this.isDark.set(dark);

    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  private loadSaved(): ThemeMode {
    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    return saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'light';
  }
}
