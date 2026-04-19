export type TypeIrrigation = 'pluie' | 'goutte_a_goutte' | 'aspersion' | 'bassin' | 'submersion' | 'gravitaire';

export type TypeEvenementClimatique = 'secheresse' | 'fortes_pluies' | 'vent' | 'inondation' | 'grele' | 'canicule';

export type NiveauImpact = 'faible' | 'moyen' | 'severe' | 'critique';

export interface Irrigation {
  id: string;
  parcelleId: string;
  type: TypeIrrigation;
  frequence: string;          // ex: "2 fois/semaine", "quotidien"
  quantiteEstimee: number;    // mm
  date: Date;
  dureeMinutes?: number;
  observations?: string;
}

export interface EvenementClimatique {
  id: string;
  date: Date;
  type: TypeEvenementClimatique;
  impact: NiveauImpact;
  parcelleId?: string;        // null = global (toutes parcelles)
  description: string;
  actionsPrises?: string;
  degatEstime?: string;       // description textuelle
}

export interface PluviometrieJour {
  date: Date;
  quantite: number;           // mm
}

export interface BilanHydrique {
  parcelleId: string;
  stressHydrique: boolean;
  niveauStress: 'aucun' | 'leger' | 'modere' | 'severe';
  dernierArrosage?: Date;
  prochaineIrrigation?: Date;
  pluviometrie30j: number;    // mm total sur 30 jours
}
