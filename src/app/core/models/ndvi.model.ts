import { Coordonnees } from './parcelle.model';

export type NdviSource = 'sentinel-2' | 'landsat' | 'drone';
export type NdviClasse = 'stress' | 'attention' | 'sain';

export interface NdviZone {
  coordonnees: Coordonnees;
  valeur: number;
}

export interface NdviData {
  id: string;
  parcelleId: string;
  date: Date;
  ndviMoyen: number;       // 0 à 1
  ndviMin: number;
  ndviMax: number;
  resolution: number;      // mètres (ex: 10 pour Sentinel-2)
  source: NdviSource;
  zones: NdviZone[];
  tileUrl?: string;        // URL WMS Sentinel Hub pour L.tileLayer.wms()
  tileType?: 'xyz' | 'wms'; // type de tuiles cartographiques
  imageUrl?: string;       // URL image PNG directe (mode API)
  cloudCoverage?: number;  // Couverture nuageuse % (mode API)
}

export function getNdviClasse(val: number): NdviClasse {
  if (val < 0.3) return 'stress';
  if (val < 0.6) return 'attention';
  return 'sain';
}

export function getNdviColor(val: number): string {
  if (val < 0.2) return '#dc2626';       // rouge
  if (val < 0.4) return '#f97316';       // orange
  if (val < 0.6) return '#eab308';       // jaune
  if (val < 0.8) return '#84cc16';       // vert clair
  return '#16a34a';                       // vert foncé
}

export function getNdviLabel(val: number): string {
  if (val < 0.2) return 'Sol nu / Végétation absente';
  if (val < 0.4) return 'Végétation clairsemée';
  if (val < 0.6) return 'Végétation modérée';
  if (val < 0.8) return 'Végétation dense';
  return 'Végétation très dense et saine';
}

export function getNdviClasseLabel(classe: NdviClasse): string {
  switch (classe) {
    case 'stress': return 'Stress végétal';
    case 'attention': return 'À surveiller';
    case 'sain': return 'Sain';
  }
}

/** Interpolation continue rouge→vert pour rendu raster SIG (0.0→1.0) */
export function getNdviColorSmooth(val: number): string {
  // 5 stops : rouge (0), orange (0.25), jaune (0.5), vert clair (0.75), vert foncé (1.0)
  const stops: [number, number, number][] = [
    [220, 38, 38],   // #dc2626 - rouge
    [249, 115, 22],  // #f97316 - orange
    [234, 179, 8],   // #eab308 - jaune
    [132, 204, 22],  // #84cc16 - vert clair
    [22, 163, 74],   // #16a34a - vert foncé
  ];
  const clamped = Math.max(0, Math.min(1, val));
  const idx = clamped * (stops.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, stops.length - 1);
  const t = idx - lo;
  const r = Math.round(stops[lo][0] + (stops[hi][0] - stops[lo][0]) * t);
  const g = Math.round(stops[lo][1] + (stops[hi][1] - stops[lo][1]) * t);
  const b = Math.round(stops[lo][2] + (stops[hi][2] - stops[lo][2]) * t);
  return `rgb(${r},${g},${b})`;
}
