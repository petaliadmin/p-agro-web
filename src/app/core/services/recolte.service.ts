import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { Recolte } from '../models/recolte.model';
import { MOCK_RECOLTES } from '../../../assets/mock-data/recoltes.mock';
import { environment, API_ENDPOINTS } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecolteService {
  private http = inject(HttpClient);
  private recoltes$ = new BehaviorSubject<Recolte[]>(MOCK_RECOLTES);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Recolte[]> {
    if (!environment.mock) {
      return this.http.get<Recolte[]>(this.apiUrl + API_ENDPOINTS.recoltes.base);
    }
    return this.recoltes$.asObservable().pipe(delay(250));
  }

  getById(id: string): Observable<Recolte | undefined> {
    if (!environment.mock) {
      return this.http.get<Recolte>(this.apiUrl + API_ENDPOINTS.recoltes.byId(id));
    }
    return this.recoltes$.pipe(map(list => list.find(r => r.id === id)), delay(150));
  }

  getByParcelle(parcelleId: string): Observable<Recolte[]> {
    if (!environment.mock) {
      return this.http.get<Recolte[]>(this.apiUrl + API_ENDPOINTS.recoltes.byParcelle(parcelleId));
    }
    return this.recoltes$.pipe(
      map(list => list
        .filter(r => r.parcelleId === parcelleId)
        .sort((a, b) => new Date(b.dateRecolte).getTime() - new Date(a.dateRecolte).getTime())
      ),
      delay(200),
    );
  }

  create(data: Omit<Recolte, 'id' | 'rendement' | 'tauxPerte' | 'revenuTotal'>): Observable<Recolte> {
    const rendement = data.superficie > 0 ? (data.quantiteRecoltee / 1000) / data.superficie : 0;
    const tauxPerte = data.quantiteRecoltee > 0 ? (data.pertesPostRecolte / data.quantiteRecoltee) * 100 : 0;
    const quantiteNette = data.quantiteRecoltee - data.pertesPostRecolte;
    const revenuTotal = data.prixVente ? quantiteNette * data.prixVente : undefined;

    const recolte: Recolte = {
      ...data,
      id: 'rec' + Date.now(),
      rendement: Math.round(rendement * 100) / 100,
      tauxPerte: Math.round(tauxPerte * 10) / 10,
      revenuTotal,
    };

    if (!environment.mock) {
      return this.http.post<Recolte>(this.apiUrl + API_ENDPOINTS.recoltes.base, recolte);
    }
    const list = [...this.recoltes$.value, recolte];
    this.recoltes$.next(list);
    return of(recolte).pipe(delay(300));
  }

  update(id: string, changes: Partial<Recolte>): Observable<Recolte> {
    if (!environment.mock) {
      return this.http.patch<Recolte>(this.apiUrl + API_ENDPOINTS.recoltes.byId(id), changes);
    }
    const list = this.recoltes$.value.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, ...changes };
      // Recalculate derived fields
      updated.rendement = updated.superficie > 0 ? Math.round(((updated.quantiteRecoltee / 1000) / updated.superficie) * 100) / 100 : 0;
      updated.tauxPerte = updated.quantiteRecoltee > 0 ? Math.round((updated.pertesPostRecolte / updated.quantiteRecoltee) * 1000) / 10 : 0;
      const net = updated.quantiteRecoltee - updated.pertesPostRecolte;
      updated.revenuTotal = updated.prixVente ? net * updated.prixVente : undefined;
      return updated;
    });
    this.recoltes$.next(list);
    const updated = list.find(r => r.id === id)!;
    return of(updated).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    if (!environment.mock) {
      return this.http.delete<boolean>(this.apiUrl + API_ENDPOINTS.recoltes.byId(id));
    }
    const list = this.recoltes$.value.filter(r => r.id !== id);
    this.recoltes$.next(list);
    return of(true).pipe(delay(200));
  }

  /** Récoltes avec pertes > seuil (30% = seuil critique FAO) */
  getAlertesPertes(seuil = 30): Observable<Recolte[]> {
    return this.recoltes$.pipe(
      map(list => list.filter(r => r.tauxPerte > seuil)),
      delay(150),
    );
  }

  /** Classement des parcelles par rendement (dernière récolte par parcelle) */
  getClassementRendement(): Observable<{ parcelleId: string; culture: string; rendement: number; dateRecolte: Date }[]> {
    return this.recoltes$.pipe(
      map(list => {
        const parMap = new Map<string, Recolte>();
        list.forEach(r => {
          const existing = parMap.get(r.parcelleId);
          if (!existing || new Date(r.dateRecolte) > new Date(existing.dateRecolte)) {
            parMap.set(r.parcelleId, r);
          }
        });
        return Array.from(parMap.values())
          .map(r => ({ parcelleId: r.parcelleId, culture: r.culture, rendement: r.rendement, dateRecolte: r.dateRecolte }))
          .sort((a, b) => b.rendement - a.rendement);
      }),
      delay(200),
    );
  }
}
