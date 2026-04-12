import { Pipe, PipeTransform } from '@angular/core';

// ============================================================
// DateLocalePipe — format date en français
// ============================================================
@Pipe({ name: 'dateLocale', standalone: true, pure: true })
export class DateLocalePipe implements PipeTransform {
  transform(value: Date | string | null, format: 'court' | 'long' | 'relatif' = 'court'): string {
    if (!value) return '—';
    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMs / 3600000);
    const diffJ = Math.floor(diffMs / 86400000);

    if (format === 'relatif') {
      if (diffMin < 1) return 'À l\'instant';
      if (diffMin < 60) return `Il y a ${diffMin} min`;
      if (diffH < 24) return `Il y a ${diffH}h`;
      if (diffJ < 7) return `Il y a ${diffJ} jour${diffJ > 1 ? 's' : ''}`;
    }

    const opts: Intl.DateTimeFormatOptions = format === 'long'
      ? { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { day: '2-digit', month: '2-digit', year: '2-digit' };

    return new Intl.DateTimeFormat('fr-SN', opts).format(date);
  }
}

// ============================================================
// HectarePipe — formate une superficie
// ============================================================
@Pipe({ name: 'hectare', standalone: true, pure: true })
export class HectarePipe implements PipeTransform {
  transform(value: number | null): string {
    if (value === null || value === undefined) return '—';
    return `${value.toLocaleString('fr-SN', { maximumFractionDigits: 1 })} ha`;
  }
}

// ============================================================
// StatutCulturePipe — label français + emoji du statut
// ============================================================
@Pipe({ name: 'statutCulture', standalone: true, pure: true })
export class StatutCulturePipe implements PipeTransform {
  private labels: Record<string, { label: string; emoji: string }> = {
    semis:       { label: 'Semis',       emoji: '🌱' },
    levee:       { label: 'Levée',       emoji: '🌿' },
    tallage:     { label: 'Tallage',     emoji: '🌾' },
    floraison:   { label: 'Floraison',   emoji: '🌸' },
    maturation:  { label: 'Maturation',  emoji: '🌻' },
    recolte:     { label: 'Récolte',     emoji: '🌾' },
  };

  transform(value: string, mode: 'label' | 'emoji' | 'full' = 'full'): string {
    const entry = this.labels[value];
    if (!entry) return value;
    if (mode === 'label') return entry.label;
    if (mode === 'emoji') return entry.emoji;
    return `${entry.emoji} ${entry.label}`;
  }
}

// ============================================================
// CultureEmojipipe
// ============================================================
@Pipe({ name: 'cultureEmoji', standalone: true, pure: true })
export class CultureEmojiPipe implements PipeTransform {
  private map: Record<string, string> = {
    riz: '🌾', mais: '🌽', mil: '🌿', arachide: '🥜', oignon: '🧅', tomate: '🍅',
  };
  transform(value: string): string {
    return this.map[value] ?? '🌱';
  }
}

// ============================================================
// FcfaPipe — format monétaire FCFA
// ============================================================
@Pipe({ name: 'fcfa', standalone: true, pure: true })
export class FcfaPipe implements PipeTransform {
  transform(value: number | null): string {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
