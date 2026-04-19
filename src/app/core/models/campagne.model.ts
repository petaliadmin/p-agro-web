import { CultureType, TypeCampagne } from './parcelle.model';
import { TypeTache } from './tache.model';

export type StatutCampagne = 'planifiee' | 'en_cours' | 'terminee';

export interface EtapeCampagne {
  ordre: number;
  typeTache: TypeTache;
  label: string;
  delaiJoursApresSemis: number;  // jours après la date de semis
  dureeEstimee: number;          // jours
  description: string;
}

export interface Campagne {
  id: string;
  parcelleId: string;
  culture: CultureType;
  variete?: string;
  typeCampagne: TypeCampagne;
  dateDebut: Date;
  dateFin?: Date;
  statut: StatutCampagne;
  etapes: EtapeCampagne[];
  tacheIds: string[];            // IDs des tâches générées
  progressionPct: number;        // 0-100, calculé
  createdAt: Date;
  rendementFinal?: number;       // t/ha — renseigné à la clôture
  observationsCloture?: string;  // bilan libre à la clôture
}

// Templates de campagne par culture (enchaînement type)
export const TEMPLATES_CAMPAGNE: Record<CultureType, EtapeCampagne[]> = {
  riz: [
    { ordre: 1, typeTache: 'preparation_sol', label: 'Préparation du sol (labour + planage)', delaiJoursApresSemis: -15, dureeEstimee: 5, description: 'Labour, planage et mise en boue de la parcelle' },
    { ordre: 2, typeTache: 'semis', label: 'Semis / Repiquage', delaiJoursApresSemis: 0, dureeEstimee: 3, description: 'Semis direct ou repiquage des plants de riz' },
    { ordre: 3, typeTache: 'fertilisation', label: 'Fertilisation de fond (DAP/NPK)', delaiJoursApresSemis: 0, dureeEstimee: 1, description: 'Apport de DAP 18-46-0 ou NPK 15-15-15 au semis' },
    { ordre: 4, typeTache: 'desherbage', label: 'Désherbage', delaiJoursApresSemis: 21, dureeEstimee: 3, description: 'Désherbage manuel ou chimique à 3 semaines' },
    { ordre: 5, typeTache: 'fertilisation', label: 'Fertilisation azotée (urée tallage)', delaiJoursApresSemis: 30, dureeEstimee: 1, description: 'Apport d\'urée 46% au stade tallage' },
    { ordre: 6, typeTache: 'traitement', label: 'Traitement phytosanitaire', delaiJoursApresSemis: 45, dureeEstimee: 2, description: 'Traitement fongicide/insecticide si nécessaire' },
    { ordre: 7, typeTache: 'fertilisation', label: 'Fertilisation azotée (urée montaison)', delaiJoursApresSemis: 60, dureeEstimee: 1, description: 'Deuxième apport d\'urée au stade montaison' },
    { ordre: 8, typeTache: 'irrigation', label: 'Gestion irrigation (assec)', delaiJoursApresSemis: 75, dureeEstimee: 5, description: 'Assec pré-récolte, drainage de la parcelle' },
    { ordre: 9, typeTache: 'recolte', label: 'Récolte', delaiJoursApresSemis: 120, dureeEstimee: 5, description: 'Récolte mécanique ou manuelle, mise en sacs' },
  ],
  arachide: [
    { ordre: 1, typeTache: 'preparation_sol', label: 'Préparation du sol (labour)', delaiJoursApresSemis: -10, dureeEstimee: 3, description: 'Labour léger à la charrue ou au tracteur' },
    { ordre: 2, typeTache: 'semis', label: 'Semis', delaiJoursApresSemis: 0, dureeEstimee: 3, description: 'Semis en ligne avec semoir ou manuel, écartement 50x15cm' },
    { ordre: 3, typeTache: 'fertilisation', label: 'Fertilisation de fond (TSP/NPK)', delaiJoursApresSemis: 0, dureeEstimee: 1, description: 'Apport de TSP ou NPK au semis' },
    { ordre: 4, typeTache: 'sarclage', label: 'Premier sarclage', delaiJoursApresSemis: 15, dureeEstimee: 3, description: 'Sarclage manuel ou attelé à 15 jours' },
    { ordre: 5, typeTache: 'sarclage', label: 'Deuxième sarclage + buttage', delaiJoursApresSemis: 30, dureeEstimee: 3, description: 'Sarclage-buttage pour favoriser la fructification' },
    { ordre: 6, typeTache: 'traitement', label: 'Traitement insecticide', delaiJoursApresSemis: 40, dureeEstimee: 1, description: 'Traitement contre pucerons et chenilles si nécessaire' },
    { ordre: 7, typeTache: 'recolte', label: 'Récolte (soulevage + séchage)', delaiJoursApresSemis: 90, dureeEstimee: 7, description: 'Soulevage, séchage au champ, battage et mise en sacs' },
  ],
  mais: [
    { ordre: 1, typeTache: 'preparation_sol', label: 'Préparation du sol', delaiJoursApresSemis: -10, dureeEstimee: 3, description: 'Labour et émottage' },
    { ordre: 2, typeTache: 'semis', label: 'Semis', delaiJoursApresSemis: 0, dureeEstimee: 2, description: 'Semis en poquets, écartement 75x25cm' },
    { ordre: 3, typeTache: 'fertilisation', label: 'Fertilisation de fond (NPK)', delaiJoursApresSemis: 0, dureeEstimee: 1, description: 'Apport NPK 15-15-15 au semis' },
    { ordre: 4, typeTache: 'sarclage', label: 'Sarclage + démariage', delaiJoursApresSemis: 15, dureeEstimee: 3, description: 'Sarclage et démariage à 2 plants par poquet' },
    { ordre: 5, typeTache: 'fertilisation', label: 'Fertilisation azotée (urée)', delaiJoursApresSemis: 30, dureeEstimee: 1, description: 'Apport d\'urée au stade montaison' },
    { ordre: 6, typeTache: 'traitement', label: 'Traitement phytosanitaire', delaiJoursApresSemis: 35, dureeEstimee: 1, description: 'Traitement foreur de tige et chenille légionnaire' },
    { ordre: 7, typeTache: 'recolte', label: 'Récolte', delaiJoursApresSemis: 100, dureeEstimee: 5, description: 'Récolte des épis, égrenage et stockage' },
  ],
  mil: [
    { ordre: 1, typeTache: 'preparation_sol', label: 'Préparation du sol', delaiJoursApresSemis: -7, dureeEstimee: 2, description: 'Grattage léger ou labour superficiel' },
    { ordre: 2, typeTache: 'semis', label: 'Semis', delaiJoursApresSemis: 0, dureeEstimee: 2, description: 'Semis en poquets après premières pluies, écartement 90x90cm' },
    { ordre: 3, typeTache: 'sarclage', label: 'Premier sarclage + démariage', delaiJoursApresSemis: 15, dureeEstimee: 3, description: 'Sarclage et démariage à 3 plants par poquet' },
    { ordre: 4, typeTache: 'fertilisation', label: 'Fertilisation (urée)', delaiJoursApresSemis: 25, dureeEstimee: 1, description: 'Apport d\'urée si disponible' },
    { ordre: 5, typeTache: 'sarclage', label: 'Deuxième sarclage', delaiJoursApresSemis: 40, dureeEstimee: 2, description: 'Sarclage d\'entretien' },
    { ordre: 6, typeTache: 'recolte', label: 'Récolte', delaiJoursApresSemis: 90, dureeEstimee: 5, description: 'Coupe des chandelles, séchage et battage' },
  ],
  oignon: [
    { ordre: 1, typeTache: 'preparation_sol', label: 'Préparation planches', delaiJoursApresSemis: -10, dureeEstimee: 3, description: 'Confection des planches surélevées avec fumure organique' },
    { ordre: 2, typeTache: 'semis', label: 'Repiquage', delaiJoursApresSemis: 0, dureeEstimee: 3, description: 'Repiquage des plants de pépinière, écartement 15x10cm' },
    { ordre: 3, typeTache: 'irrigation', label: 'Irrigation régulière', delaiJoursApresSemis: 1, dureeEstimee: 60, description: 'Arrosage tous les 2-3 jours' },
    { ordre: 4, typeTache: 'fertilisation', label: 'Fertilisation NPK + urée', delaiJoursApresSemis: 15, dureeEstimee: 1, description: 'NPK de fond + urée en couverture' },
    { ordre: 5, typeTache: 'sarclage', label: 'Sarclage + binage', delaiJoursApresSemis: 21, dureeEstimee: 2, description: 'Sarclage entre les planches' },
    { ordre: 6, typeTache: 'traitement', label: 'Traitement fongicide (mildiou)', delaiJoursApresSemis: 30, dureeEstimee: 1, description: 'Mancozèbe ou métalaxyl contre mildiou' },
    { ordre: 7, typeTache: 'recolte', label: 'Récolte + séchage', delaiJoursApresSemis: 120, dureeEstimee: 5, description: 'Arrachage, séchage au soleil 7-10 jours, stockage' },
  ],
  tomate: [
    { ordre: 1, typeTache: 'preparation_sol', label: 'Préparation du sol + billons', delaiJoursApresSemis: -10, dureeEstimee: 3, description: 'Confection des billons, fumure organique de fond' },
    { ordre: 2, typeTache: 'semis', label: 'Repiquage', delaiJoursApresSemis: 0, dureeEstimee: 2, description: 'Repiquage plants de pépinière, écartement 40x50cm' },
    { ordre: 3, typeTache: 'irrigation', label: 'Irrigation goutte-à-goutte', delaiJoursApresSemis: 1, dureeEstimee: 80, description: 'Irrigation régulière selon besoins' },
    { ordre: 4, typeTache: 'fertilisation', label: 'Fertilisation NPK', delaiJoursApresSemis: 7, dureeEstimee: 1, description: 'Apport NPK 15-15-15 de fond' },
    { ordre: 5, typeTache: 'sarclage', label: 'Sarclage + tuteurage', delaiJoursApresSemis: 20, dureeEstimee: 3, description: 'Sarclage et installation des tuteurs' },
    { ordre: 6, typeTache: 'traitement', label: 'Traitement phytosanitaire', delaiJoursApresSemis: 25, dureeEstimee: 1, description: 'Traitement préventif mildiou + insectes' },
    { ordre: 7, typeTache: 'fertilisation', label: 'Fertilisation urée (floraison)', delaiJoursApresSemis: 35, dureeEstimee: 1, description: 'Apport d\'urée à la floraison' },
    { ordre: 8, typeTache: 'recolte', label: 'Récolte échelonnée', delaiJoursApresSemis: 75, dureeEstimee: 30, description: 'Récolte tous les 3-4 jours sur 4-6 semaines' },
  ],
};
