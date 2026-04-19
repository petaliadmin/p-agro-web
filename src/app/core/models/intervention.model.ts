export type TypeIntervention =
  | 'preparation_sol' | 'labour' | 'billonnage' | 'semis'
  | 'irrigation' | 'fertilisation' | 'traitement_phyto'
  | 'desherbage' | 'sarclage' | 'buttage' | 'recolte' | 'post_recolte';

export type StatutIntervention = 'planifiee' | 'en_cours' | 'terminee' | 'annulee';

export interface Intervention {
  id: string;
  parcelleId: string;
  campagneId: string;
  type: TypeIntervention;
  label: string;
  datePrevue: Date;
  dateRealisee?: Date;
  statut: StatutIntervention;
  observations?: string;
  produitUtilise?: string;
  dose?: string;
  coutEstime: number;       // FCFA
  coutReel?: number;        // FCFA
  responsableId: string;
  mainOeuvre: number;        // nb personnes
  dureeEstimee: number;      // heures
  ordre: number;
}

export const INTERVENTION_ICONS: Record<TypeIntervention, string> = {
  preparation_sol: 'construction',
  labour: 'agriculture',
  billonnage: 'landscape',
  semis: 'grass',
  irrigation: 'water_drop',
  fertilisation: 'science',
  traitement_phyto: 'bug_report',
  desherbage: 'eco',
  sarclage: 'content_cut',
  buttage: 'terrain',
  recolte: 'inventory',
  post_recolte: 'warehouse',
};

export const INTERVENTION_LABELS: Record<TypeIntervention, string> = {
  preparation_sol: 'Préparation du sol',
  labour: 'Labour',
  billonnage: 'Billonnage',
  semis: 'Semis / Repiquage',
  irrigation: 'Irrigation',
  fertilisation: 'Fertilisation',
  traitement_phyto: 'Traitement phyto.',
  desherbage: 'Désherbage',
  sarclage: 'Sarclage',
  buttage: 'Buttage',
  recolte: 'Récolte',
  post_recolte: 'Post-récolte',
};

export const STATUT_COLORS: Record<StatutIntervention, { bg: string; text: string; icon: string }> = {
  planifiee: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', icon: 'schedule' },
  en_cours: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: 'pending' },
  terminee: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: 'check_circle' },
  annulee: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', icon: 'cancel' },
};

export const STATUT_LABELS: Record<StatutIntervention, string> = {
  planifiee: 'Planifiée',
  en_cours: 'En cours',
  terminee: 'Terminée',
  annulee: 'Annulée',
};

/** Templates d'interventions par culture avec coûts estimés */
export interface InterventionTemplate {
  type: TypeIntervention;
  label: string;
  delaiJours: number;       // jours après date de semis
  dureeEstimee: number;      // heures
  coutEstime: number;        // FCFA
  mainOeuvre: number;
  produit?: string;
  dose?: string;
}

export const TEMPLATES_INTERVENTIONS: Record<string, InterventionTemplate[]> = {
  riz: [
    { type: 'preparation_sol', label: 'Préparation sol (labour + planage)', delaiJours: -15, dureeEstimee: 40, coutEstime: 75000, mainOeuvre: 4 },
    { type: 'semis', label: 'Semis / Repiquage', delaiJours: 0, dureeEstimee: 24, coutEstime: 35000, mainOeuvre: 6 },
    { type: 'fertilisation', label: 'Fertilisation fond (DAP/NPK)', delaiJours: 0, dureeEstimee: 4, coutEstime: 45000, mainOeuvre: 2, produit: 'DAP 18-46-0', dose: '150 kg/ha' },
    { type: 'desherbage', label: 'Désherbage', delaiJours: 21, dureeEstimee: 16, coutEstime: 25000, mainOeuvre: 5 },
    { type: 'fertilisation', label: 'Urée tallage', delaiJours: 30, dureeEstimee: 4, coutEstime: 30000, mainOeuvre: 2, produit: 'Urée 46%', dose: '100 kg/ha' },
    { type: 'traitement_phyto', label: 'Traitement phytosanitaire', delaiJours: 45, dureeEstimee: 6, coutEstime: 20000, mainOeuvre: 2, produit: 'Fongicide', dose: '2 L/ha' },
    { type: 'fertilisation', label: 'Urée montaison', delaiJours: 60, dureeEstimee: 4, coutEstime: 30000, mainOeuvre: 2, produit: 'Urée 46%', dose: '100 kg/ha' },
    { type: 'irrigation', label: 'Assec pré-récolte', delaiJours: 75, dureeEstimee: 8, coutEstime: 15000, mainOeuvre: 2 },
    { type: 'recolte', label: 'Récolte', delaiJours: 120, dureeEstimee: 40, coutEstime: 85000, mainOeuvre: 8 },
  ],
  arachide: [
    { type: 'preparation_sol', label: 'Labour', delaiJours: -10, dureeEstimee: 24, coutEstime: 50000, mainOeuvre: 3 },
    { type: 'semis', label: 'Semis', delaiJours: 0, dureeEstimee: 16, coutEstime: 25000, mainOeuvre: 5 },
    { type: 'fertilisation', label: 'Fertilisation fond (TSP)', delaiJours: 0, dureeEstimee: 4, coutEstime: 35000, mainOeuvre: 2, produit: 'TSP', dose: '100 kg/ha' },
    { type: 'sarclage', label: 'Premier sarclage', delaiJours: 15, dureeEstimee: 16, coutEstime: 20000, mainOeuvre: 4 },
    { type: 'sarclage', label: 'Deuxième sarclage + buttage', delaiJours: 30, dureeEstimee: 16, coutEstime: 20000, mainOeuvre: 4 },
    { type: 'traitement_phyto', label: 'Traitement insecticide', delaiJours: 40, dureeEstimee: 4, coutEstime: 15000, mainOeuvre: 2, produit: 'Insecticide', dose: '1.5 L/ha' },
    { type: 'recolte', label: 'Soulevage + séchage', delaiJours: 90, dureeEstimee: 56, coutEstime: 65000, mainOeuvre: 6 },
  ],
  mais: [
    { type: 'preparation_sol', label: 'Préparation sol', delaiJours: -10, dureeEstimee: 24, coutEstime: 50000, mainOeuvre: 3 },
    { type: 'semis', label: 'Semis', delaiJours: 0, dureeEstimee: 12, coutEstime: 20000, mainOeuvre: 4 },
    { type: 'fertilisation', label: 'NPK fond', delaiJours: 0, dureeEstimee: 4, coutEstime: 40000, mainOeuvre: 2, produit: 'NPK 15-15-15', dose: '200 kg/ha' },
    { type: 'sarclage', label: 'Sarclage + démariage', delaiJours: 15, dureeEstimee: 16, coutEstime: 20000, mainOeuvre: 5 },
    { type: 'fertilisation', label: 'Urée montaison', delaiJours: 30, dureeEstimee: 4, coutEstime: 25000, mainOeuvre: 2, produit: 'Urée 46%', dose: '100 kg/ha' },
    { type: 'traitement_phyto', label: 'Traitement phyto.', delaiJours: 35, dureeEstimee: 4, coutEstime: 15000, mainOeuvre: 2 },
    { type: 'recolte', label: 'Récolte', delaiJours: 100, dureeEstimee: 40, coutEstime: 60000, mainOeuvre: 6 },
  ],
  mil: [
    { type: 'preparation_sol', label: 'Grattage sol', delaiJours: -7, dureeEstimee: 16, coutEstime: 25000, mainOeuvre: 3 },
    { type: 'semis', label: 'Semis', delaiJours: 0, dureeEstimee: 12, coutEstime: 15000, mainOeuvre: 4 },
    { type: 'sarclage', label: 'Sarclage + démariage', delaiJours: 15, dureeEstimee: 16, coutEstime: 20000, mainOeuvre: 4 },
    { type: 'fertilisation', label: 'Urée', delaiJours: 25, dureeEstimee: 4, coutEstime: 20000, mainOeuvre: 2, produit: 'Urée 46%', dose: '50 kg/ha' },
    { type: 'sarclage', label: 'Deuxième sarclage', delaiJours: 40, dureeEstimee: 12, coutEstime: 15000, mainOeuvre: 3 },
    { type: 'recolte', label: 'Récolte', delaiJours: 90, dureeEstimee: 40, coutEstime: 45000, mainOeuvre: 5 },
  ],
  oignon: [
    { type: 'preparation_sol', label: 'Préparation planches', delaiJours: -10, dureeEstimee: 24, coutEstime: 45000, mainOeuvre: 4 },
    { type: 'semis', label: 'Repiquage', delaiJours: 0, dureeEstimee: 20, coutEstime: 30000, mainOeuvre: 6 },
    { type: 'irrigation', label: 'Irrigation régulière', delaiJours: 1, dureeEstimee: 8, coutEstime: 35000, mainOeuvre: 2 },
    { type: 'fertilisation', label: 'NPK + urée', delaiJours: 15, dureeEstimee: 4, coutEstime: 40000, mainOeuvre: 2, produit: 'NPK + Urée', dose: '200 kg/ha' },
    { type: 'sarclage', label: 'Sarclage + binage', delaiJours: 21, dureeEstimee: 12, coutEstime: 15000, mainOeuvre: 3 },
    { type: 'traitement_phyto', label: 'Fongicide mildiou', delaiJours: 30, dureeEstimee: 4, coutEstime: 18000, mainOeuvre: 2, produit: 'Mancozèbe', dose: '2.5 kg/ha' },
    { type: 'recolte', label: 'Récolte + séchage', delaiJours: 120, dureeEstimee: 40, coutEstime: 55000, mainOeuvre: 6 },
  ],
  tomate: [
    { type: 'preparation_sol', label: 'Préparation sol + billons', delaiJours: -10, dureeEstimee: 24, coutEstime: 50000, mainOeuvre: 4 },
    { type: 'semis', label: 'Repiquage', delaiJours: 0, dureeEstimee: 16, coutEstime: 25000, mainOeuvre: 5 },
    { type: 'irrigation', label: 'Irrigation goutte-à-goutte', delaiJours: 1, dureeEstimee: 8, coutEstime: 40000, mainOeuvre: 2 },
    { type: 'fertilisation', label: 'NPK fond', delaiJours: 7, dureeEstimee: 4, coutEstime: 40000, mainOeuvre: 2, produit: 'NPK 15-15-15', dose: '200 kg/ha' },
    { type: 'sarclage', label: 'Sarclage + tuteurage', delaiJours: 20, dureeEstimee: 16, coutEstime: 25000, mainOeuvre: 4 },
    { type: 'traitement_phyto', label: 'Traitement préventif', delaiJours: 25, dureeEstimee: 4, coutEstime: 18000, mainOeuvre: 2, produit: 'Fongicide + insecticide' },
    { type: 'fertilisation', label: 'Urée floraison', delaiJours: 35, dureeEstimee: 4, coutEstime: 25000, mainOeuvre: 2, produit: 'Urée 46%', dose: '75 kg/ha' },
    { type: 'recolte', label: 'Récolte échelonnée', delaiJours: 75, dureeEstimee: 60, coutEstime: 75000, mainOeuvre: 5 },
  ],
};
