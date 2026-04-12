import { Injectable } from '@angular/core';

export interface UserSettings {
  alerteStock: boolean;
  rappelVisite: boolean;
  alerteTache: boolean;
  rapportHebdo: boolean;
  langue: string;
  theme: string;
}

const DEFAULTS: UserSettings = {
  alerteStock: true,
  rappelVisite: true,
  alerteTache: true,
  rapportHebdo: false,
  langue: 'fr',
  theme: 'light',
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly STORAGE_KEY = 'agroassist_settings';

  getAll(): UserSettings {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  }

  get<K extends keyof UserSettings>(key: K): UserSettings[K] {
    return this.getAll()[key];
  }

  saveAll(settings: Partial<UserSettings>): void {
    const current = this.getAll();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ ...current, ...settings }));
  }

  save<K extends keyof UserSettings>(key: K, value: UserSettings[K]): void {
    this.saveAll({ [key]: value });
  }

  reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
