import * as L from 'leaflet';
import { Coordonnees, ZoneAgroecologique } from '../models/parcelle.model';

export interface DrawGeometryResult {
  geometry: Coordonnees[];
  area: number;       // hectares
  centroid: Coordonnees;
}

/**
 * Calcule la superficie d'un polygone en m² (Shoelace sur coordonnees projetees).
 */
export function calcPolygonArea(latlngs: L.LatLng[]): number {
  const earthRadius = 6378137;
  const toRad = (d: number) => d * Math.PI / 180;
  const projected = latlngs.map((ll: L.LatLng) => ({
    x: toRad(ll.lng) * earthRadius * Math.cos(toRad(ll.lat)),
    y: toRad(ll.lat) * earthRadius,
  }));
  let area = 0;
  for (let i = 0; i < projected.length; i++) {
    const j = (i + 1) % projected.length;
    area += projected[i].x * projected[j].y;
    area -= projected[j].x * projected[i].y;
  }
  return Math.abs(area / 2);
}

/**
 * Calcule le centroide d'un ensemble de points.
 */
export function calcCentroid(latlngs: L.LatLng[]): Coordonnees {
  const n = latlngs.length;
  const lat = latlngs.reduce((s, ll) => s + ll.lat, 0) / n;
  const lng = latlngs.reduce((s, ll) => s + ll.lng, 0) / n;
  return { lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 };
}

/**
 * Extrait la geometrie, la superficie (ha) et le centroide a partir d'un layer Leaflet dessine.
 */
export function extractGeometryFromLayer(layer: any): DrawGeometryResult | null {
  const latlngs: L.LatLng[] = layer.getLatLngs ? layer.getLatLngs()[0] : [];
  if (!latlngs || latlngs.length < 3) return null;

  const geometry = latlngs.map((ll: L.LatLng) => ({ lat: ll.lat, lng: ll.lng }));
  const areaM2 = calcPolygonArea(latlngs);
  const area = Math.round(areaM2 / 10000 * 100) / 100;
  const centroid = calcCentroid(latlngs);

  return { geometry, area, centroid };
}

/**
 * Estime la zone agroecologique a partir des coordonnees GPS (heuristique Senegal).
 */
export function estimateZoneFromCoords(centroid: Coordonnees): ZoneAgroecologique | null {
  const { lat, lng } = centroid;

  // Vallee du Fleuve Senegal : bande nord (lat > 15.5)
  if (lat > 15.5) return 'Vallée du Fleuve Sénégal';

  // Casamance : sud (lat < 13.2)
  if (lat < 13.2) return 'Casamance';

  // Niayes : bande cotiere nord-ouest (lat 14.5-15.5, lng < -16.5)
  if (lat >= 14.5 && lat <= 15.5 && lng < -16.5) return 'Niayes';

  // Zone Sylvopastorale : nord-est (lat 14.5-15.5, lng > -14.5)
  if (lat >= 14.5 && lat <= 15.5 && lng > -14.5) return 'Zone Sylvopastorale';

  // Senegal Oriental : centre-est (lat 13.2-14.5, lng > -13.5)
  if (lat >= 13.2 && lat <= 14.5 && lng > -13.5) return 'Sénégal Oriental';

  // Bassin Arachidier : centre (lat 13.2-15.0, lng -16.5 a -14.5)
  if (lat >= 13.2 && lat <= 15.0 && lng >= -16.5 && lng <= -13.5) return 'Bassin Arachidier';

  return null;
}
