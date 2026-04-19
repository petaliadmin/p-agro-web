import { Recolte } from '../../app/core/models/recolte.model';

// Rendements réalistes sénégalais :
// Riz irrigué: 4-6 t/ha | Riz pluvial: 1.5-3 t/ha
// Arachide: 0.8-1.5 t/ha | Oignon: 20-30 t/ha
// Tomate: 15-25 t/ha | Maïs: 2-4 t/ha | Mil: 0.5-1.2 t/ha

export const MOCK_RECOLTES: Recolte[] = [
  // Parcelle p001 — Riz irrigué (Walo Nord, 12.5 ha)
  {
    id: 'rec001',
    parcelleId: 'p001',
    campagneId: 'camp001',
    culture: 'riz',
    variete: 'Sahel 108',
    dateRecolte: new Date('2025-12-15'),
    quantiteRecoltee: 62500,       // 62.5 tonnes
    superficie: 12.5,
    rendement: 5.0,                // 62500/1000/12.5
    pertesPostRecolte: 9375,       // 15% pertes
    tauxPerte: 15,
    qualite: 'A',
    destination: 'vente',
    prixVente: 250,                // FCFA/kg
    revenuTotal: 13281250,         // (62500 - 9375) * 250
    observations: 'Bonne campagne, rendement supérieur à la moyenne régionale.',
  },
  {
    id: 'rec002',
    parcelleId: 'p001',
    culture: 'riz',
    variete: 'Sahel 108',
    dateRecolte: new Date('2025-06-20'),
    quantiteRecoltee: 56250,
    superficie: 12.5,
    rendement: 4.5,
    pertesPostRecolte: 11250,      // 20% pertes
    tauxPerte: 20,
    qualite: 'B',
    destination: 'vente',
    prixVente: 240,
    revenuTotal: 10800000,
    observations: 'Campagne contre-saison froide. Attaque de pyriculariose en floraison.',
  },

  // Parcelle p002 — Riz irrigué (Podor Est, 8 ha)
  {
    id: 'rec003',
    parcelleId: 'p002',
    campagneId: 'camp002',
    culture: 'riz',
    variete: 'Sahel 202',
    dateRecolte: new Date('2025-12-20'),
    quantiteRecoltee: 36000,
    superficie: 8,
    rendement: 4.5,
    pertesPostRecolte: 7200,
    tauxPerte: 20,
    qualite: 'B',
    destination: 'vente',
    prixVente: 250,
    revenuTotal: 7200000,
    observations: 'Rendement moyen, problème irrigation canal principal.',
  },

  // Parcelle p003 — Arachide (Kaolack, 15 ha)
  {
    id: 'rec004',
    parcelleId: 'p003',
    culture: 'arachide',
    variete: '55-437',
    dateRecolte: new Date('2025-11-10'),
    quantiteRecoltee: 18000,
    superficie: 15,
    rendement: 1.2,
    pertesPostRecolte: 2700,
    tauxPerte: 15,
    qualite: 'A',
    destination: 'vente',
    prixVente: 300,
    revenuTotal: 4590000,
    observations: 'Bon rendement pour la zone. Variété 55-437 performante.',
  },
  {
    id: 'rec005',
    parcelleId: 'p003',
    culture: 'arachide',
    variete: '55-437',
    dateRecolte: new Date('2024-11-15'),
    quantiteRecoltee: 12750,
    superficie: 15,
    rendement: 0.85,
    pertesPostRecolte: 5100,       // 40% pertes — critique !
    tauxPerte: 40,
    qualite: 'C',
    destination: 'stockage',
    prixVente: 280,
    revenuTotal: 2142000,
    observations: 'Forte sécheresse en fin de cycle. Pertes post-récolte élevées (stockage inadéquat).',
  },

  // Parcelle p004 — Oignon (Potou, 3 ha)
  {
    id: 'rec006',
    parcelleId: 'p004',
    culture: 'oignon',
    variete: 'Violet de Galmi',
    dateRecolte: new Date('2026-03-15'),
    quantiteRecoltee: 75000,
    superficie: 3,
    rendement: 25.0,
    pertesPostRecolte: 15000,      // 20% pertes
    tauxPerte: 20,
    qualite: 'A',
    destination: 'vente',
    prixVente: 350,
    revenuTotal: 21000000,
    observations: 'Excellent rendement. Irrigation goutte-à-goutte efficace.',
  },

  // Parcelle p005 — Tomate (Notto, 2 ha)
  {
    id: 'rec007',
    parcelleId: 'p005',
    culture: 'tomate',
    variete: 'Mongal F1',
    dateRecolte: new Date('2026-02-28'),
    quantiteRecoltee: 40000,
    superficie: 2,
    rendement: 20.0,
    pertesPostRecolte: 16000,      // 40% pertes — critique !
    tauxPerte: 40,
    qualite: 'B',
    destination: 'transformation',
    prixVente: 200,
    revenuTotal: 4800000,
    observations: 'Pertes élevées faute de chambre froide. Acheminement vers usine SOCAS.',
  },

  // Parcelle p006 — Maïs (Kolda, 6 ha)
  {
    id: 'rec008',
    parcelleId: 'p006',
    culture: 'mais',
    variete: 'Early Thai',
    dateRecolte: new Date('2025-10-25'),
    quantiteRecoltee: 18000,
    superficie: 6,
    rendement: 3.0,
    pertesPostRecolte: 1800,
    tauxPerte: 10,
    qualite: 'A',
    destination: 'autoconsommation',
    observations: 'Bonne pluviométrie Casamance. Partie autoconsommation familiale.',
  },

  // Parcelle p007 — Mil (Thiès, 10 ha)
  {
    id: 'rec009',
    parcelleId: 'p007',
    culture: 'mil',
    variete: 'Souna 3',
    dateRecolte: new Date('2025-11-20'),
    quantiteRecoltee: 8000,
    superficie: 10,
    rendement: 0.8,
    pertesPostRecolte: 800,
    tauxPerte: 10,
    qualite: 'B',
    destination: 'autoconsommation',
    prixVente: 200,
    revenuTotal: 1440000,
    observations: 'Rendement moyen. Sol dior fatigué, rotation recommandée.',
  },
  {
    id: 'rec010',
    parcelleId: 'p007',
    culture: 'mil',
    variete: 'Souna 3',
    dateRecolte: new Date('2024-11-18'),
    quantiteRecoltee: 10000,
    superficie: 10,
    rendement: 1.0,
    pertesPostRecolte: 1500,
    tauxPerte: 15,
    qualite: 'A',
    destination: 'vente',
    prixVente: 190,
    revenuTotal: 1615000,
    observations: 'Campagne précédente correcte avec bonnes pluies.',
  },
];
