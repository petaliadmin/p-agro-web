export type TypeTache = 'semis' | 'irrigation' | 'traitement' | 'fertilisation' | 'desherbage' | 'recolte' | 'inspection';
export type PrioriteTache = 'urgent' | 'haute' | 'normale' | 'basse';
export type StatutTache = 'todo' | 'en_cours' | 'done' | 'reporte';

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
}

export interface KanbanColumn {
  id: StatutTache;
  label: string;
  color: string;
  taches: Tache[];
}
