import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { delay, map, switchMap, catchError } from 'rxjs/operators';
import { NdviData, NdviSource, getNdviClasse } from '../models/ndvi.model';
import { NotificationService } from './notification.service';
import { SentinelHubService } from './sentinelhub.service';
import { SentinelHubAuthService } from './sentinelhub-auth.service';
import { ParcelleService } from './parcelle.service';
import { MOCK_NDVI } from '../../../assets/mock-data/ndvi.mock';

@Injectable({ providedIn: 'root' })
export class NdviService {
  private notificationService = inject(NotificationService);
  private sentinelHub = inject(SentinelHubService);
  private sentinelHubAuth = inject(SentinelHubAuthService);
  private parcelleService = inject(ParcelleService);

  private ndviData$ = new BehaviorSubject<NdviData[]>(MOCK_NDVI);

  /** true = donnees satellite reelles via Sentinel Hub API */
  get useApi(): boolean {
    return this.sentinelHubAuth.isConfigured;
  }

  constructor() {
    this.checkAlerts();
  }

  getAll(): Observable<NdviData[]> {
    return this.ndviData$.asObservable().pipe(delay(150));
  }

  getByParcelle(parcelleId: string): Observable<NdviData[]> {
    if (this.useApi) {
      return this.fetchFromSentinelHub(parcelleId).pipe(
        switchMap(list => list.length > 0 ? of(list) : this.getByParcelleMock(parcelleId)),
        catchError(() => this.getByParcelleMock(parcelleId))
      );
    }
    return this.getByParcelleMock(parcelleId);
  }

  getLatestByParcelle(parcelleId: string): Observable<NdviData | undefined> {
    if (this.useApi) {
      return this.fetchFromSentinelHub(parcelleId, 1).pipe(
        switchMap(list => list.length > 0 ? of(list[list.length - 1]) : this.getLatestByParcelleMock(parcelleId)),
        catchError(() => this.getLatestByParcelleMock(parcelleId))
      );
    }
    return this.getLatestByParcelleMock(parcelleId);
  }

  getLatestAll(): Observable<NdviData[]> {
    return this.ndviData$.pipe(
      map(list => {
        const byParcelle = new Map<string, NdviData>();
        for (const n of list) {
          const existing = byParcelle.get(n.parcelleId);
          if (!existing || new Date(n.date).getTime() > new Date(existing.date).getTime()) {
            byParcelle.set(n.parcelleId, n);
          }
        }
        return Array.from(byParcelle.values());
      }),
      delay(100)
    );
  }

  // ── Mock methods ──

  private getByParcelleMock(parcelleId: string): Observable<NdviData[]> {
    return this.ndviData$.pipe(
      map(list => list
        .filter(n => n.parcelleId === parcelleId)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      ),
      delay(100)
    );
  }

  private getLatestByParcelleMock(parcelleId: string): Observable<NdviData | undefined> {
    return this.ndviData$.pipe(
      map(list => {
        const filtered = list
          .filter(n => n.parcelleId === parcelleId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return filtered[0];
      }),
      delay(100)
    );
  }

  // ── API mode: Sentinel Hub ──

  /**
   * Recupere les donnees NDVI depuis Sentinel Hub pour une parcelle.
   * Pipeline : Catalog API (images) + Statistical API (stats NDVI) → NdviData[]
   */
  private fetchFromSentinelHub(parcelleId: string, limit?: number): Observable<NdviData[]> {
    return this.parcelleService.getById(parcelleId).pipe(
      switchMap(parcelle => {
        if (!parcelle || !parcelle.geometry || parcelle.geometry.length < 3) {
          return of([]);
        }

        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 180); // 6 mois d'historique

        // Appels paralleles : Catalog (liste images) + Statistical (stats NDVI)
        return forkJoin({
          features: this.sentinelHub.searchImages(parcelle.geometry, start, end),
          stats: this.sentinelHub.getStatistics(parcelle.geometry, start, end),
        }).pipe(
          map(({ features, stats }) => {
            const list = this.sentinelHub.toNdviDataList(parcelleId, features, stats);
            return limit ? list.slice(-limit) : list;
          })
        );
      })
    );
  }

  // ── Alertes ──

  private checkAlerts(): void {
    const list = this.ndviData$.value;
    const byParcelle = new Map<string, NdviData[]>();
    for (const n of list) {
      const arr = byParcelle.get(n.parcelleId) || [];
      arr.push(n);
      byParcelle.set(n.parcelleId, arr);
    }

    byParcelle.forEach((records, parcelleId) => {
      const sorted = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (sorted.length >= 2) {
        const latest = sorted[0];
        const previous = sorted[1];
        const chute = previous.ndviMoyen - latest.ndviMoyen;
        if (chute > 0.15) {
          this.notificationService.create({
            type: 'alerte',
            titre: `Stress vegetatif detecte`,
            message: `Parcelle ${parcelleId} : NDVI en chute de ${previous.ndviMoyen.toFixed(2)} a ${latest.ndviMoyen.toFixed(2)} (-${chute.toFixed(2)})`,
            lienType: 'parcelle',
            lienId: parcelleId,
          });
        }
      }
    });
  }
}
