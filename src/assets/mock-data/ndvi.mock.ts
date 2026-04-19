import { NdviData, NdviZone } from '../../app/core/models/ndvi.model';
import { MOCK_PARCELLES } from './parcelles.mock';

// Valeurs NDVI realistes par stade:
// semis: 0.10-0.20, levee: 0.30-0.40, tallage: 0.50-0.65
// floraison: 0.70-0.85, maturation: 0.50-0.65, recolte: 0.15-0.30

function d(y: number, m: number, day: number): Date { return new Date(y, m - 1, day); }

// ── Génération de grille NDVI intra-parcelle (style raster SIG) ──
// Crée une grille de cellules NDVI à l'intérieur du polygone de la parcelle
function generateNdviGrid(parcelleId: string, ndviMoyen: number, ndviMin: number, ndviMax: number): NdviZone[] {
  const parcelle = MOCK_PARCELLES.find(p => p.id === parcelleId);
  if (!parcelle?.geometry || parcelle.geometry.length < 3) return [];

  const geom = parcelle.geometry;
  const lats = geom.map(c => c.lat);
  const lngs = geom.map(c => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Résolution adaptative : ~6-8 cellules par axe pour un rendu SIG réaliste
  const steps = 8;
  const latStep = (maxLat - minLat) / steps;
  const lngStep = (maxLng - minLng) / steps;

  const zones: NdviZone[] = [];
  // Seed pseudo-aléatoire basée sur l'id de parcelle
  const seed = parcelleId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);

  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const lat = minLat + i * latStep;
      const lng = minLng + j * lngStep;

      // Point-in-polygon (ray casting)
      if (!pointInPolygon(lat, lng, geom)) continue;

      // Variation spatiale réaliste autour de la moyenne
      const noise = seededRandom(seed + i * 100 + j) * 2 - 1; // -1 à 1
      const gradient = (i / steps) * 0.08 - 0.04; // léger gradient nord-sud
      const edgePenalty = getEdgePenalty(lat, lng, geom, minLat, maxLat, minLng, maxLng);
      let val = ndviMoyen + noise * (ndviMax - ndviMin) * 0.5 + gradient - edgePenalty * 0.12;
      val = Math.max(ndviMin * 0.8, Math.min(ndviMax * 1.1, val));
      val = Math.round(val * 100) / 100;

      zones.push({ coordonnees: { lat, lng }, valeur: Math.max(0, Math.min(1, val)) });
    }
  }

  return zones;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function pointInPolygon(lat: number, lng: number, polygon: { lat: number; lng: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const yi = polygon[i].lat, xi = polygon[i].lng;
    const yj = polygon[j].lat, xj = polygon[j].lng;
    if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function getEdgePenalty(lat: number, lng: number, geom: { lat: number; lng: number }[],
  minLat: number, maxLat: number, minLng: number, maxLng: number): number {
  // Distance normalisée au centre (0=centre, 1=bord)
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  const distLat = Math.abs(lat - centerLat) / ((maxLat - minLat) / 2);
  const distLng = Math.abs(lng - centerLng) / ((maxLng - minLng) / 2);
  return Math.max(0, Math.max(distLat, distLng) - 0.6);
}

export const MOCK_NDVI: NdviData[] = [
  // === p001 — riz, stade tallage (actuel ~0.55) ===
  { id: 'ndvi001', parcelleId: 'p001', date: d(2025,11,15), ndviMoyen: 0.12, ndviMin: 0.08, ndviMax: 0.18, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi002', parcelleId: 'p001', date: d(2025,12,1),  ndviMoyen: 0.18, ndviMin: 0.12, ndviMax: 0.25, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi003', parcelleId: 'p001', date: d(2025,12,15), ndviMoyen: 0.32, ndviMin: 0.25, ndviMax: 0.40, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi004', parcelleId: 'p001', date: d(2026,1,1),   ndviMoyen: 0.38, ndviMin: 0.30, ndviMax: 0.45, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi005', parcelleId: 'p001', date: d(2026,1,15),  ndviMoyen: 0.48, ndviMin: 0.40, ndviMax: 0.55, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi006', parcelleId: 'p001', date: d(2026,2,1),   ndviMoyen: 0.55, ndviMin: 0.48, ndviMax: 0.62, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi007', parcelleId: 'p001', date: d(2026,2,15),  ndviMoyen: 0.58, ndviMin: 0.50, ndviMax: 0.65, resolution: 10, source: 'drone',
    zones: generateNdviGrid('p001', 0.58, 0.50, 0.65) },

  // === p002 — riz, stade floraison (actuel ~0.78) ===
  { id: 'ndvi008', parcelleId: 'p002', date: d(2025,10,15), ndviMoyen: 0.15, ndviMin: 0.10, ndviMax: 0.22, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi009', parcelleId: 'p002', date: d(2025,11,15), ndviMoyen: 0.35, ndviMin: 0.28, ndviMax: 0.42, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi010', parcelleId: 'p002', date: d(2025,12,15), ndviMoyen: 0.55, ndviMin: 0.48, ndviMax: 0.62, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi011', parcelleId: 'p002', date: d(2026,1,15),  ndviMoyen: 0.68, ndviMin: 0.60, ndviMax: 0.75, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi012', parcelleId: 'p002', date: d(2026,2,15),  ndviMoyen: 0.75, ndviMin: 0.68, ndviMax: 0.82, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi013', parcelleId: 'p002', date: d(2026,3,15),  ndviMoyen: 0.78, ndviMin: 0.70, ndviMax: 0.85, resolution: 10, source: 'drone',
    zones: generateNdviGrid('p002', 0.78, 0.70, 0.85) },

  // === p003 — mais, stade maturation (actuel ~0.58) ===
  { id: 'ndvi014', parcelleId: 'p003', date: d(2025,11,1),  ndviMoyen: 0.14, ndviMin: 0.10, ndviMax: 0.20, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi015', parcelleId: 'p003', date: d(2025,12,1),  ndviMoyen: 0.38, ndviMin: 0.30, ndviMax: 0.45, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi016', parcelleId: 'p003', date: d(2026,1,1),   ndviMoyen: 0.62, ndviMin: 0.55, ndviMax: 0.70, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi017', parcelleId: 'p003', date: d(2026,2,1),   ndviMoyen: 0.75, ndviMin: 0.68, ndviMax: 0.82, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi018', parcelleId: 'p003', date: d(2026,3,1),   ndviMoyen: 0.65, ndviMin: 0.58, ndviMax: 0.72, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi019', parcelleId: 'p003', date: d(2026,3,15),  ndviMoyen: 0.58, ndviMin: 0.50, ndviMax: 0.65, resolution: 10, source: 'sentinel-2',
    zones: generateNdviGrid('p003', 0.58, 0.50, 0.65) },

  // === p004 — arachide, stade maturation (actuel ~0.55) ===
  { id: 'ndvi020', parcelleId: 'p004', date: d(2025,11,15), ndviMoyen: 0.16, ndviMin: 0.10, ndviMax: 0.22, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi021', parcelleId: 'p004', date: d(2025,12,15), ndviMoyen: 0.35, ndviMin: 0.28, ndviMax: 0.42, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi022', parcelleId: 'p004', date: d(2026,1,15),  ndviMoyen: 0.60, ndviMin: 0.52, ndviMax: 0.68, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi023', parcelleId: 'p004', date: d(2026,2,15),  ndviMoyen: 0.72, ndviMin: 0.65, ndviMax: 0.80, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi024', parcelleId: 'p004', date: d(2026,3,15),  ndviMoyen: 0.55, ndviMin: 0.48, ndviMax: 0.62, resolution: 10, source: 'drone',
    zones: generateNdviGrid('p004', 0.55, 0.48, 0.62) },

  // === p005 — mil, stade recolte (actuel ~0.22) ===
  { id: 'ndvi025', parcelleId: 'p005', date: d(2025,10,1),  ndviMoyen: 0.18, ndviMin: 0.12, ndviMax: 0.25, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi026', parcelleId: 'p005', date: d(2025,11,1),  ndviMoyen: 0.40, ndviMin: 0.32, ndviMax: 0.48, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi027', parcelleId: 'p005', date: d(2025,12,1),  ndviMoyen: 0.65, ndviMin: 0.58, ndviMax: 0.72, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi028', parcelleId: 'p005', date: d(2026,1,1),   ndviMoyen: 0.72, ndviMin: 0.65, ndviMax: 0.80, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi029', parcelleId: 'p005', date: d(2026,2,1),   ndviMoyen: 0.45, ndviMin: 0.38, ndviMax: 0.52, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi030', parcelleId: 'p005', date: d(2026,3,1),   ndviMoyen: 0.22, ndviMin: 0.15, ndviMax: 0.30, resolution: 10, source: 'sentinel-2',
    zones: generateNdviGrid('p005', 0.22, 0.15, 0.30) },

  // === p006 — oignon, stade floraison (actuel ~0.72) ===
  { id: 'ndvi031', parcelleId: 'p006', date: d(2025,12,1),  ndviMoyen: 0.15, ndviMin: 0.10, ndviMax: 0.22, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi032', parcelleId: 'p006', date: d(2026,1,1),   ndviMoyen: 0.38, ndviMin: 0.30, ndviMax: 0.45, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi033', parcelleId: 'p006', date: d(2026,2,1),   ndviMoyen: 0.58, ndviMin: 0.50, ndviMax: 0.65, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi034', parcelleId: 'p006', date: d(2026,3,1),   ndviMoyen: 0.72, ndviMin: 0.65, ndviMax: 0.80, resolution: 10, source: 'drone',
    zones: generateNdviGrid('p006', 0.72, 0.65, 0.80) },

  // === p007 — tomate, stade floraison (actuel ~0.74) ===
  { id: 'ndvi035', parcelleId: 'p007', date: d(2025,12,15), ndviMoyen: 0.18, ndviMin: 0.12, ndviMax: 0.25, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi036', parcelleId: 'p007', date: d(2026,1,15),  ndviMoyen: 0.42, ndviMin: 0.35, ndviMax: 0.50, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi037', parcelleId: 'p007', date: d(2026,2,15),  ndviMoyen: 0.62, ndviMin: 0.55, ndviMax: 0.70, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi038', parcelleId: 'p007', date: d(2026,3,15),  ndviMoyen: 0.74, ndviMin: 0.68, ndviMax: 0.82, resolution: 10, source: 'sentinel-2',
    zones: generateNdviGrid('p007', 0.74, 0.68, 0.82) },

  // === p008 — riz, stade levee (actuel ~0.35) ===
  { id: 'ndvi039', parcelleId: 'p008', date: d(2026,1,15),  ndviMoyen: 0.12, ndviMin: 0.08, ndviMax: 0.18, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi040', parcelleId: 'p008', date: d(2026,2,1),   ndviMoyen: 0.20, ndviMin: 0.15, ndviMax: 0.28, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi041', parcelleId: 'p008', date: d(2026,2,15),  ndviMoyen: 0.28, ndviMin: 0.22, ndviMax: 0.35, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi042', parcelleId: 'p008', date: d(2026,3,1),   ndviMoyen: 0.35, ndviMin: 0.28, ndviMax: 0.42, resolution: 10, source: 'sentinel-2',
    zones: generateNdviGrid('p008', 0.35, 0.28, 0.42) },

  // === p009 — arachide, stade floraison (actuel ~0.76) ===
  { id: 'ndvi043', parcelleId: 'p009', date: d(2025,11,1),  ndviMoyen: 0.14, ndviMin: 0.10, ndviMax: 0.20, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi044', parcelleId: 'p009', date: d(2025,12,1),  ndviMoyen: 0.35, ndviMin: 0.28, ndviMax: 0.42, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi045', parcelleId: 'p009', date: d(2026,1,1),   ndviMoyen: 0.58, ndviMin: 0.50, ndviMax: 0.65, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi046', parcelleId: 'p009', date: d(2026,2,1),   ndviMoyen: 0.70, ndviMin: 0.62, ndviMax: 0.78, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi047', parcelleId: 'p009', date: d(2026,3,1),   ndviMoyen: 0.76, ndviMin: 0.68, ndviMax: 0.85, resolution: 10, source: 'drone',
    zones: generateNdviGrid('p009', 0.76, 0.68, 0.85) },

  // === p010 — oignon, stade levee (actuel ~0.32) ===
  { id: 'ndvi048', parcelleId: 'p010', date: d(2026,2,1),   ndviMoyen: 0.12, ndviMin: 0.08, ndviMax: 0.18, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi049', parcelleId: 'p010', date: d(2026,2,15),  ndviMoyen: 0.22, ndviMin: 0.15, ndviMax: 0.30, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi050', parcelleId: 'p010', date: d(2026,3,1),   ndviMoyen: 0.32, ndviMin: 0.25, ndviMax: 0.40, resolution: 10, source: 'sentinel-2',
    zones: generateNdviGrid('p010', 0.32, 0.25, 0.40) },

  // === p011 — mil, stade maturation (actuel ~0.52) ===
  { id: 'ndvi051', parcelleId: 'p011', date: d(2025,11,1),  ndviMoyen: 0.16, ndviMin: 0.10, ndviMax: 0.22, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi052', parcelleId: 'p011', date: d(2025,12,1),  ndviMoyen: 0.40, ndviMin: 0.32, ndviMax: 0.48, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi053', parcelleId: 'p011', date: d(2026,1,1),   ndviMoyen: 0.65, ndviMin: 0.58, ndviMax: 0.72, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi054', parcelleId: 'p011', date: d(2026,2,1),   ndviMoyen: 0.70, ndviMin: 0.62, ndviMax: 0.78, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi055', parcelleId: 'p011', date: d(2026,3,1),   ndviMoyen: 0.52, ndviMin: 0.45, ndviMax: 0.60, resolution: 10, source: 'sentinel-2',
    zones: generateNdviGrid('p011', 0.52, 0.45, 0.60) },

  // === p012 — tomate, stade semis (actuel ~0.15) ===
  { id: 'ndvi056', parcelleId: 'p012', date: d(2026,2,15),  ndviMoyen: 0.10, ndviMin: 0.06, ndviMax: 0.15, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi057', parcelleId: 'p012', date: d(2026,3,1),   ndviMoyen: 0.15, ndviMin: 0.10, ndviMax: 0.22, resolution: 10, source: 'sentinel-2',
    zones: generateNdviGrid('p012', 0.15, 0.10, 0.22) },

  // === p013 — arachide, stade recolte (actuel ~0.25) ===
  { id: 'ndvi058', parcelleId: 'p013', date: d(2025,10,1),  ndviMoyen: 0.15, ndviMin: 0.10, ndviMax: 0.22, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi059', parcelleId: 'p013', date: d(2025,11,1),  ndviMoyen: 0.42, ndviMin: 0.35, ndviMax: 0.50, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi060', parcelleId: 'p013', date: d(2025,12,1),  ndviMoyen: 0.68, ndviMin: 0.60, ndviMax: 0.75, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi061', parcelleId: 'p013', date: d(2026,1,1),   ndviMoyen: 0.75, ndviMin: 0.68, ndviMax: 0.82, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi062', parcelleId: 'p013', date: d(2026,2,1),   ndviMoyen: 0.48, ndviMin: 0.40, ndviMax: 0.55, resolution: 10, source: 'sentinel-2', zones: [] },
  { id: 'ndvi063', parcelleId: 'p013', date: d(2026,3,1),   ndviMoyen: 0.25, ndviMin: 0.18, ndviMax: 0.32, resolution: 10, source: 'sentinel-2',
    zones: generateNdviGrid('p013', 0.25, 0.18, 0.32) },
];
