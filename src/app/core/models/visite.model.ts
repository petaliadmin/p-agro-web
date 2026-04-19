export type StatutVisite = 'planifiee' | 'en_cours' | 'completee';
export type EtapeVisite = 1 | 2 | 3 | 4 | 5 | 6;

export type ProblemeSol = 'erosion' | 'salinite' | 'compaction' | 'engorgement' | 'acidite';
export type EtatGeneral = 1 | 2 | 3 | 4 | 5;  // 1-5 étoiles

export interface ObservationsVisite {
  croissance: 'excellente' | 'normale' | 'faible';
  couleurFeuilles: 'verte' | 'jaunissante' | 'brunissante';
  maladiesDetectees: string[];
  ravageursDetectes: string[];
  stressHydrique: boolean;
  hauteurPlantes: number;       // en cm
  tauxCouverture: number;       // en %

  // Observations terrain enrichies (Phase 34)
  problemeSol?: ProblemeSol[];
  problemeVent?: boolean;
  problemeAnimaux?: string;     // ex: "divagation bétail", "oiseaux granivores"
  etatGeneral?: EtatGeneral;    // note qualitative 1-5 étoiles
  actionRecommandeeImmediate?: string;  // action urgente à prendre
}

export interface SolVisite {
  humidite: 'sec' | 'normal' | 'humide';
  ph: number;
  drainage: 'bon' | 'moyen' | 'mauvais';
}

export interface IrrigationVisite {
  type: string;
  probleme: string | null;
}

export interface Recommandation {
  id: string;
  type: 'traitement' | 'irrigation' | 'fertilisation' | 'surveillance' | 'recolte';
  priorite: 'urgente' | 'normale' | 'basse';
  description: string;
  produitSuggere?: string;
  delaiJours: number;
}

export interface Visite {
  id: string;
  parcelleId: string;
  technicienId: string;
  date: Date;
  statut: StatutVisite;
  etapeActuelle: EtapeVisite;
  observations: ObservationsVisite;
  sol: SolVisite;
  irrigation: IrrigationVisite;
  recommandations: Recommandation[];
  photos: string[];
  rapport: string | null;
  duree: number;                // en minutes
}
