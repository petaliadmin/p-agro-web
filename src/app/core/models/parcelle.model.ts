export type CultureType = 'riz' | 'mais' | 'mil' | 'arachide' | 'oignon' | 'tomate';
export type StadeCulture = 'semis' | 'levee' | 'tallage' | 'floraison' | 'maturation' | 'recolte';
export type StatutParcelle = 'sain' | 'attention' | 'urgent' | 'recolte';
export type ZoneAgroecologique = 'Niayes' | 'Casamance' | 'Vallée du Fleuve Sénégal' | 'Bassin Arachidier' | 'Sénégal Oriental' | 'Zone Sylvopastorale';
export type TypeSol = 'dior' | 'deck' | 'argileux' | 'sableux' | 'argilo-sableux' | 'lateritique' | 'limoneux' | 'sablo-humifere';
export type ModeAccesTerre = 'propriete' | 'pret' | 'location' | 'communautaire';
export type SourceEau = 'pluie' | 'forage' | 'canal' | 'fleuve' | 'bassin' | 'puits';
export type TypeCampagne = 'hivernage' | 'contre_saison_froide' | 'contre_saison_chaude';

export interface Coordonnees {
  lat: number;
  lng: number;
}

export interface Parcelle {
  id: string;
  code: string;
  nom: string;
  superficie: number;           // en hectares
  culture: CultureType;
  stade: StadeCulture;
  statut: StatutParcelle;
  technicienId: string;
  producteurNom: string;
  coordonnees: Coordonnees;
  geometry?: Coordonnees[];     // contour GPS relevé sur le terrain
  zone: string;
  typesSol: string;
  derniereVisite: Date;
  prochaineVisite: Date;
  rendementPrecedent: number;   // t/ha
  createdAt: Date;

  // Champs enrichis context.md
  exploitantNom?: string;
  localite?: string;
  zoneAgroecologique?: ZoneAgroecologique;
  typeSol?: TypeSol;
  modeAccesTerre?: ModeAccesTerre;
  sourceEau?: SourceEau;
  variete?: string;
  typeCampagne?: TypeCampagne;
  dateSemis?: Date;
  densite?: string;             // ex: "25cm x 25cm"
  culturePrecedente?: CultureType;
  rotationPrevue?: CultureType;
}

export interface ParcelleStats {
  total: number;
  urgentes: number;
  totalHa: number;
  enAttention: number;
}
