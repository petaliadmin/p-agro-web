import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CultureType, TypeCampagne } from '../models/parcelle.model';
import { TEMPLATES_CAMPAGNE, EtapeCampagne } from '../models/campagne.model';
import { IntrantService } from './intrant.service';
import { ParcelleService } from './parcelle.service';
import { TypeTache } from '../models/tache.model';

// ═══════════════════════════════════════════════════════
// Fiches techniques par culture (36.5)
// ═══════════════════════════════════════════════════════

export interface FicheTechnique {
  culture: CultureType;
  label: string;
  emoji: string;
  varietes: { nom: string; cycle: number; rendementPotentiel: number; description: string }[];
  calendrier: { zone: string; semisDe: string; semisA: string; recolteDe: string; recolteA: string }[];
  densiteSemis: string;
  ecartement: string;
  besoinsEau: string;
  dosesIntrants: DoseIntrant[];
  mainOeuvreParHa: { etape: string; personnesJour: number; description: string }[];
}

export interface DoseIntrant {
  produit: string;
  type: 'semence' | 'engrais' | 'pesticide' | 'herbicide' | 'fongicide';
  doseParHa: number;
  unite: string;
  prixUnitaire: number;
  moment: string;
}

// ═══════════════════════════════════════════════════════
// Estimations (36.2, 36.3, 36.4)
// ═══════════════════════════════════════════════════════

export interface EstimationIntrants {
  produit: string;
  type: string;
  doseParHa: number;
  unite: string;
  quantiteTotale: number;
  prixUnitaire: number;
  coutTotal: number;
  moment: string;
}

export interface EstimationMainOeuvre {
  etape: string;
  personnesJour: number;
  totalPersonnesJour: number;
  coutUnitaire: number;
  coutTotal: number;
  description: string;
}

export interface BudgetPrevisionnel {
  coutIntrants: number;
  coutMainOeuvre: number;
  coutTransport: number;
  coutTotal: number;
  detailIntrants: EstimationIntrants[];
  detailMainOeuvre: EstimationMainOeuvre[];
  rendementEstime: number;
  revenuEstime: number;
  margeEstimee: number;
}

// ═══════════════════════════════════════════════════════
// Alertes proactives (36.6)
// ═══════════════════════════════════════════════════════

export interface AlerteProactive {
  id: string;
  parcelleId: string;
  parcelleNom: string;
  culture: CultureType;
  type: 'info' | 'action' | 'urgent';
  message: string;
  etape: string;
  joursRestants: number;
  datePrevue: Date;
}

// ═══════════════════════════════════════════════════════
// Calendrier prévisionnel (36.7)
// ═══════════════════════════════════════════════════════

export interface InterventionCalendrier {
  id: string;
  parcelleId: string;
  parcelleNom: string;
  culture: CultureType;
  etape: string;
  typeTache: TypeTache;
  dateDebut: Date;
  dateFin: Date;
  description: string;
  statut: 'a_venir' | 'en_cours' | 'passee';
}

// ═══════════════════════════════════════════════════════
// Paramètres de planification (36.1)
// ═══════════════════════════════════════════════════════

export interface PlanificationParams {
  parcelleId: string;
  culture: CultureType;
  variete: string;
  typeCampagne: TypeCampagne;
  dateSemisPrevue: Date;
  superficie: number;
}

// ═══════════════════════════════════════════════════════
// Données fiches techniques Sénégal
// ═══════════════════════════════════════════════════════

const COUT_JOURNALIER_MO = 2500; // FCFA/personne/jour (moyenne Sénégal)
const COUT_TRANSPORT_PAR_HA = 15000; // FCFA/ha estimation

const PRIX_VENTE_MOYEN: Record<CultureType, number> = {
  riz: 250,       // FCFA/kg
  arachide: 300,
  mais: 175,
  mil: 200,
  oignon: 150,
  tomate: 125,
};

const RENDEMENT_MOYEN: Record<CultureType, number> = {
  riz: 5.0,       // t/ha
  arachide: 1.5,
  mais: 3.5,
  mil: 1.0,
  oignon: 20.0,
  tomate: 25.0,
};

export const FICHES_TECHNIQUES: Record<CultureType, FicheTechnique> = {
  riz: {
    culture: 'riz',
    label: 'Riz',
    emoji: '🌾',
    varietes: [
      { nom: 'Sahel 108', cycle: 120, rendementPotentiel: 6.0, description: 'Variété irriguée, très productive, résistante pyriculariose' },
      { nom: 'Sahel 201', cycle: 125, rendementPotentiel: 5.5, description: 'Variété améliorée, grain long, bonne qualité' },
      { nom: 'NERICA-L19', cycle: 110, rendementPotentiel: 4.5, description: 'Cycle court, tolérance stress hydrique' },
      { nom: 'IR 1529', cycle: 130, rendementPotentiel: 5.0, description: 'Variété traditionnelle, adaptée aux bas-fonds' },
    ],
    calendrier: [
      { zone: 'Vallée du Fleuve Sénégal', semisDe: 'Juillet', semisA: 'Août', recolteDe: 'Novembre', recolteA: 'Décembre' },
      { zone: 'Casamance', semisDe: 'Juin', semisA: 'Juillet', recolteDe: 'Octobre', recolteA: 'Novembre' },
    ],
    densiteSemis: '80-100 kg/ha (semis direct) ou 40-50 kg/ha (repiquage)',
    ecartement: '20cm x 20cm (repiquage)',
    besoinsEau: '1200-1500 mm par cycle',
    dosesIntrants: [
      { produit: 'Semences certifiées', type: 'semence', doseParHa: 80, unite: 'kg', prixUnitaire: 500, moment: 'Semis' },
      { produit: 'DAP 18-46-0', type: 'engrais', doseParHa: 100, unite: 'kg', prixUnitaire: 950, moment: 'Semis (fond)' },
      { produit: 'Urée 46%', type: 'engrais', doseParHa: 200, unite: 'kg', prixUnitaire: 850, moment: 'Tallage + montaison (2 apports de 100 kg)' },
      { produit: 'KCl', type: 'engrais', doseParHa: 50, unite: 'kg', prixUnitaire: 750, moment: 'Montaison' },
      { produit: 'Herbicide (propanil)', type: 'herbicide', doseParHa: 4, unite: 'L', prixUnitaire: 8500, moment: '15-20 JAR' },
      { produit: 'Fongicide (tricyclazole)', type: 'fongicide', doseParHa: 0.3, unite: 'kg', prixUnitaire: 18500, moment: 'Montaison-floraison' },
    ],
    mainOeuvreParHa: [
      { etape: 'Préparation sol', personnesJour: 8, description: 'Labour, planage, mise en boue' },
      { etape: 'Semis / Repiquage', personnesJour: 15, description: 'Repiquage manuel ou semis en ligne' },
      { etape: 'Désherbage', personnesJour: 10, description: 'Désherbage manuel' },
      { etape: 'Fertilisation', personnesJour: 3, description: '3 applications d\'engrais' },
      { etape: 'Traitement phyto', personnesJour: 2, description: 'Pulvérisation herbicide + fongicide' },
      { etape: 'Récolte', personnesJour: 15, description: 'Coupe, battage, mise en sacs' },
    ],
  },
  arachide: {
    culture: 'arachide',
    label: 'Arachide',
    emoji: '🥜',
    varietes: [
      { nom: '55-437', cycle: 90, rendementPotentiel: 2.0, description: 'Variété hâtive, résistante sécheresse, grain moyen' },
      { nom: 'GH 119-20', cycle: 105, rendementPotentiel: 1.8, description: 'Variété demi-hâtive, bon rendement en gousses' },
      { nom: 'Fleur 11', cycle: 100, rendementPotentiel: 1.5, description: 'Variété locale améliorée, bonne qualité huile' },
      { nom: '73-33', cycle: 95, rendementPotentiel: 1.7, description: 'Variété à port érigé, adaptée mécanisation' },
    ],
    calendrier: [
      { zone: 'Bassin Arachidier', semisDe: 'Juin', semisA: 'Juillet', recolteDe: 'Septembre', recolteA: 'Octobre' },
      { zone: 'Casamance', semisDe: 'Juin', semisA: 'Juillet', recolteDe: 'Octobre', recolteA: 'Novembre' },
    ],
    densiteSemis: '100-120 kg/ha (coques) ou 60-80 kg/ha (graines décortiquées)',
    ecartement: '50cm x 15cm',
    besoinsEau: '400-600 mm par cycle',
    dosesIntrants: [
      { produit: 'Semences coques', type: 'semence', doseParHa: 100, unite: 'kg', prixUnitaire: 400, moment: 'Semis' },
      { produit: 'TSP (phosphate)', type: 'engrais', doseParHa: 100, unite: 'kg', prixUnitaire: 750, moment: 'Fond avant semis' },
      { produit: 'NPK 6-20-10', type: 'engrais', doseParHa: 150, unite: 'kg', prixUnitaire: 900, moment: 'Fond avant semis' },
      { produit: 'Insecticide (lambda-cyh.)', type: 'pesticide', doseParHa: 1, unite: 'L', prixUnitaire: 12000, moment: 'Si attaque pucerons/chenilles' },
    ],
    mainOeuvreParHa: [
      { etape: 'Préparation sol', personnesJour: 5, description: 'Labour léger charrue/tracteur' },
      { etape: 'Semis', personnesJour: 8, description: 'Semis en ligne semoir ou manuel' },
      { etape: 'Sarclage (2x)', personnesJour: 16, description: '2 sarclages manuels ou attelés' },
      { etape: 'Traitement', personnesJour: 1, description: 'Pulvérisation si nécessaire' },
      { etape: 'Récolte', personnesJour: 20, description: 'Soulevage, séchage, battage' },
    ],
  },
  mais: {
    culture: 'mais',
    label: 'Maïs',
    emoji: '🌽',
    varietes: [
      { nom: 'Early Thai', cycle: 90, rendementPotentiel: 4.0, description: 'Variété précoce, adaptée culture pluviale' },
      { nom: 'Obatanpa', cycle: 100, rendementPotentiel: 4.5, description: 'QPM (Quality Protein Maize), bon rendement' },
      { nom: 'SWAN 1', cycle: 95, rendementPotentiel: 3.5, description: 'Tolérance Striga, résistance sécheresse' },
    ],
    calendrier: [
      { zone: 'Casamance', semisDe: 'Juin', semisA: 'Juillet', recolteDe: 'Septembre', recolteA: 'Octobre' },
      { zone: 'Sénégal Oriental', semisDe: 'Juin', semisA: 'Juillet', recolteDe: 'Septembre', recolteA: 'Octobre' },
    ],
    densiteSemis: '20-25 kg/ha',
    ecartement: '75cm x 25cm',
    besoinsEau: '500-700 mm par cycle',
    dosesIntrants: [
      { produit: 'Semences certifiées', type: 'semence', doseParHa: 20, unite: 'kg', prixUnitaire: 1500, moment: 'Semis' },
      { produit: 'NPK 15-15-15', type: 'engrais', doseParHa: 150, unite: 'kg', prixUnitaire: 920, moment: 'Fond au semis' },
      { produit: 'Urée 46%', type: 'engrais', doseParHa: 100, unite: 'kg', prixUnitaire: 850, moment: 'Montaison (30 JAS)' },
      { produit: 'Insecticide (lambda-cyh.)', type: 'pesticide', doseParHa: 1, unite: 'L', prixUnitaire: 12000, moment: 'Foreur tige / chenille légionnaire' },
    ],
    mainOeuvreParHa: [
      { etape: 'Préparation sol', personnesJour: 5, description: 'Labour et émottage' },
      { etape: 'Semis', personnesJour: 5, description: 'Semis en poquets' },
      { etape: 'Sarclage + démariage', personnesJour: 10, description: 'Sarclage et démariage' },
      { etape: 'Fertilisation', personnesJour: 2, description: 'Application engrais' },
      { etape: 'Récolte', personnesJour: 12, description: 'Récolte épis, égrenage' },
    ],
  },
  mil: {
    culture: 'mil',
    label: 'Mil (Souna)',
    emoji: '🌿',
    varietes: [
      { nom: 'Souna 3', cycle: 90, rendementPotentiel: 1.5, description: 'Variété améliorée ISRA, cycle court' },
      { nom: 'IBV 8004', cycle: 85, rendementPotentiel: 1.2, description: 'Variété extra-précoce, zones sèches' },
      { nom: 'Thialack 2', cycle: 95, rendementPotentiel: 1.3, description: 'Variété locale sélectionnée, bonne tolérance sécheresse' },
    ],
    calendrier: [
      { zone: 'Bassin Arachidier', semisDe: 'Juin', semisA: 'Juillet', recolteDe: 'Septembre', recolteA: 'Octobre' },
      { zone: 'Zone Sylvopastorale', semisDe: 'Juillet', semisA: 'Août', recolteDe: 'Octobre', recolteA: 'Novembre' },
    ],
    densiteSemis: '5-8 kg/ha',
    ecartement: '90cm x 90cm',
    besoinsEau: '300-500 mm par cycle',
    dosesIntrants: [
      { produit: 'Semences Souna 3', type: 'semence', doseParHa: 6, unite: 'kg', prixUnitaire: 600, moment: 'Semis après premières pluies' },
      { produit: 'NPK 15-15-15', type: 'engrais', doseParHa: 100, unite: 'kg', prixUnitaire: 920, moment: 'Fond au semis (si disponible)' },
      { produit: 'Urée 46%', type: 'engrais', doseParHa: 50, unite: 'kg', prixUnitaire: 850, moment: 'Montaison (25 JAS)' },
    ],
    mainOeuvreParHa: [
      { etape: 'Préparation sol', personnesJour: 3, description: 'Grattage léger' },
      { etape: 'Semis', personnesJour: 4, description: 'Semis poquets' },
      { etape: 'Sarclage + démariage', personnesJour: 8, description: '2 sarclages' },
      { etape: 'Récolte', personnesJour: 10, description: 'Coupe chandelles, séchage, battage' },
    ],
  },
  oignon: {
    culture: 'oignon',
    label: 'Oignon',
    emoji: '🧅',
    varietes: [
      { nom: 'Violet de Galmi', cycle: 120, rendementPotentiel: 25.0, description: 'Variété référence au Sénégal, bonne conservation' },
      { nom: 'Safari', cycle: 110, rendementPotentiel: 22.0, description: 'Hybride F1, rendement élevé, calibre uniforme' },
      { nom: 'Gandiol F1', cycle: 115, rendementPotentiel: 20.0, description: 'Variété locale Niayes, adaptée conditions sablonneuses' },
    ],
    calendrier: [
      { zone: 'Niayes', semisDe: 'Octobre', semisA: 'Novembre', recolteDe: 'Février', recolteA: 'Mars' },
      { zone: 'Vallée du Fleuve Sénégal', semisDe: 'Octobre', semisA: 'Décembre', recolteDe: 'Mars', recolteA: 'Avril' },
    ],
    densiteSemis: '4-5 kg/ha (pépinière puis repiquage)',
    ecartement: '15cm x 10cm sur planches',
    besoinsEau: '600-800 mm (irrigation)',
    dosesIntrants: [
      { produit: 'Semences Violet de Galmi', type: 'semence', doseParHa: 4, unite: 'kg', prixUnitaire: 25000, moment: 'Pépinière puis repiquage' },
      { produit: 'NPK 15-15-15', type: 'engrais', doseParHa: 300, unite: 'kg', prixUnitaire: 920, moment: 'Fond avant repiquage' },
      { produit: 'Urée 46%', type: 'engrais', doseParHa: 200, unite: 'kg', prixUnitaire: 850, moment: 'Couverture (3 apports)' },
      { produit: 'Mancozèbe 80 WP', type: 'fongicide', doseParHa: 2, unite: 'kg', prixUnitaire: 15000, moment: 'Prévention mildiou (30 JAR)' },
      { produit: 'Fumure organique', type: 'engrais', doseParHa: 5000, unite: 'kg', prixUnitaire: 25, moment: 'Préparation planches' },
    ],
    mainOeuvreParHa: [
      { etape: 'Préparation planches', personnesJour: 15, description: 'Confection planches + fumure' },
      { etape: 'Pépinière + Repiquage', personnesJour: 25, description: 'Pépinière 45j + repiquage' },
      { etape: 'Irrigation', personnesJour: 20, description: 'Arrosage quotidien 3-4 mois' },
      { etape: 'Sarclage + binage', personnesJour: 10, description: 'Entretien planches' },
      { etape: 'Traitement', personnesJour: 3, description: 'Applications fongicides' },
      { etape: 'Récolte + séchage', personnesJour: 20, description: 'Arrachage, séchage 7-10 jours' },
    ],
  },
  tomate: {
    culture: 'tomate',
    label: 'Tomate',
    emoji: '🍅',
    varietes: [
      { nom: 'Mongal F1', cycle: 75, rendementPotentiel: 30.0, description: 'Hybride très productif, résistant TYLCV' },
      { nom: 'Xina', cycle: 80, rendementPotentiel: 25.0, description: 'Variété locale, fruit ferme, bonne conservation' },
      { nom: 'Tropimech', cycle: 70, rendementPotentiel: 20.0, description: 'Variété déterminée, adaptée saison chaude' },
    ],
    calendrier: [
      { zone: 'Niayes', semisDe: 'Octobre', semisA: 'Février', recolteDe: 'Janvier', recolteA: 'Mai' },
      { zone: 'Vallée du Fleuve Sénégal', semisDe: 'Novembre', semisA: 'Janvier', recolteDe: 'Février', recolteA: 'Avril' },
    ],
    densiteSemis: '200-250 g/ha (pépinière)',
    ecartement: '40cm x 50cm sur billons',
    besoinsEau: '600-900 mm (irrigation goutte-à-goutte recommandée)',
    dosesIntrants: [
      { produit: 'Semences Mongal F1', type: 'semence', doseParHa: 0.25, unite: 'kg', prixUnitaire: 120000, moment: 'Pépinière puis repiquage' },
      { produit: 'NPK 15-15-15', type: 'engrais', doseParHa: 300, unite: 'kg', prixUnitaire: 920, moment: 'Fond avant repiquage' },
      { produit: 'Urée 46%', type: 'engrais', doseParHa: 150, unite: 'kg', prixUnitaire: 850, moment: 'Couverture (floraison + fructification)' },
      { produit: 'Fumure organique', type: 'engrais', doseParHa: 10000, unite: 'kg', prixUnitaire: 25, moment: 'Préparation billons' },
      { produit: 'Mancozèbe 80 WP', type: 'fongicide', doseParHa: 3, unite: 'kg', prixUnitaire: 15000, moment: 'Prévention mildiou + alternariose' },
      { produit: 'Insecticide (imidaclopride)', type: 'pesticide', doseParHa: 0.5, unite: 'L', prixUnitaire: 22000, moment: 'Mouches blanches + Tuta absoluta' },
    ],
    mainOeuvreParHa: [
      { etape: 'Préparation billons', personnesJour: 10, description: 'Billonnage + fumure organique' },
      { etape: 'Pépinière + Repiquage', personnesJour: 15, description: 'Pépinière 30j + repiquage' },
      { etape: 'Tuteurage + sarclage', personnesJour: 12, description: 'Installation tuteurs, sarclage' },
      { etape: 'Irrigation', personnesJour: 15, description: 'Gestion irrigation 3 mois' },
      { etape: 'Traitement phyto', personnesJour: 5, description: 'Applications fongicides + insecticides' },
      { etape: 'Récolte échelonnée', personnesJour: 30, description: 'Récolte tous les 3-4 jours sur 6 semaines' },
    ],
  },
};

// ═══════════════════════════════════════════════════════
// Service
// ═══════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class PlanificationService {
  private intrantService = inject(IntrantService);
  private parcelleService = inject(ParcelleService);

  // ── 36.5 Fiches techniques ────────────────────────
  getFicheTechnique(culture: CultureType): Observable<FicheTechnique> {
    return of(FICHES_TECHNIQUES[culture]).pipe(delay(150));
  }

  getAllFichesTechniques(): Observable<FicheTechnique[]> {
    return of(Object.values(FICHES_TECHNIQUES)).pipe(delay(200));
  }

  // ── 36.2 Estimation besoins intrants ──────────────
  estimerBesoinsIntrants(culture: CultureType, superficieHa: number): Observable<EstimationIntrants[]> {
    const fiche = FICHES_TECHNIQUES[culture];
    const estimations = fiche.dosesIntrants.map(d => ({
      produit: d.produit,
      type: d.type,
      doseParHa: d.doseParHa,
      unite: d.unite,
      quantiteTotale: Math.ceil(d.doseParHa * superficieHa),
      prixUnitaire: d.prixUnitaire,
      coutTotal: Math.ceil(d.doseParHa * superficieHa) * d.prixUnitaire,
      moment: d.moment,
    }));
    return of(estimations).pipe(delay(200));
  }

  // ── 36.3 Estimation besoins main-d'oeuvre ─────────
  estimerBesoinsMainOeuvre(culture: CultureType, superficieHa: number): Observable<EstimationMainOeuvre[]> {
    const fiche = FICHES_TECHNIQUES[culture];
    const estimations = fiche.mainOeuvreParHa.map(mo => ({
      etape: mo.etape,
      personnesJour: mo.personnesJour,
      totalPersonnesJour: Math.ceil(mo.personnesJour * superficieHa),
      coutUnitaire: COUT_JOURNALIER_MO,
      coutTotal: Math.ceil(mo.personnesJour * superficieHa) * COUT_JOURNALIER_MO,
      description: mo.description,
    }));
    return of(estimations).pipe(delay(200));
  }

  // ── 36.4 Budget prévisionnel ──────────────────────
  getBudgetPrevisionnel(culture: CultureType, superficieHa: number): Observable<BudgetPrevisionnel> {
    const fiche = FICHES_TECHNIQUES[culture];

    const detailIntrants = fiche.dosesIntrants.map(d => ({
      produit: d.produit,
      type: d.type,
      doseParHa: d.doseParHa,
      unite: d.unite,
      quantiteTotale: Math.ceil(d.doseParHa * superficieHa),
      prixUnitaire: d.prixUnitaire,
      coutTotal: Math.ceil(d.doseParHa * superficieHa) * d.prixUnitaire,
      moment: d.moment,
    }));

    const detailMainOeuvre = fiche.mainOeuvreParHa.map(mo => ({
      etape: mo.etape,
      personnesJour: mo.personnesJour,
      totalPersonnesJour: Math.ceil(mo.personnesJour * superficieHa),
      coutUnitaire: COUT_JOURNALIER_MO,
      coutTotal: Math.ceil(mo.personnesJour * superficieHa) * COUT_JOURNALIER_MO,
      description: mo.description,
    }));

    const coutIntrants = detailIntrants.reduce((s, d) => s + d.coutTotal, 0);
    const coutMainOeuvre = detailMainOeuvre.reduce((s, d) => s + d.coutTotal, 0);
    const coutTransport = Math.round(COUT_TRANSPORT_PAR_HA * superficieHa);
    const coutTotal = coutIntrants + coutMainOeuvre + coutTransport;

    const rendementEstime = RENDEMENT_MOYEN[culture] * superficieHa;
    const revenuEstime = Math.round(rendementEstime * 1000 * PRIX_VENTE_MOYEN[culture]);
    const margeEstimee = revenuEstime - coutTotal;

    return of({
      coutIntrants,
      coutMainOeuvre,
      coutTransport,
      coutTotal,
      detailIntrants,
      detailMainOeuvre,
      rendementEstime: Math.round(rendementEstime * 100) / 100,
      revenuEstime,
      margeEstimee,
    }).pipe(delay(300));
  }

  // ── 36.6 Alertes proactives ───────────────────────
  getAlertesProactives(): Observable<AlerteProactive[]> {
    return this.parcelleService.getAll().pipe(
      map(parcelles => {
        const alertes: AlerteProactive[] = [];
        const now = new Date();

        parcelles.forEach(p => {
          if (!p.dateSemis || !p.culture) return;
          const template = TEMPLATES_CAMPAGNE[p.culture];
          if (!template) return;

          template.forEach(etape => {
            const datePrevue = new Date(p.dateSemis!);
            datePrevue.setDate(datePrevue.getDate() + etape.delaiJoursApresSemis);

            const joursRestants = Math.round((datePrevue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            // Alertes pour les 15 prochains jours
            if (joursRestants >= -3 && joursRestants <= 15) {
              let type: AlerteProactive['type'] = 'info';
              if (joursRestants <= 0) type = 'urgent';
              else if (joursRestants <= 5) type = 'action';

              alertes.push({
                id: `alerte-${p.id}-${etape.ordre}`,
                parcelleId: p.id,
                parcelleNom: p.nom,
                culture: p.culture,
                type,
                message: joursRestants <= 0
                  ? `${etape.label} devait commencer il y a ${Math.abs(joursRestants)} jour(s)`
                  : `${etape.label} dans ${joursRestants} jour(s)`,
                etape: etape.label,
                joursRestants,
                datePrevue,
              });
            }
          });
        });

        return alertes.sort((a, b) => a.joursRestants - b.joursRestants);
      }),
      delay(200),
    );
  }

  // ── 36.7 Calendrier prévisionnel ──────────────────
  getCalendrierPrevisionnel(parcelleId?: string): Observable<InterventionCalendrier[]> {
    return this.parcelleService.getAll().pipe(
      map(parcelles => {
        const interventions: InterventionCalendrier[] = [];
        const now = new Date();

        const cibles = parcelleId
          ? parcelles.filter(p => p.id === parcelleId)
          : parcelles;

        cibles.forEach(p => {
          if (!p.dateSemis || !p.culture) return;
          const template = TEMPLATES_CAMPAGNE[p.culture];
          if (!template) return;

          template.forEach(etape => {
            const dateDebut = new Date(p.dateSemis!);
            dateDebut.setDate(dateDebut.getDate() + etape.delaiJoursApresSemis);
            const dateFin = new Date(dateDebut);
            dateFin.setDate(dateFin.getDate() + etape.dureeEstimee);

            let statut: InterventionCalendrier['statut'] = 'a_venir';
            if (dateFin < now) statut = 'passee';
            else if (dateDebut <= now) statut = 'en_cours';

            interventions.push({
              id: `int-${p.id}-${etape.ordre}`,
              parcelleId: p.id,
              parcelleNom: p.nom,
              culture: p.culture,
              etape: etape.label,
              typeTache: etape.typeTache,
              dateDebut,
              dateFin,
              description: etape.description,
              statut,
            });
          });
        });

        return interventions.sort((a, b) => a.dateDebut.getTime() - b.dateDebut.getTime());
      }),
      delay(250),
    );
  }
}
