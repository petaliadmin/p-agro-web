export type TypeIntrant = 'semence' | 'engrais' | 'pesticide' | 'herbicide' | 'fongicide';
export type UniteIntrant = 'kg' | 'L' | 'sac';
export type TypeMouvement = 'entree' | 'sortie';
export type OrigineIntrant = 'marche' | 'subvention' | 'stock_personnel' | 'cooperatif';
export type CultureType = 'riz' | 'mais' | 'mil' | 'arachide' | 'oignon' | 'tomate';

export interface MouvementIntrant {
  id: string;
  date: Date;
  type: TypeMouvement;
  quantite: number;
  parcelleId?: string;
  motif: string;
  operateurId: string;
  coutTransport?: number;         // FCFA
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

  // Champs enrichis context.md
  origine?: OrigineIntrant;
  doseRecommandee?: number;     // kg/ha ou L/ha
  frequenceApplication?: string; // ex: "2 applications à 15 jours d'intervalle"
  culturesCibles?: CultureType[];
}

export interface IntrantStats {
  totalReferences: number;
  alertesStock: number;
  alertesExpiration: number;
  valeurTotale: number;         // en FCFA
}
