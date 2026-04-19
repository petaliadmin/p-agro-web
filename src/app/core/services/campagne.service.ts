import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of, delay, map } from 'rxjs';
import { Campagne, StatutCampagne, TEMPLATES_CAMPAGNE, EtapeCampagne } from '../models/campagne.model';
import { Tache, TypeTache } from '../models/tache.model';
import { CultureType, TypeCampagne } from '../models/parcelle.model';
import { TacheService } from './tache.service';

@Injectable({ providedIn: 'root' })
export class CampagneService {
  private tacheService = inject(TacheService);
  private campagnes$ = new BehaviorSubject<Campagne[]>(MOCK_CAMPAGNES);

  getAll(): Observable<Campagne[]> {
    return this.campagnes$.asObservable().pipe(delay(200));
  }

  getById(id: string): Observable<Campagne | undefined> {
    return this.campagnes$.pipe(map(list => list.find(c => c.id === id)), delay(100));
  }

  getByParcelle(parcelleId: string): Observable<Campagne[]> {
    return this.campagnes$.pipe(
      map(list => list.filter(c => c.parcelleId === parcelleId)),
      delay(100)
    );
  }

  getTemplate(culture: CultureType): EtapeCampagne[] {
    return TEMPLATES_CAMPAGNE[culture] || [];
  }

  /** Vérifie si une campagne en_cours existe déjà pour cette parcelle */
  hasActiveCampagne(parcelleId: string): boolean {
    return this.campagnes$.value.some(
      c => c.parcelleId === parcelleId && c.statut === 'en_cours'
    );
  }

  /** Clôture une campagne : statut → terminee, dateFin, rendement, observations */
  cloturerCampagne(id: string, params: {
    dateFin?: Date;
    rendementFinal?: number;
    observationsCloture?: string;
  }): Observable<Campagne | undefined> {
    const current = this.campagnes$.value;
    const idx = current.findIndex(c => c.id === id);
    if (idx === -1) return of(undefined).pipe(delay(200));

    const campagne: Campagne = {
      ...current[idx],
      statut: 'terminee',
      dateFin: params.dateFin || new Date(),
      rendementFinal: params.rendementFinal,
      observationsCloture: params.observationsCloture,
      progressionPct: 100,
    };

    const newList = [...current];
    newList[idx] = campagne;
    this.campagnes$.next(newList);
    return of(campagne).pipe(delay(300));
  }

  /** Active une campagne planifiée → en_cours */
  activerCampagne(id: string): Observable<Campagne | undefined> {
    const current = this.campagnes$.value;
    const idx = current.findIndex(c => c.id === id);
    if (idx === -1) return of(undefined).pipe(delay(200));

    const campagne = { ...current[idx], statut: 'en_cours' as StatutCampagne };
    const newList = [...current];
    newList[idx] = campagne;
    this.campagnes$.next(newList);
    return of(campagne).pipe(delay(200));
  }

  creerCampagne(params: {
    parcelleId: string;
    culture: CultureType;
    variete?: string;
    typeCampagne: TypeCampagne;
    dateSemis: Date;
    equipeId: string;
    planifiee?: boolean;
  }): Observable<Campagne> {
    const template = this.getTemplate(params.culture);
    const campagneId = `camp${Date.now()}`;
    const tacheIds: string[] = [];

    // Générer les tâches depuis le template
    template.forEach(etape => {
      const dateDebut = new Date(params.dateSemis);
      dateDebut.setDate(dateDebut.getDate() + etape.delaiJoursApresSemis);
      const dateFin = new Date(dateDebut);
      dateFin.setDate(dateFin.getDate() + etape.dureeEstimee);

      const tacheId = `t-camp-${Date.now()}-${etape.ordre}`;
      tacheIds.push(tacheId);

      const tache: Omit<Tache, 'id'> = {
        titre: `${etape.label} — ${params.culture}`,
        type: etape.typeTache,
        priorite: etape.ordre <= 2 ? 'haute' : 'normale',
        statut: 'todo',
        parcelleId: params.parcelleId,
        equipeId: params.equipeId,
        dateDebut,
        dateFin,
        description: etape.description,
        ressources: [],
        completionPct: 0,
        campagneId,
      };

      this.tacheService.create(tache).subscribe();
    });

    const campagne: Campagne = {
      id: campagneId,
      parcelleId: params.parcelleId,
      culture: params.culture,
      variete: params.variete,
      typeCampagne: params.typeCampagne,
      dateDebut: params.dateSemis,
      statut: params.planifiee ? 'planifiee' : 'en_cours',
      etapes: template,
      tacheIds,
      progressionPct: 0,
      createdAt: new Date(),
    };

    this.campagnes$.next([...this.campagnes$.value, campagne]);
    return of(campagne).pipe(delay(300));
  }

  updateProgression(campagneId: string): Observable<Campagne | undefined> {
    return this.tacheService.getAll().pipe(
      map(taches => {
        const current = this.campagnes$.value;
        const idx = current.findIndex(c => c.id === campagneId);
        if (idx === -1) return undefined;

        const campagne = { ...current[idx] };
        const campagneTaches = taches.filter(t => t.campagneId === campagneId);
        if (campagneTaches.length > 0) {
          const done = campagneTaches.filter(t => t.statut === 'done').length;
          campagne.progressionPct = Math.round((done / campagneTaches.length) * 100);
          campagne.statut = campagne.progressionPct === 100 ? 'terminee' : 'en_cours';
        }

        const newList = [...current];
        newList[idx] = campagne;
        this.campagnes$.next(newList);
        return campagne;
      })
    );
  }

  delete(id: string): Observable<boolean> {
    this.campagnes$.next(this.campagnes$.value.filter(c => c.id !== id));
    return of(true).pipe(delay(200));
  }
}

// Mock data campagnes en cours
const MOCK_CAMPAGNES: Campagne[] = [
  {
    id: 'camp001',
    parcelleId: 'p001',
    culture: 'riz',
    variete: 'Sahel 108',
    typeCampagne: 'hivernage',
    dateDebut: new Date('2024-08-15'),
    statut: 'en_cours',
    etapes: TEMPLATES_CAMPAGNE['riz'],
    tacheIds: ['t004'],
    progressionPct: 55,
    createdAt: new Date('2024-08-01'),
  },
  {
    id: 'camp002',
    parcelleId: 'p004',
    culture: 'arachide',
    variete: '55-437',
    typeCampagne: 'hivernage',
    dateDebut: new Date('2024-07-10'),
    statut: 'en_cours',
    etapes: TEMPLATES_CAMPAGNE['arachide'],
    tacheIds: ['t010'],
    progressionPct: 85,
    createdAt: new Date('2024-07-01'),
  },
  {
    id: 'camp003',
    parcelleId: 'p006',
    culture: 'oignon',
    variete: 'Violet de Galmi',
    typeCampagne: 'contre_saison_froide',
    dateDebut: new Date('2024-10-20'),
    statut: 'en_cours',
    etapes: TEMPLATES_CAMPAGNE['oignon'],
    tacheIds: ['t007', 't009'],
    progressionPct: 30,
    createdAt: new Date('2024-10-10'),
  },
];
