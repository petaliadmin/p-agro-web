export interface HistoriqueCampagne {
  id: string;
  parcelleId: string;
  annee: number;
  saison: 'hivernage' | 'contre_saison_froide' | 'contre_saison_chaude';
  culture: string;
  variete?: string;
  rendement?: number;          // t/ha
  observations?: string;
}

/** Impact estimé sur le sol par type de culture */
export const IMPACT_SOL: Record<string, { type: 'enrichissement' | 'appauvrissement' | 'neutre'; description: string }> = {
  arachide:  { type: 'enrichissement', description: 'Légumineuse — fixation azote, enrichit le sol' },
  niebe:     { type: 'enrichissement', description: 'Légumineuse — excellent précédent cultural' },
  mil:       { type: 'appauvrissement', description: 'Céréale — prélève azote et phosphore' },
  mais:      { type: 'appauvrissement', description: 'Céréale exigeante — appauvrit fortement le sol' },
  riz:       { type: 'neutre', description: 'Culture inondée — impact dépend de la gestion des résidus' },
  oignon:    { type: 'appauvrissement', description: 'Maraîchage — exigeant en nutriments' },
  tomate:    { type: 'appauvrissement', description: 'Maraîchage — exigeant en nutriments et eau' },
};

/** Rotations recommandées au Sénégal */
export const ROTATIONS_OPTIMALES: Record<string, string[]> = {
  arachide: ['mil', 'mais', 'riz'],
  mil:      ['arachide', 'niebe'],
  mais:     ['arachide', 'niebe'],
  riz:      ['arachide', 'oignon'],
  oignon:   ['riz', 'tomate', 'arachide'],
  tomate:   ['oignon', 'riz', 'mais'],
  niebe:    ['mil', 'mais'],
};
