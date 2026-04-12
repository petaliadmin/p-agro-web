import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, delay } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Visite } from '../models/visite.model';
import { MOCK_VISITES } from '../../../assets/mock-data/visites.mock';
import { environment, API_ENDPOINTS } from '../../../environments/environment';
import { RapportService } from './rapport.service';

@Injectable({ providedIn: 'root' })
export class VisiteService {
  private http = inject(HttpClient);
  private rapportService = inject(RapportService);
  private visites$ = new BehaviorSubject<Visite[]>(MOCK_VISITES);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Visite[]> {
    if (!environment.mock) {
      return this.http.get<Visite[]>(this.apiUrl + API_ENDPOINTS.visites.base);
    }
    return this.visites$.asObservable().pipe(delay(250));
  }

  getById(id: string): Observable<Visite | undefined> {
    if (!environment.mock) {
      return this.http.get<Visite>(this.apiUrl + API_ENDPOINTS.visites.byId(id));
    }
    return this.visites$.pipe(
      map(list => list.find(v => v.id === id)),
      delay(150)
    );
  }

  getByParcelle(parcelleId: string): Observable<Visite[]> {
    if (!environment.mock) {
      return this.http.get<Visite[]>(this.apiUrl + API_ENDPOINTS.visites.byParcelle(parcelleId));
    }
    return this.visites$.pipe(
      map(list => list.filter(v => v.parcelleId === parcelleId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())),
      delay(150)
    );
  }

  getByTechnicien(techId: string): Observable<Visite[]> {
    return this.visites$.pipe(
      map(list => list.filter(v => v.technicienId === techId)),
      delay(150)
    );
  }

  getRecentes(limit = 5): Observable<Visite[]> {
    if (!environment.mock) {
      return this.http.get<Visite[]>(this.apiUrl + API_ENDPOINTS.visites.recentes, { params: { limit } });
    }
    return this.visites$.pipe(
      map(list => [...list]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit)),
      delay(200)
    );
  }

  getDuJour(): Observable<Visite[]> {
    const today = new Date();
    return this.visites$.pipe(
      map(list => list.filter(v => {
        const d = new Date(v.date);
        return d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear();
      })),
      delay(150)
    );
  }

  getActiviteSemaine(): Observable<{ jour: string; count: number }[]> {
    if (!environment.mock) {
      return this.http.get<{ jour: string; count: number }[]>(this.apiUrl + API_ENDPOINTS.visites.activite);
    }
    const joursLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return this.visites$.pipe(
      map(visites => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        // Monday = start of week
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
        monday.setHours(0, 0, 0, 0);

        const counts: Record<number, number> = {};
        for (let i = 0; i < 7; i++) counts[i] = 0;

        visites.forEach(v => {
          const d = new Date(v.date);
          d.setHours(0, 0, 0, 0);
          const diff = Math.floor((d.getTime() - monday.getTime()) / 86400000);
          if (diff >= 0 && diff < 7) {
            counts[diff]++;
          }
        });

        const orderedLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        return orderedLabels.map((jour, i) => ({ jour, count: counts[i] }));
      }),
      delay(200)
    );
  }

  create(visite: Omit<Visite, 'id'>): Observable<Visite> {
    if (!environment.mock) {
      return this.http.post<Visite>(this.apiUrl + API_ENDPOINTS.visites.base, visite);
    }
    const newVisite: Visite = {
      ...visite,
      id: `v${Date.now()}`,
    };
    this.visites$.next([...this.visites$.value, newVisite]);
    return of(newVisite).pipe(delay(400));
  }

  update(id: string, changes: Partial<Visite>): Observable<Visite> {
    if (!environment.mock) {
      return this.http.patch<Visite>(this.apiUrl + API_ENDPOINTS.visites.byId(id), changes);
    }
    const current = this.visites$.value;
    const idx = current.findIndex(v => v.id === id);
    if (idx === -1) throw new Error(`Visite ${id} introuvable`);
    const updated = { ...current[idx], ...changes };
    const newList = [...current];
    newList[idx] = updated;
    this.visites$.next(newList);

    // Génération automatique du rapport quand la visite est complétée
    if (changes.statut === 'completee' && current[idx].statut !== 'completee') {
      return this.rapportService.genererRapportVisite(updated).pipe(
        switchMap(rapport => {
          updated.rapport = rapport;
          newList[idx] = updated;
          this.visites$.next(newList);
          return of(updated).pipe(delay(100));
        })
      );
    }

    return of(updated).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    if (!environment.mock) {
      return this.http.delete<boolean>(this.apiUrl + API_ENDPOINTS.visites.byId(id));
    }
    const current = this.visites$.value;
    this.visites$.next(current.filter(v => v.id !== id));
    return of(true).pipe(delay(300));
  }

  getStats(): Observable<{ total: number; completees: number; planifiees: number; enCours: number }> {
    if (!environment.mock) {
      return this.http.get<{ total: number; completees: number; planifiees: number; enCours: number }>(this.apiUrl + API_ENDPOINTS.visites.stats);
    }
    return this.visites$.pipe(
      map(v => ({
        total: v.length,
        completees: v.filter(x => x.statut === 'completee').length,
        planifiees: v.filter(x => x.statut === 'planifiee').length,
        enCours: v.filter(x => x.statut === 'en_cours').length,
      })),
      delay(100)
    );
  }
}
