import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { Equipe, Membre } from '../models/membre.model';
import { MOCK_EQUIPES, MOCK_MEMBRES } from '../../../assets/mock-data/taches.mock';
import { environment, API_ENDPOINTS } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EquipeService {
  private http = inject(HttpClient);
  private equipes$ = new BehaviorSubject<Equipe[]>(MOCK_EQUIPES);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Equipe[]> {
    if (!environment.mock) {
      return this.http.get<Equipe[]>(this.apiUrl + API_ENDPOINTS.equipes.base);
    }
    return this.equipes$.asObservable().pipe(delay(200));
  }

  getById(id: string): Observable<Equipe | undefined> {
    if (!environment.mock) {
      return this.http.get<Equipe>(this.apiUrl + API_ENDPOINTS.equipes.byId(id));
    }
    return this.equipes$.pipe(map(list => list.find(e => e.id === id)), delay(150));
  }

  create(equipe: Omit<Equipe, 'id'>): Observable<Equipe> {
    if (!environment.mock) {
      return this.http.post<Equipe>(this.apiUrl + API_ENDPOINTS.equipes.base, equipe);
    }
    const newEquipe: Equipe = { ...equipe, id: `eq${Date.now()}` };
    this.equipes$.next([...this.equipes$.value, newEquipe]);
    return of(newEquipe).pipe(delay(400));
  }

  update(id: string, changes: Partial<Equipe>): Observable<Equipe> {
    if (!environment.mock) {
      return this.http.patch<Equipe>(this.apiUrl + API_ENDPOINTS.equipes.byId(id), changes);
    }
    const current = this.equipes$.value;
    const idx = current.findIndex(e => e.id === id);
    if (idx === -1) throw new Error(`Equipe ${id} introuvable`);
    const updated = { ...current[idx], ...changes };
    const newList = [...current];
    newList[idx] = updated;
    this.equipes$.next(newList);
    return of(updated).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    if (!environment.mock) {
      return this.http.delete<boolean>(this.apiUrl + API_ENDPOINTS.equipes.byId(id));
    }
    this.equipes$.next(this.equipes$.value.filter(e => e.id !== id));
    return of(true).pipe(delay(300));
  }
}

@Injectable({ providedIn: 'root' })
export class MembreService {
  private http = inject(HttpClient);
  private membres$ = new BehaviorSubject<Membre[]>(MOCK_MEMBRES);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Membre[]> {
    if (!environment.mock) {
      return this.http.get<Membre[]>(this.apiUrl + API_ENDPOINTS.membres.base);
    }
    return this.membres$.asObservable().pipe(delay(200));
  }

  getById(id: string): Observable<Membre | undefined> {
    if (!environment.mock) {
      return this.http.get<Membre>(this.apiUrl + API_ENDPOINTS.membres.byId(id));
    }
    return this.membres$.pipe(map(list => list.find(m => m.id === id)), delay(100));
  }

  getByEquipe(equipeId: string): Observable<Membre[]> {
    if (!environment.mock) {
      return this.http.get<Membre[]>(this.apiUrl + API_ENDPOINTS.equipes.membres(equipeId));
    }
    return this.membres$.pipe(map(list => list.filter(m => m.equipeId === equipeId)), delay(150));
  }

  getDisponibles(): Observable<Membre[]> {
    if (!environment.mock) {
      return this.http.get<Membre[]>(this.apiUrl + API_ENDPOINTS.membres.disponibles);
    }
    return this.membres$.pipe(map(list => list.filter(m => m.disponible)), delay(150));
  }

  create(membre: Omit<Membre, 'id'>): Observable<Membre> {
    if (!environment.mock) {
      return this.http.post<Membre>(this.apiUrl + API_ENDPOINTS.membres.base, membre);
    }
    const newMembre: Membre = { ...membre, id: `tech${Date.now()}` };
    this.membres$.next([...this.membres$.value, newMembre]);
    return of(newMembre).pipe(delay(400));
  }

  update(id: string, changes: Partial<Membre>): Observable<Membre> {
    if (!environment.mock) {
      return this.http.patch<Membre>(this.apiUrl + API_ENDPOINTS.membres.byId(id), changes);
    }
    const current = this.membres$.value;
    const idx = current.findIndex(m => m.id === id);
    if (idx === -1) throw new Error(`Membre ${id} introuvable`);
    const updated = { ...current[idx], ...changes };
    const newList = [...current];
    newList[idx] = updated;
    this.membres$.next(newList);
    return of(updated).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    if (!environment.mock) {
      return this.http.delete<boolean>(this.apiUrl + API_ENDPOINTS.membres.byId(id));
    }
    this.membres$.next(this.membres$.value.filter(m => m.id !== id));
    return of(true).pipe(delay(300));
  }
}
