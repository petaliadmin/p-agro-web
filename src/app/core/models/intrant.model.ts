export type TypeIntrant = 'semence' | 'engrais' | 'pesticide' | 'herbicide' | 'fongicide';
export type UniteIntrant = 'kg' | 'L' | 'sac';
export type TypeMouvement = 'entree' | 'sortie';

export interface MouvementIntrant {
  id: string;
  date: Date;
  type: TypeMouvement;
  quantite: number;
  parcelleId?: string;
  motif: string;
  operateurId: string;
}

export interface Intrant {
  id: string;
  nom: string;
  type: TypeIntrant;
  quantiteStock: number;
  unite: UniteIntrant;
  seuilAlerte: number;
  dateExpiration: Date;
  fournisseur: string;
  prixUnitaire: number;         // en FCFA
  mouvements: MouvementIntrant[];
}

export interface IntrantStats {
  totalReferences: number;
  alertesStock: number;
  alertesExpiration: number;
  valeurTotale: number;         // en FCFA
}
