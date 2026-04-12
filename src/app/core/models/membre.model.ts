export type RoleMembre = 'technicien' | 'chef_equipe' | 'ouvrier' | 'applicateur';

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
