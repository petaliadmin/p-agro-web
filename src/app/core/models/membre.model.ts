export type RoleMembre = 'technicien' | 'chef_equipe' | 'ouvrier' | 'applicateur';
export type TypeMainOeuvre = 'familial' | 'journalier' | 'groupement' | 'permanent';

export interface Membre {
  id: string;
  nom: string;
  prenom: string;
  role: RoleMembre;
  equipeId: string;
  telephone: string;
  disponible: boolean;
  tachesEnCours: number;
  performanceScore: number;     // 0-100
  avatar?: string;
  typeMainOeuvre?: TypeMainOeuvre;
  coutJournalier?: number;      // FCFA/jour
}

export interface Equipe {
  id: string;
  nom: string;
  chefId: string;
  zone: string;
  membres: string[];            // IDs des membres
  tachesEnCours: number;
  performanceScore: number;     // 0-100
  couleur: string;              // CSS color hex
}
