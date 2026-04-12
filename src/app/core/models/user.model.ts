export type UserRole = 'superviseur' | 'directeur' | 'technicien';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  equipeId?: string;
  avatar?: string;
  token?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface Notification {
  id: string;
  type: 'alerte' | 'info' | 'succes' | 'avertissement';
  titre: string;
  message: string;
  date: Date;
  lue: boolean;
  lienId?: string;
  lienType?: 'parcelle' | 'visite' | 'tache' | 'intrant';
}

export interface Breadcrumb {
  label: string;
  route?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'badge' | 'date' | 'number' | 'actions' | 'avatar' | 'progress';
  sortable?: boolean;
  width?: string;
}

export interface MeteoJour {
  date: Date;
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  condition: 'soleil' | 'nuageux' | 'pluie' | 'orage' | 'vent';
  humidite: number;
  vent: number;
  ville: string;
}
