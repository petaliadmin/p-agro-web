// ============================================================
// TacheService
// ============================================================
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { Tache, StatutTache } from '../models/tache.model';
import { MOCK_TACHES } from '../../../assets/mock-data/taches.mock';
import { environment, API_ENDPOINTS } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TacheService {
  private http = inject(HttpClient);
  private taches$ = new BehaviorSubject<Tache[]>(MOCK_TACHES);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Tache[]> {
    if (!environment.mock) {
      return this.http.get<Tache[]>(this.apiUrl + API_ENDPOINTS.taches.base);
    }
    return this.taches$.asObservable().pipe(delay(250));
  }

  getById(id: string): Observable<Tache | undefined> {
    if (!environment.mock) {
      return this.http.get<Tache>(this.apiUrl + API_ENDPOINTS.taches.byId(id));
    }
    return this.taches$.pipe(map(list => list.find(t => t.id === id)), delay(150));
  }

  getByStatut(statut: StatutTache): Observable<Tache[]> {
    return this.taches$.pipe(map(list => list.filter(t => t.statut === statut)), delay(150));
  }

  getUrgentes(): Observable<Tache[]> {
    if (!environment.mock) {
      return this.http.get<Tache[]>(this.apiUrl + API_ENDPOINTS.taches.urgentes);
    }
    return this.taches$.pipe(
      map(list => list.filter(t => t.priorite === 'urgent' && t.statut !== 'done')),
      delay(150)
    );
  }

  updateStatut(id: string, statut: StatutTache): Observable<Tache> {
    if (!environment.mock) {
      return this.http.patch<Tache>(this.apiUrl + API_ENDPOINTS.taches.statut(id), { statut });
    }
    return this.update(id, { statut });
  }

  update(id: string, changes: Partial<Tache>): Observable<Tache> {
    if (!environment.mock) {
      return this.http.patch<Tache>(this.apiUrl + API_ENDPOINTS.taches.byId(id), changes);
    }
    const current = this.taches$.value;
    const idx = current.findIndex(t => t.id === id);
    const updated = { ...current[idx], ...changes };
    const newList = [...current];
    newList[idx] = updated;
    this.taches$.next(newList);
    return of(updated).pipe(delay(300));
  }

  create(tache: Omit<Tache, 'id'>): Observable<Tache> {
    if (!environment.mock) {
      return this.http.post<Tache>(this.apiUrl + API_ENDPOINTS.taches.base, tache);
    }
    const newTache: Tache = { ...tache, id: `t${Date.now()}` };
    this.taches$.next([...this.taches$.value, newTache]);
    return of(newTache).pipe(delay(400));
  }

  delete(id: string): Observable<boolean> {
    if (!environment.mock) {
      return this.http.delete<boolean>(this.apiUrl + API_ENDPOINTS.taches.byId(id));
    }
    this.taches$.next(this.taches$.value.filter(t => t.id !== id));
    return of(true).pipe(delay(300));
  }

  getStats(): Observable<{ total: number; urgentes: number; enCours: number; terminees: number }> {
    if (!environment.mock) {
      return this.http.get<{ total: number; urgentes: number; enCours: number; terminees: number }>(this.apiUrl + API_ENDPOINTS.taches.stats);
    }
    return this.taches$.pipe(
      map(t => ({
        total: t.length,
        urgentes: t.filter(x => x.priorite === 'urgent' && x.statut !== 'done').length,
        enCours: t.filter(x => x.statut === 'en_cours').length,
        terminees: t.filter(x => x.statut === 'done').length,
      })),
      delay(100)
    );
  }
}
