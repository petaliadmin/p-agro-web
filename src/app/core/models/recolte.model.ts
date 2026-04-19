export type QualiteRecolte = 'A' | 'B' | 'C';
export type DestinationRecolte = 'vente' | 'autoconsommation' | 'stockage' | 'transformation';

export interface Recolte {
  id: string;
  parcelleId: string;
  campagneId?: string;
  culture: string;
  variete?: string;
  dateRecolte: Date;
  quantiteRecoltee: number;       // kg
  superficie: number;             // ha (pour calcul rendement)
  rendement: number;              // t/ha — auto-calculé: (quantiteRecoltee / 1000) / superficie
  pertesPostRecolte: number;      // kg
  tauxPerte: number;              // % — auto-calculé: (pertes / quantiteRecoltee) * 100
  qualite: QualiteRecolte;
  destination: DestinationRecolte;
  prixVente?: number;             // FCFA/kg
  revenuTotal?: number;           // FCFA — auto-calculé: (quantiteRecoltee - pertesPostRecolte) * prixVente
  observations?: string;
}
