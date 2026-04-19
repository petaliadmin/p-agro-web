import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Intervention, StatutIntervention } from '../models/intervention.model';
import { NotificationService } from './notification.service';
import { MOCK_INTERVENTIONS } from '../../../assets/mock-data/interventions.mock';

@Injectable({ providedIn: 'root' })
export class InterventionService {
  private data$ = new BehaviorSubject<Intervention[]>(MOCK_INTERVENTIONS);

  constructor(private notificationService: NotificationService) {
    this.checkRetardAlerts();
  }

  getAll(): Observable<Intervention[]> {
    return this.data$.asObservable().pipe(delay(100));
  }

  getByParcelle(parcelleId: string): Observable<Intervention[]> {
    return this.data$.pipe(
      map(list => list
        .filter(i => i.parcelleId === parcelleId)
        .sort((a, b) => a.ordre - b.ordre)
      ),
      delay(100)
    );
  }

  getByCampagne(campagneId: string): Observable<Intervention[]> {
    return this.data$.pipe(
      map(list => list
        .filter(i => i.campagneId === campagneId)
        .sort((a, b) => a.ordre - b.ordre)
      ),
      delay(100)
    );
  }

  getById(id: string): Observable<Intervention | undefined> {
    return this.data$.pipe(
      map(list => list.find(i => i.id === id)),
      delay(100)
    );
  }

  create(intervention: Omit<Intervention, 'id'>): Observable<Intervention> {
    const newIntervention: Intervention = {
      ...intervention,
      id: 'int' + Date.now(),
    };
    const current = this.data$.value;
    this.data$.next([...current, newIntervention]);
    return of(newIntervention).pipe(delay(100));
  }

  update(id: string, updates: Partial<Intervention>): Observable<Intervention> {
    const current = this.data$.value;
    const idx = current.findIndex(i => i.id === id);
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...updates };
      this.data$.next([...current]);
    }
    return of(current[idx]).pipe(delay(100));
  }

  delete(id: string): Observable<void> {
    const current = this.data$.value.filter(i => i.id !== id);
    this.data$.next(current);
    return of(void 0).pipe(delay(100));
  }

  marquerTerminee(id: string, dateRealisee: Date, coutReel: number, observations?: string): Observable<Intervention> {
    return this.update(id, {
      statut: 'terminee',
      dateRealisee,
      coutReel,
      observations: observations || undefined,
    });
  }

  /** Génère des interventions depuis un template de culture */
  generateFromTemplate(
    parcelleId: string,
    campagneId: string,
    culture: string,
    dateSemis: Date,
    responsableId: string,
    templates: { type: string; label: string; delaiJours: number; dureeEstimee: number; coutEstime: number; mainOeuvre: number; produit?: string; dose?: string }[]
  ): Observable<Intervention[]> {
    const newInterventions: Intervention[] = templates.map((t, i) => {
      const datePrevue = new Date(dateSemis);
      datePrevue.setDate(datePrevue.getDate() + t.delaiJours);
      return {
        id: 'int' + Date.now() + i,
        parcelleId,
        campagneId,
        type: t.type as any,
        label: t.label,
        datePrevue,
        statut: 'planifiee' as StatutIntervention,
        coutEstime: t.coutEstime,
        responsableId,
        mainOeuvre: t.mainOeuvre,
        dureeEstimee: t.dureeEstimee,
        produitUtilise: t.produit,
        dose: t.dose,
        ordre: i + 1,
      };
    });

    const current = this.data$.value;
    this.data$.next([...current, ...newInterventions]);
    return of(newInterventions).pipe(delay(100));
  }

  private checkRetardAlerts(): void {
    const now = new Date();
    this.data$.value
      .filter(i => i.statut === 'planifiee' && new Date(i.datePrevue) < now)
      .forEach(i => {
        this.notificationService.create({
          type: 'alerte',
          titre: 'Intervention en retard',
          message: `"${i.label}" sur parcelle ${i.parcelleId} était prévue le ${new Date(i.datePrevue).toLocaleDateString('fr-FR')}`,
          lienType: 'parcelle',
          lienId: i.parcelleId,
        });
      });
  }
}
