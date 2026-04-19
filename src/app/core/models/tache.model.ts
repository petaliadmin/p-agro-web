export type TypeTache = 'semis' | 'irrigation' | 'traitement' | 'fertilisation' | 'desherbage' | 'recolte' | 'inspection' | 'labour' | 'billonnage' | 'sarclage' | 'preparation_sol' | 'buttage';
export type PrioriteTache = 'urgent' | 'haute' | 'normale' | 'basse';
export type StatutTache = 'todo' | 'en_cours' | 'done' | 'reporte';
export type ModeTravail = 'manuel' | 'tracteur' | 'traction_animale';

export interface Tache {
  id: string;
  titre: string;
  type: TypeTache;
  priorite: PrioriteTache;
  statut: StatutTache;
  parcelleId: string;
  equipeId: string;
  dateDebut: Date;
  dateFin: Date;
  description: string;
  ressources: string[];
  completionPct: number;

  // Champs enrichis context.md
  modeTravail?: ModeTravail;
  mainOeuvre?: number;           // nombre de personnes
  coutMainOeuvre?: number;       // FCFA
  campagneId?: string;           // lien vers la campagne
}

export interface KanbanColumn {
  id: StatutTache;
  label: string;
  color: string;
  taches: Tache[];
}
