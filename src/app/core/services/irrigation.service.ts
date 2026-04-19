import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, delay, map } from 'rxjs';
import {
  Irrigation, EvenementClimatique, PluviometrieJour, BilanHydrique,
  TypeIrrigation, TypeEvenementClimatique, NiveauImpact
} from '../models/irrigation.model';

@Injectable({ providedIn: 'root' })
export class IrrigationService {
  private irrigations$ = new BehaviorSubject<Irrigation[]>(MOCK_IRRIGATIONS);
  private evenements$ = new BehaviorSubject<EvenementClimatique[]>(MOCK_EVENEMENTS_CLIMATIQUES);
  private pluviometrie$ = new BehaviorSubject<PluviometrieJour[]>(MOCK_PLUVIOMETRIE);

  // --- Irrigations ---

  getAll(): Observable<Irrigation[]> {
    return this.irrigations$.asObservable().pipe(delay(200));
  }

  getByParcelle(parcelleId: string): Observable<Irrigation[]> {
    return this.irrigations$.pipe(
      map(list => list.filter(i => i.parcelleId === parcelleId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())),
      delay(100)
    );
  }

  create(irrigation: Omit<Irrigation, 'id'>): Observable<Irrigation> {
    const newItem: Irrigation = { ...irrigation, id: `irr${Date.now()}` };
    this.irrigations$.next([...this.irrigations$.value, newItem]);
    return of(newItem).pipe(delay(200));
  }

  delete(id: string): Observable<void> {
    this.irrigations$.next(this.irrigations$.value.filter(i => i.id !== id));
    return of(undefined).pipe(delay(200));
  }

  // --- Événements climatiques ---

  getEvenements(): Observable<EvenementClimatique[]> {
    return this.evenements$.asObservable().pipe(delay(200));
  }

  getEvenementsByParcelle(parcelleId: string): Observable<EvenementClimatique[]> {
    return this.evenements$.pipe(
      map(list => list.filter(e => !e.parcelleId || e.parcelleId === parcelleId)),
      delay(100)
    );
  }

  createEvenement(evt: Omit<EvenementClimatique, 'id'>): Observable<EvenementClimatique> {
    const newItem: EvenementClimatique = { ...evt, id: `evt${Date.now()}` };
    this.evenements$.next([...this.evenements$.value, newItem]);
    return of(newItem).pipe(delay(200));
  }

  // --- Pluviométrie ---

  getPluviometrie30j(): Observable<PluviometrieJour[]> {
    return this.pluviometrie$.asObservable().pipe(delay(150));
  }

  getTotalPluvio30j(): Observable<number> {
    return this.pluviometrie$.pipe(
      map(jours => jours.reduce((sum, j) => sum + j.quantite, 0)),
      delay(100)
    );
  }

  // --- Bilan hydrique ---

  getBilanHydrique(parcelleId: string): Observable<BilanHydrique> {
    const irrigations = this.irrigations$.value.filter(i => i.parcelleId === parcelleId);
    const dernierArrosage = irrigations.length
      ? irrigations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
      : undefined;

    const pluvio30j = this.pluviometrie$.value.reduce((sum, j) => sum + j.quantite, 0);

    // Calcul stress hydrique simplifié
    const joursSansPluie = this.calcJoursSansEau(parcelleId);
    let niveauStress: BilanHydrique['niveauStress'] = 'aucun';
    if (joursSansPluie > 14) niveauStress = 'severe';
    else if (joursSansPluie > 7) niveauStress = 'modere';
    else if (joursSansPluie > 4) niveauStress = 'leger';

    return of({
      parcelleId,
      stressHydrique: niveauStress !== 'aucun',
      niveauStress,
      dernierArrosage: dernierArrosage ? new Date(dernierArrosage) : undefined,
      pluviometrie30j: pluvio30j,
    }).pipe(delay(100));
  }

  private calcJoursSansEau(parcelleId: string): number {
    const now = new Date();
    const irrigations = this.irrigations$.value
      .filter(i => i.parcelleId === parcelleId)
      .map(i => new Date(i.date).getTime());
    const pluies = this.pluviometrie$.value
      .filter(p => p.quantite > 0)
      .map(p => new Date(p.date).getTime());
    const all = [...irrigations, ...pluies].sort((a, b) => b - a);
    if (!all.length) return 30;
    return Math.floor((now.getTime() - all[0]) / (1000 * 60 * 60 * 24));
  }
}

// --- Mock data ---

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const MOCK_IRRIGATIONS: Irrigation[] = [
  { id: 'irr1', parcelleId: 'p1', type: 'goutte_a_goutte', frequence: '2 fois/semaine', quantiteEstimee: 25, date: daysAgo(1), dureeMinutes: 120, observations: 'Système en bon état' },
  { id: 'irr2', parcelleId: 'p1', type: 'goutte_a_goutte', frequence: '2 fois/semaine', quantiteEstimee: 25, date: daysAgo(4) },
  { id: 'irr3', parcelleId: 'p1', type: 'goutte_a_goutte', frequence: '2 fois/semaine', quantiteEstimee: 25, date: daysAgo(7) },
  { id: 'irr4', parcelleId: 'p2', type: 'submersion', frequence: 'hebdomadaire', quantiteEstimee: 80, date: daysAgo(2), dureeMinutes: 360 },
  { id: 'irr5', parcelleId: 'p2', type: 'submersion', frequence: 'hebdomadaire', quantiteEstimee: 75, date: daysAgo(9) },
  { id: 'irr6', parcelleId: 'p3', type: 'pluie', frequence: 'pluvial', quantiteEstimee: 0, date: daysAgo(5), observations: 'Dépendance pluviale, pas d\'apport complémentaire' },
  { id: 'irr7', parcelleId: 'p4', type: 'aspersion', frequence: '3 fois/semaine', quantiteEstimee: 35, date: daysAgo(0), dureeMinutes: 90 },
  { id: 'irr8', parcelleId: 'p4', type: 'aspersion', frequence: '3 fois/semaine', quantiteEstimee: 35, date: daysAgo(3) },
  { id: 'irr9', parcelleId: 'p5', type: 'gravitaire', frequence: 'bihebdomadaire', quantiteEstimee: 50, date: daysAgo(6), dureeMinutes: 240 },
  { id: 'irr10', parcelleId: 'p6', type: 'bassin', frequence: 'hebdomadaire', quantiteEstimee: 60, date: daysAgo(3) },
  { id: 'irr11', parcelleId: 'p7', type: 'pluie', frequence: 'pluvial', quantiteEstimee: 0, date: daysAgo(12) },
];

const MOCK_EVENEMENTS_CLIMATIQUES: EvenementClimatique[] = [
  {
    id: 'evt1', date: daysAgo(3), type: 'fortes_pluies', impact: 'moyen',
    description: 'Fortes pluies 45mm en 2h — engorgement temporaire',
    actionsPrises: 'Drainage vérifié, plants surélevés',
    parcelleId: 'p2',
  },
  {
    id: 'evt2', date: daysAgo(8), type: 'secheresse', impact: 'severe',
    description: 'Absence de pluie depuis 12 jours — stress hydrique visible',
    actionsPrises: 'Irrigation d\'appoint augmentée à 3x/semaine',
    parcelleId: 'p3',
  },
  {
    id: 'evt3', date: daysAgo(15), type: 'vent', impact: 'faible',
    description: 'Harmattan — vents secs du nord-est, dessèchement foliaire léger',
    parcelleId: 'p5',
  },
  {
    id: 'evt4', date: daysAgo(20), type: 'canicule', impact: 'moyen',
    description: 'Températures >42°C pendant 3 jours — brûlures foliaires',
    actionsPrises: 'Paillage renforcé, arrosage en soirée',
  },
  {
    id: 'evt5', date: daysAgo(2), type: 'fortes_pluies', impact: 'faible',
    description: 'Pluie 20mm — bénéfique pour les cultures',
  },
];

// Générer 30 jours de pluviométrie réaliste (saison sèche → quelques pluies)
const MOCK_PLUVIOMETRIE: PluviometrieJour[] = Array.from({ length: 30 }, (_, i) => {
  const date = daysAgo(29 - i);
  // Simuler pluies éparses typiques de la transition saison sèche/hivernage au Sénégal
  let quantite = 0;
  if (i === 5) quantite = 8;
  if (i === 10) quantite = 22;
  if (i === 15) quantite = 3;
  if (i === 20) quantite = 45;
  if (i === 24) quantite = 12;
  if (i === 27) quantite = 20;
  if (i === 29) quantite = 5;
  return { date, quantite };
});
