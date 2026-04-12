import { Tache } from '../../app/core/models/tache.model';
import { Equipe, Membre } from '../../app/core/models/membre.model';

export const MOCK_MEMBRES: Membre[] = [
  { id: 'tech001', nom: 'Diallo', prenom: 'Mamadou', role: 'technicien', equipeId: 'eq001', telephone: '+221 77 123 45 67', disponible: true, tachesEnCours: 3, performanceScore: 87 },
  { id: 'tech002', nom: 'Sarr', prenom: 'Fatou', role: 'technicien', equipeId: 'eq002', telephone: '+221 76 234 56 78', disponible: true, tachesEnCours: 2, performanceScore: 92 },
  { id: 'tech003', nom: 'Ndiaye', prenom: 'Ousmane', role: 'chef_equipe', equipeId: 'eq001', telephone: '+221 70 345 67 89', disponible: false, tachesEnCours: 5, performanceScore: 95 },
  { id: 'tech004', nom: 'Ba', prenom: 'Aissatou', role: 'applicateur', equipeId: 'eq002', telephone: '+221 78 456 78 90', disponible: true, tachesEnCours: 1, performanceScore: 78 },
  { id: 'tech005', nom: 'Seck', prenom: 'Ibrahima', role: 'ouvrier', equipeId: 'eq001', telephone: '+221 77 567 89 01', disponible: true, tachesEnCours: 2, performanceScore: 71 },
  { id: 'tech006', nom: 'Fall', prenom: 'Mariama', role: 'chef_equipe', equipeId: 'eq002', telephone: '+221 76 678 90 12', disponible: true, tachesEnCours: 4, performanceScore: 89 },
  { id: 'tech007', nom: 'Diop', prenom: 'Moussa', role: 'technicien', equipeId: 'eq003', telephone: '+221 70 789 01 23', disponible: true, tachesEnCours: 2, performanceScore: 83 },
  { id: 'tech008', nom: 'Cissé', prenom: 'Rokhaya', role: 'applicateur', equipeId: 'eq003', telephone: '+221 78 890 12 34', disponible: false, tachesEnCours: 3, performanceScore: 76 },
];

export const MOCK_EQUIPES: Equipe[] = [
  { id: 'eq001', nom: 'Équipe Fleuve Nord', chefId: 'tech003', zone: 'Vallée du Fleuve Sénégal', membres: ['tech001', 'tech003', 'tech005'], tachesEnCours: 10, performanceScore: 84, couleur: '#1A7A4A' },
  { id: 'eq002', nom: 'Équipe Casamance', chefId: 'tech006', zone: 'Casamance / Niayes', membres: ['tech002', 'tech004', 'tech006'], tachesEnCours: 7, performanceScore: 88, couleur: '#0D6B5E' },
  { id: 'eq003', nom: 'Équipe Bassin Arachidier', chefId: 'tech007', zone: 'Thiès / Louga / Diourbel', membres: ['tech007', 'tech008'], tachesEnCours: 5, performanceScore: 79, couleur: '#F5A623' },
];

// Helper : dates relatives à la semaine courante
function relDate(dayOffset: number): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(8, 0, 0, 0);
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayOffset);
  return d;
}

export const MOCK_TACHES: Tache[] = [
  {
    id: 't001', titre: 'Traitement fongicide Podor Est', type: 'traitement', priorite: 'urgent',
    statut: 'todo', parcelleId: 'p002', equipeId: 'eq001',
    dateDebut: relDate(0), dateFin: relDate(1),
    description: 'Application de Tricyclazole 75 WP contre la pyriculariose détectée lors de la dernière visite.',
    ressources: ['Tricyclazole 75 WP - 15 kg', 'Pulvérisateur à dos', 'EPI complet'],
    completionPct: 0,
  },
  {
    id: 't002', titre: 'Débouchage canal irrigation', type: 'irrigation', priorite: 'urgent',
    statut: 'en_cours', parcelleId: 'p002', equipeId: 'eq001',
    dateDebut: relDate(-1), dateFin: relDate(0),
    description: 'Dégagement du canal principal partiellement obstrué par des dépôts limoneux.',
    ressources: ['Pelle mécanique', '3 ouvriers', 'Camion'],
    completionPct: 60,
  },
  {
    id: 't003', titre: 'Traitement insecticide Casamance A', type: 'traitement', priorite: 'urgent',
    statut: 'todo', parcelleId: 'p003', equipeId: 'eq002',
    dateDebut: relDate(2), dateFin: relDate(2),
    description: 'Traitement combiné insecticide+fongicide pour foreur de tige et chenille légionnaire.',
    ressources: ['Lambda-cyhalothrine', 'Propiconazole', 'Pulvérisateur motorisé'],
    completionPct: 0,
  },
  {
    id: 't004', titre: 'Fertilisation azotée Walo Nord', type: 'fertilisation', priorite: 'normale',
    statut: 'todo', parcelleId: 'p001', equipeId: 'eq001',
    dateDebut: relDate(4), dateFin: relDate(4),
    description: 'Apport d\'urée 46% en top-dressing au stade montaison.',
    ressources: ['Urée 46% - 60 kg', 'Épandeur manuel'],
    completionPct: 0,
  },
  {
    id: 't005', titre: 'Récolte Mil Louga', type: 'recolte', priorite: 'haute',
    statut: 'en_cours', parcelleId: 'p005', equipeId: 'eq003',
    dateDebut: relDate(0), dateFin: relDate(4),
    description: 'Récolte mécanique et manuelle du mil. Mise en sacs et stockage au magasin.',
    ressources: ['Moissonneuse', '5 ouvriers', 'Sacs jute - 200 unités', 'Camion 5T'],
    completionPct: 40,
  },
  {
    id: 't006', titre: 'Semis Riz Dagana – Contre-saison', type: 'semis', priorite: 'haute',
    statut: 'todo', parcelleId: 'p008', equipeId: 'eq001',
    dateDebut: relDate(5), dateFin: relDate(7),
    description: 'Préparation sol et semis direct de riz ISRIZ 114 pour contre-saison froide.',
    ressources: ['Semences ISRIZ 114 - 185 kg', 'Tracteur', 'Semoir', '4 ouvriers'],
    completionPct: 0,
  },
  {
    id: 't007', titre: 'Désherbage Niayes Oignon', type: 'desherbage', priorite: 'normale',
    statut: 'done', parcelleId: 'p006', equipeId: 'eq002',
    dateDebut: relDate(-3), dateFin: relDate(-2),
    description: 'Désherbage manuel entre les planches de culture d\'oignon.',
    ressources: ['4 ouvriers', 'Outils manuels'],
    completionPct: 100,
  },
  {
    id: 't008', titre: 'Inspection sanitaire Tomate Casamance', type: 'inspection', priorite: 'haute',
    statut: 'todo', parcelleId: 'p007', equipeId: 'eq002',
    dateDebut: relDate(3), dateFin: relDate(3),
    description: 'Inspection complète de la tomate pour évaluer l\'étendue des dommages et planifier les traitements.',
    ressources: ['Kit diagnostic', 'Appareil photo'],
    completionPct: 0,
  },
  {
    id: 't009', titre: 'Traitement Mildiou Oignon', type: 'traitement', priorite: 'haute',
    statut: 'reporte', parcelleId: 'p006', equipeId: 'eq002',
    dateDebut: relDate(1), dateFin: relDate(2),
    description: 'Application mancozèbe reportée en attente de livraison produit.',
    ressources: ['Mancozèbe 80 WP - 8 kg', 'Spinosad', 'Pulvérisateur'],
    completionPct: 0,
  },
  {
    id: 't010', titre: 'Fertilisation Arachide Thiès', type: 'fertilisation', priorite: 'basse',
    statut: 'done', parcelleId: 'p004', equipeId: 'eq003',
    dateDebut: relDate(-5), dateFin: relDate(-4),
    description: 'Apport de superphosphate triple au stade gousses.',
    ressources: ['TSP 46% - 44 kg', 'Épandeur'],
    completionPct: 100,
  },
];
