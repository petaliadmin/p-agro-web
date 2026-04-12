import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { Parcelle, ParcelleStats } from '../models/parcelle.model';
import { MOCK_PARCELLES } from '../../../assets/mock-data/parcelles.mock';
import { environment, API_ENDPOINTS } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ParcelleService {
  private http = inject(HttpClient);
  private parcelles$ = new BehaviorSubject<Parcelle[]>(MOCK_PARCELLES);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Parcelle[]> {
    if (!environment.mock) {
      return this.http.get<Parcelle[]>(this.apiUrl + API_ENDPOINTS.parcelles.base);
    }
    return this.parcelles$.asObservable().pipe(delay(250));
  }

  getById(id: string): Observable<Parcelle | undefined> {
    if (!environment.mock) {
      return this.http.get<Parcelle>(this.apiUrl + API_ENDPOINTS.parcelles.byId(id));
    }
    return this.parcelles$.pipe(
      map(list => list.find(p => p.id === id)),
      delay(150)
    );
  }

  getByStatut(statut: string): Observable<Parcelle[]> {
    return this.parcelles$.pipe(
      map(list => list.filter(p => p.statut === statut)),
      delay(150)
    );
  }

  getByTechnicien(techId: string): Observable<Parcelle[]> {
    return this.parcelles$.pipe(
      map(list => list.filter(p => p.technicienId === techId)),
      delay(150)
    );
  }

  getByZone(zone: string): Observable<Parcelle[]> {
    return this.parcelles$.pipe(
      map(list => list.filter(p => p.zone === zone)),
      delay(150)
    );
  }

  update(id: string, changes: Partial<Parcelle>): Observable<Parcelle> {
    if (!environment.mock) {
      return this.http.patch<Parcelle>(this.apiUrl + API_ENDPOINTS.parcelles.byId(id), changes);
    }
    const current = this.parcelles$.value;
    const idx = current.findIndex(p => p.id === id);
    if (idx === -1) throw new Error(`Parcelle ${id} introuvable`);
    const updated = { ...current[idx], ...changes };
    const newList = [...current];
    newList[idx] = updated;
    this.parcelles$.next(newList);
    return of(updated).pipe(delay(300));
  }

  create(parcelle: Omit<Parcelle, 'id' | 'createdAt'>): Observable<Parcelle> {
    if (!environment.mock) {
      return this.http.post<Parcelle>(this.apiUrl + API_ENDPOINTS.parcelles.base, parcelle);
    }
    const newParcelle: Parcelle = {
      ...parcelle,
      id: `p${Date.now()}`,
      createdAt: new Date(),
    };
    this.parcelles$.next([...this.parcelles$.value, newParcelle]);
    return of(newParcelle).pipe(delay(400));
  }

  delete(id: string): Observable<boolean> {
    if (!environment.mock) {
      return this.http.delete<boolean>(this.apiUrl + API_ENDPOINTS.parcelles.byId(id));
    }
    const current = this.parcelles$.value;
    this.parcelles$.next(current.filter(p => p.id !== id));
    return of(true).pipe(delay(300));
  }

  getStats(): Observable<ParcelleStats> {
    if (!environment.mock) {
      return this.http.get<ParcelleStats>(this.apiUrl + API_ENDPOINTS.parcelles.stats);
    }
    return this.parcelles$.pipe(
      map(p => ({
        total: p.length,
        urgentes: p.filter(x => x.statut === 'urgent').length,
        enAttention: p.filter(x => x.statut === 'attention').length,
        totalHa: Math.round(p.reduce((sum, x) => sum + x.superficie, 0) * 10) / 10,
      })),
      delay(100)
    );
  }

  getUrgentes(): Observable<Parcelle[]> {
    if (!environment.mock) {
      return this.http.get<Parcelle[]>(this.apiUrl + API_ENDPOINTS.parcelles.urgentes);
    }
    return this.parcelles$.pipe(
      map(list => list.filter(p => p.statut === 'urgent' || p.statut === 'attention')),
      delay(150)
    );
  }

  getZones(): string[] {
    return [...new Set(MOCK_PARCELLES.map(p => p.zone))];
  }
}
