import { HistoriqueCampagne } from '../../app/core/models/historique-campagne.model';

export const MOCK_HISTORIQUE_CAMPAGNES: HistoriqueCampagne[] = [
  // Parcelle p001 — Riz irrigué (Walo Nord)
  { id: 'hc001', parcelleId: 'p001', annee: 2024, saison: 'hivernage', culture: 'riz', variete: 'Sahel 108', rendement: 5.0, observations: 'Bonne campagne, irrigation maîtrisée.' },
  { id: 'hc002', parcelleId: 'p001', annee: 2024, saison: 'contre_saison_froide', culture: 'riz', variete: 'Sahel 108', rendement: 4.5, observations: 'Pyriculariose en floraison.' },
  { id: 'hc003', parcelleId: 'p001', annee: 2023, saison: 'hivernage', culture: 'riz', variete: 'Sahel 202', rendement: 4.2, observations: 'Inondation en début de cycle.' },

  // Parcelle p002 — Riz (Podor Est)
  { id: 'hc004', parcelleId: 'p002', annee: 2024, saison: 'hivernage', culture: 'riz', variete: 'Sahel 202', rendement: 4.5, observations: 'Problème canal irrigation.' },
  { id: 'hc005', parcelleId: 'p002', annee: 2023, saison: 'hivernage', culture: 'riz', variete: 'IR 1529', rendement: 3.8, observations: 'Salinité sol élevée.' },
  { id: 'hc006', parcelleId: 'p002', annee: 2023, saison: 'contre_saison_chaude', culture: 'oignon', variete: 'Violet de Galmi', rendement: 22.0, observations: 'Diversification réussie.' },

  // Parcelle p003 — Arachide (Kaolack)
  { id: 'hc007', parcelleId: 'p003', annee: 2024, saison: 'hivernage', culture: 'arachide', variete: '55-437', rendement: 1.2, observations: 'Bon rendement, variété performante.' },
  { id: 'hc008', parcelleId: 'p003', annee: 2023, saison: 'hivernage', culture: 'mil', variete: 'Souna 3', rendement: 0.9, observations: 'Rotation après arachide.' },
  { id: 'hc009', parcelleId: 'p003', annee: 2022, saison: 'hivernage', culture: 'arachide', variete: '55-437', rendement: 0.85, observations: 'Sécheresse fin de cycle.' },

  // Parcelle p004 — Oignon (Potou)
  { id: 'hc010', parcelleId: 'p004', annee: 2024, saison: 'contre_saison_froide', culture: 'oignon', variete: 'Violet de Galmi', rendement: 25.0, observations: 'Excellent rendement avec goutte-à-goutte.' },
  { id: 'hc011', parcelleId: 'p004', annee: 2023, saison: 'contre_saison_froide', culture: 'tomate', variete: 'Mongal F1', rendement: 18.0, observations: 'Rotation oignon-tomate.' },
  { id: 'hc012', parcelleId: 'p004', annee: 2023, saison: 'hivernage', culture: 'mais', variete: 'Early Thai', rendement: 2.5, observations: 'Campagne hivernage maïs.' },

  // Parcelle p007 — Mil (Thiès)
  { id: 'hc013', parcelleId: 'p007', annee: 2024, saison: 'hivernage', culture: 'mil', variete: 'Souna 3', rendement: 0.8, observations: 'Sol dior fatigué.' },
  { id: 'hc014', parcelleId: 'p007', annee: 2023, saison: 'hivernage', culture: 'arachide', variete: '55-437', rendement: 1.0, observations: 'Bonne fixation azote.' },
  { id: 'hc015', parcelleId: 'p007', annee: 2022, saison: 'hivernage', culture: 'mil', variete: 'Souna 3', rendement: 1.0, observations: 'Bonnes pluies.' },
];
