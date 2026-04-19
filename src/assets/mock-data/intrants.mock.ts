import { Intrant } from '../../app/core/models/intrant.model';
import { User, Notification, MeteoJour } from '../../app/core/models/user.model';

export const MOCK_INTRANTS: Intrant[] = [
  {
    id: 'i001', nom: 'Urée 46% SENCHIM', type: 'engrais',
    quantiteStock: 450, unite: 'kg', seuilAlerte: 200,
    dateExpiration: new Date('2025-06-30'), fournisseur: 'SENCHIM Dakar',
    prixUnitaire: 850,
    origine: 'marche',
    doseRecommandee: 100,
    frequenceApplication: '2 apports : tallage + montaison',
    culturesCibles: ['riz', 'mais'],
    mouvements: [
      { id: 'm001', date: new Date('2024-10-15'), type: 'entree', quantite: 500, motif: 'Achat campagne', operateurId: 'admin001' },
      { id: 'm002', date: new Date('2024-11-05'), type: 'sortie', quantite: 50, parcelleId: 'p001', motif: 'Fertilisation top-dressing', operateurId: 'tech001' },
    ],
  },
  {
    id: 'i002', nom: 'NPK 15-15-15 SIFCA', type: 'engrais',
    quantiteStock: 180, unite: 'kg', seuilAlerte: 200,
    dateExpiration: new Date('2025-12-31'), fournisseur: 'SIFCA',
    prixUnitaire: 920,
    origine: 'marche',
    doseRecommandee: 150,
    frequenceApplication: '1 apport de fond avant semis',
    culturesCibles: ['arachide', 'mais', 'mil', 'oignon'],
    mouvements: [
      { id: 'm003', date: new Date('2024-09-20'), type: 'entree', quantite: 300, motif: 'Achat campagne', operateurId: 'admin001' },
      { id: 'm004', date: new Date('2024-10-10'), type: 'sortie', quantite: 120, parcelleId: 'p004', motif: 'Fertilisation de fond', operateurId: 'tech003' },
    ],
  },
  {
    id: 'i003', nom: 'Tricyclazole 75 WP', type: 'fongicide',
    quantiteStock: 12, unite: 'kg', seuilAlerte: 15,
    dateExpiration: new Date('2024-12-31'), fournisseur: 'Bayer CropScience',
    prixUnitaire: 18500,
    origine: 'marche',
    doseRecommandee: 0.3,
    frequenceApplication: '2 applications à 15 jours d\'intervalle',
    culturesCibles: ['riz'],
    mouvements: [
      { id: 'm005', date: new Date('2024-10-01'), type: 'entree', quantite: 25, motif: 'Achat stock urgence', operateurId: 'admin001' },
      { id: 'm006', date: new Date('2024-11-08'), type: 'sortie', quantite: 13, parcelleId: 'p002', motif: 'Traitement pyriculariose', operateurId: 'tech001' },
    ],
  },
  {
    id: 'i004', nom: 'Lambda-cyhalothrine 5 EC (Karaté)', type: 'pesticide',
    quantiteStock: 8, unite: 'L', seuilAlerte: 10,
    dateExpiration: new Date('2025-03-15'), fournisseur: 'Syngenta',
    prixUnitaire: 22000,
    origine: 'marche',
    doseRecommandee: 1,
    frequenceApplication: 'Selon pression parasitaire, max 3 applications',
    culturesCibles: ['mais', 'tomate', 'oignon'],
    mouvements: [
      { id: 'm007', date: new Date('2024-09-15'), type: 'entree', quantite: 20, motif: 'Achat campagne', operateurId: 'admin001' },
      { id: 'm008', date: new Date('2024-10-20'), type: 'sortie', quantite: 12, parcelleId: 'p003', motif: 'Traitement foreur tige', operateurId: 'tech002' },
    ],
  },
  {
    id: 'i005', nom: 'Mancozèbe 80 WP', type: 'fongicide',
    quantiteStock: 32, unite: 'kg', seuilAlerte: 20,
    dateExpiration: new Date('2025-08-30'), fournisseur: 'CERES SA',
    prixUnitaire: 4500,
    origine: 'cooperatif',
    doseRecommandee: 2.5,
    frequenceApplication: 'Toutes les 2 semaines en saison humide',
    culturesCibles: ['tomate', 'oignon'],
    mouvements: [
      { id: 'm009', date: new Date('2024-10-05'), type: 'entree', quantite: 40, motif: 'Achat stock', operateurId: 'admin001' },
      { id: 'm010', date: new Date('2024-11-01'), type: 'sortie', quantite: 8, parcelleId: 'p006', motif: 'Traitement mildiou', operateurId: 'tech002' },
    ],
  },
  {
    id: 'i006', nom: 'Semences Riz ISRIZ 114', type: 'semence',
    quantiteStock: 380, unite: 'kg', seuilAlerte: 100,
    dateExpiration: new Date('2025-06-01'), fournisseur: 'ISRA Saint-Louis',
    prixUnitaire: 650,
    origine: 'subvention',
    doseRecommandee: 80,
    frequenceApplication: '1 semis par campagne',
    culturesCibles: ['riz'],
    mouvements: [
      { id: 'm011', date: new Date('2024-09-01'), type: 'entree', quantite: 500, motif: 'Achat semences certifiées', operateurId: 'admin001' },
      { id: 'm012', date: new Date('2024-09-15'), type: 'sortie', quantite: 120, parcelleId: 'p001', motif: 'Semis hivernage', operateurId: 'tech001' },
    ],
  },
  {
    id: 'i007', nom: 'Glyphosate 480 SL', type: 'herbicide',
    quantiteStock: 5, unite: 'L', seuilAlerte: 15,
    dateExpiration: new Date('2024-11-30'), fournisseur: 'Dow AgroSciences',
    prixUnitaire: 8500,
    origine: 'marche',
    doseRecommandee: 3,
    frequenceApplication: '1 application pré-semis',
    culturesCibles: ['riz', 'mais', 'arachide'],
    mouvements: [
      { id: 'm013', date: new Date('2024-08-20'), type: 'entree', quantite: 30, motif: 'Achat désherbage', operateurId: 'admin001' },
      { id: 'm014', date: new Date('2024-09-10'), type: 'sortie', quantite: 25, motif: 'Désherbage pré-semis', operateurId: 'tech003' },
    ],
  },
  {
    id: 'i008', nom: 'Superphosphate Triple 46% (TSP)', type: 'engrais',
    quantiteStock: 260, unite: 'kg', seuilAlerte: 100,
    dateExpiration: new Date('2026-01-01'), fournisseur: 'SENCHIM Dakar',
    prixUnitaire: 1100,
    origine: 'marche',
    doseRecommandee: 100,
    frequenceApplication: '1 apport de fond au semis',
    culturesCibles: ['arachide', 'riz'],
    mouvements: [
      { id: 'm015', date: new Date('2024-09-01'), type: 'entree', quantite: 300, motif: 'Achat campagne', operateurId: 'admin001' },
      { id: 'm016', date: new Date('2024-10-21'), type: 'sortie', quantite: 40, parcelleId: 'p004', motif: 'Fertilisation fond arachide', operateurId: 'tech003' },
    ],
  },
  {
    id: 'i009', nom: 'DAP 18-46-0', type: 'engrais',
    quantiteStock: 320, unite: 'kg', seuilAlerte: 150,
    dateExpiration: new Date('2026-03-15'), fournisseur: 'ICS Mbao',
    prixUnitaire: 980,
    origine: 'subvention',
    doseRecommandee: 100,
    frequenceApplication: '1 apport au semis',
    culturesCibles: ['riz', 'mais', 'oignon'],
    mouvements: [
      { id: 'm017', date: new Date('2024-10-01'), type: 'entree', quantite: 400, motif: 'Subvention État campagne 2024', operateurId: 'admin001' },
      { id: 'm018', date: new Date('2024-10-15'), type: 'sortie', quantite: 80, parcelleId: 'p008', motif: 'Fertilisation fond riz Dagana', operateurId: 'tech001' },
    ],
  },
  {
    id: 'i010', nom: 'Décis 25 EC (Deltaméthrine)', type: 'pesticide',
    quantiteStock: 15, unite: 'L', seuilAlerte: 10,
    dateExpiration: new Date('2025-09-30'), fournisseur: 'Bayer CropScience',
    prixUnitaire: 15000,
    origine: 'marche',
    doseRecommandee: 0.5,
    frequenceApplication: 'Max 2 applications par campagne',
    culturesCibles: ['arachide', 'mil', 'mais'],
    mouvements: [
      { id: 'm019', date: new Date('2024-09-05'), type: 'entree', quantite: 20, motif: 'Achat campagne hivernage', operateurId: 'admin001' },
      { id: 'm020', date: new Date('2024-10-08'), type: 'sortie', quantite: 5, parcelleId: 'p004', motif: 'Traitement pucerons arachide', operateurId: 'tech003' },
    ],
  },
  {
    id: 'i011', nom: 'Semences Arachide 55-437', type: 'semence',
    quantiteStock: 850, unite: 'kg', seuilAlerte: 200,
    dateExpiration: new Date('2025-07-01'), fournisseur: 'ISRA Bambey',
    prixUnitaire: 450,
    origine: 'subvention',
    doseRecommandee: 120,
    frequenceApplication: '1 semis par campagne hivernage',
    culturesCibles: ['arachide'],
    mouvements: [
      { id: 'm021', date: new Date('2024-06-15'), type: 'entree', quantite: 1200, motif: 'Subvention semences certifiées ISRA', operateurId: 'admin001' },
      { id: 'm022', date: new Date('2024-07-10'), type: 'sortie', quantite: 264, parcelleId: 'p004', motif: 'Semis arachide Thiès', operateurId: 'tech003' },
      { id: 'm023', date: new Date('2024-07-12'), type: 'sortie', quantite: 126, parcelleId: 'p009', motif: 'Semis arachide Tambacounda', operateurId: 'tech007' },
    ],
  },
  {
    id: 'i012', nom: 'Semences Oignon Violet de Galmi', type: 'semence',
    quantiteStock: 45, unite: 'kg', seuilAlerte: 20,
    dateExpiration: new Date('2025-04-30'), fournisseur: 'Tropica Sem',
    prixUnitaire: 12000,
    origine: 'marche',
    doseRecommandee: 5,
    frequenceApplication: '1 semis en pépinière puis repiquage',
    culturesCibles: ['oignon'],
    mouvements: [
      { id: 'm024', date: new Date('2024-09-20'), type: 'entree', quantite: 60, motif: 'Achat semences contre-saison', operateurId: 'admin001' },
      { id: 'm025', date: new Date('2024-10-15'), type: 'sortie', quantite: 8, parcelleId: 'p006', motif: 'Semis pépinière Mboro', operateurId: 'tech002' },
      { id: 'm026', date: new Date('2024-11-01'), type: 'sortie', quantite: 7, parcelleId: 'p010', motif: 'Semis pépinière Potou', operateurId: 'tech004' },
    ],
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 'admin001', email: 'admin@agroassist.sn',
    nom: 'Konaté', prenom: 'Abdoulaye',
    role: 'directeur', token: 'mock-jwt-token-admin',
  },
  {
    id: 'sup001', email: 'superviseur@agroassist.sn',
    nom: 'Touré', prenom: 'Seydou',
    role: 'superviseur', token: 'mock-jwt-token-sup',
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n001', type: 'alerte', titre: 'Stock critique – Tricyclazole', message: 'Le stock de Tricyclazole 75 WP est en dessous du seuil d\'alerte (12 kg / seuil 15 kg).', date: new Date('2024-11-19T07:00:00'), lue: false, lienId: 'i003', lienType: 'intrant' },
  { id: 'n002', type: 'alerte', titre: 'Parcelle urgente – Casamance A', message: 'Double attaque détectée sur PAR-2024-003. Intervention requise.', date: new Date('2024-11-18T14:30:00'), lue: false, lienId: 'p003', lienType: 'parcelle' },
  { id: 'n003', type: 'avertissement', titre: 'Expiration imminente – Glyphosate', message: 'Le Glyphosate 480 SL expire le 30/11/2024. Utiliser en priorité ou retourner.', date: new Date('2024-11-17T09:00:00'), lue: true, lienId: 'i007', lienType: 'intrant' },
  { id: 'n004', type: 'info', titre: 'Visite planifiée demain', message: 'Visite de Walo Nord prévue demain 08h30 – Mamadou Diallo.', date: new Date('2024-11-19T08:00:00'), lue: false, lienId: 'v006', lienType: 'visite' },
  { id: 'n005', type: 'succes', titre: 'Tâche terminée – Désherbage Niayes', message: 'Le désherbage de la parcelle Niayes Oignon a été complété avec succès.', date: new Date('2024-11-11T16:00:00'), lue: true, lienId: 't007', lienType: 'tache' },
];

export const MOCK_METEO: MeteoJour[] = [
  { date: new Date(), temperature: 29, temperatureMin: 23, temperatureMax: 33, condition: 'soleil', humidite: 45, vent: 14, ville: 'Saint-Louis' },
  { date: new Date(Date.now() + 86400000), temperature: 27, temperatureMin: 22, temperatureMax: 31, condition: 'nuageux', humidite: 52, vent: 18, ville: 'Saint-Louis' },
  { date: new Date(Date.now() + 172800000), temperature: 25, temperatureMin: 21, temperatureMax: 29, condition: 'pluie', humidite: 68, vent: 22, ville: 'Saint-Louis' },
];
