export type PoiCategory =
  | 'village'
  | 'marche'
  | 'source_eau'
  | 'hopital'
  | 'vendeur_intrants'
  | 'materiel_agricole';

export interface PointOfInterest {
  id: string;
  parcelleId: string;
  categorie: PoiCategory;
  nom: string;
  distance: number; // km from parcelle center
  coordonnees: { lat: number; lng: number };
  telephone?: string;
  email?: string;
  siteWeb?: string;
  description?: string;
  horaires?: string;
}

export interface CarbonEmission {
  parcelleId: string;
  emissionKgCO2: number;
  emissionParHa: number;
  categorie: 'faible' | 'moyen' | 'eleve';
}

export const POI_ICONS: Record<PoiCategory, string> = {
  village: 'home',
  marche: 'store',
  source_eau: 'water_drop',
  hopital: 'local_hospital',
  vendeur_intrants: 'storefront',
  materiel_agricole: 'agriculture',
};

export const POI_LABELS: Record<PoiCategory, string> = {
  village: 'Village le plus proche',
  marche: 'Marché le plus proche',
  source_eau: "Source d'eau",
  hopital: 'Hôpital',
  vendeur_intrants: "Vendeur d'intrants",
  materiel_agricole: 'Matériel agricole',
};

export const POI_COLORS: Record<PoiCategory, string> = {
  village: '#6366f1',
  marche: '#f59e0b',
  source_eau: '#3b82f6',
  hopital: '#ef4444',
  vendeur_intrants: '#10b981',
  materiel_agricole: '#8b5cf6',
};
