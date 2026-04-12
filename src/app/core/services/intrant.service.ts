import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { Intrant, IntrantStats, MouvementIntrant } from '../models/intrant.model';
import { MOCK_INTRANTS } from '../../../assets/mock-data/intrants.mock';
import { environment, API_ENDPOINTS } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IntrantService {
  private http = inject(HttpClient);
  private intrants$ = new BehaviorSubject<Intrant[]>(MOCK_INTRANTS);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Intrant[]> {
    if (!environment.mock) {
      return this.http.get<Intrant[]>(this.apiUrl + API_ENDPOINTS.intrants.base);
    }
    return this.intrants$.asObservable().pipe(delay(250));
  }

  getById(id: string): Observable<Intrant | undefined> {
    if (!environment.mock) {
      return this.http.get<Intrant>(this.apiUrl + API_ENDPOINTS.intrants.byId(id));
    }
    return this.intrants$.pipe(map(list => list.find(i => i.id === id)), delay(150));
  }

  getEnAlerte(): Observable<Intrant[]> {
    if (!environment.mock) {
      return this.http.get<Intrant[]>(this.apiUrl + API_ENDPOINTS.intrants.alertes);
    }
    return this.intrants$.pipe(
      map(list => list.filter(i => i.quantiteStock <= i.seuilAlerte)),
      delay(150)
    );
  }

  getExpirationProche(joursMax = 30): Observable<Intrant[]> {
    const limite = new Date(Date.now() + joursMax * 86400000);
    return this.intrants$.pipe(
      map(list => list.filter(i => new Date(i.dateExpiration) <= limite)),
      delay(150)
    );
  }

  addMouvement(intrantId: string, mouvement: Omit<MouvementIntrant, 'id'>): Observable<Intrant> {
    if (!environment.mock) {
      return this.http.post<Intrant>(this.apiUrl + API_ENDPOINTS.intrants.mouvement(intrantId), mouvement);
    }
    const current = this.intrants$.value;
    const idx = current.findIndex(i => i.id === intrantId);
    const intrant = { ...current[idx] };
    const newMouvement = { ...mouvement, id: `m${Date.now()}` };
    const delta = mouvement.type === 'entree' ? mouvement.quantite : -mouvement.quantite;
    intrant.quantiteStock += delta;
    intrant.mouvements = [...intrant.mouvements, newMouvement];
    const newList = [...current];
    newList[idx] = intrant;
    this.intrants$.next(newList);
    return of(intrant).pipe(delay(300));
  }

  create(intrant: Omit<Intrant, 'id' | 'mouvements'>): Observable<Intrant> {
    if (!environment.mock) {
      return this.http.post<Intrant>(this.apiUrl + API_ENDPOINTS.intrants.base, intrant);
    }
    const newIntrant: Intrant = { ...intrant, id: `int${Date.now()}`, mouvements: [] };
    this.intrants$.next([...this.intrants$.value, newIntrant]);
    return of(newIntrant).pipe(delay(400));
  }

  update(id: string, changes: Partial<Intrant>): Observable<Intrant> {
    if (!environment.mock) {
      return this.http.patch<Intrant>(this.apiUrl + API_ENDPOINTS.intrants.byId(id), changes);
    }
    const current = this.intrants$.value;
    const idx = current.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`Intrant ${id} introuvable`);
    const updated = { ...current[idx], ...changes };
    const newList = [...current];
    newList[idx] = updated;
    this.intrants$.next(newList);
    return of(updated).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    if (!environment.mock) {
      return this.http.delete<boolean>(this.apiUrl + API_ENDPOINTS.intrants.byId(id));
    }
    this.intrants$.next(this.intrants$.value.filter(i => i.id !== id));
    return of(true).pipe(delay(300));
  }

  getStats(): Observable<IntrantStats> {
    if (!environment.mock) {
      return this.http.get<IntrantStats>(this.apiUrl + API_ENDPOINTS.intrants.stats);
    }
    const limite30j = new Date(Date.now() + 30 * 86400000);
    return this.intrants$.pipe(
      map(list => ({
        totalReferences: list.length,
        alertesStock: list.filter(i => i.quantiteStock <= i.seuilAlerte).length,
        alertesExpiration: list.filter(i => new Date(i.dateExpiration) <= limite30j).length,
        valeurTotale: list.reduce((sum, i) => sum + i.quantiteStock * i.prixUnitaire, 0),
      })),
      delay(100)
    );
  }

  getConsommation30j(): Observable<{ type: string; quantite: number }[]> {
    if (!environment.mock) {
      return this.http.get<{ type: string; quantite: number }[]>(this.apiUrl + API_ENDPOINTS.intrants.conso);
    }
    // Calculer depuis les mouvements réels des 30 derniers jours
    return this.intrants$.pipe(
      map(intrants => {
        const il30j = new Date();
        il30j.setDate(il30j.getDate() - 30);
        const consoParType: Record<string, number> = {};
        intrants.forEach(i => {
          i.mouvements
            .filter(m => m.type === 'sortie' && new Date(m.date) >= il30j)
            .forEach(m => {
              const type = i.type.charAt(0).toUpperCase() + i.type.slice(1);
              consoParType[type] = (consoParType[type] || 0) + m.quantite;
            });
        });
        return Object.entries(consoParType).map(([type, quantite]) => ({ type, quantite }));
      }),
      delay(200)
    );
  }
}
