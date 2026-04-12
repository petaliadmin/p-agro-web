export type CultureType = 'riz' | 'mais' | 'mil' | 'arachide' | 'oignon' | 'tomate';
export type StadeCulture = 'semis' | 'levee' | 'tallage' | 'floraison' | 'maturation' | 'recolte';
export type StatutParcelle = 'sain' | 'attention' | 'urgent' | 'recolte';

export interface Coordonnees {
  lat: number;
  lng: number;
}

export interface Parcelle {
  id: string;
  code: string;
  nom: string;
  superficie: number;           // en hectares
  culture: CultureType;
  stade: StadeCulture;
  statut: StatutParcelle;
  technicienId: string;
  producteurNom: string;
  coordonnees: Coordonnees;
  geometry?: Coordonnees[];     // contour GPS relevé sur le terrain
  zone: string;
  typesSol: string;
  derniereVisite: Date;
  prochaineVisite: Date;
  rendementPrecedent: number;   // t/ha
  createdAt: Date;
}

export interface ParcelleStats {
  total: number;
  urgentes: number;
  totalHa: number;
  enAttention: number;
}
