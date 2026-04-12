import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { Notification, MeteoJour } from '../models/user.model';
import { MOCK_NOTIFICATIONS, MOCK_METEO } from '../../../assets/mock-data/intrants.mock';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly STORAGE_KEY = 'agroassist_notifs_lues';
  private notifs$ = new BehaviorSubject<Notification[]>(this.loadWithReadState(MOCK_NOTIFICATIONS));

  private loadWithReadState(notifs: Notification[]): Notification[] {
    const luesIds = this.getReadIds();
    return notifs.map(n => luesIds.has(n.id) ? { ...n, lue: true } : n);
  }

  private getReadIds(): Set<string> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
  }

  private persistReadIds(): void {
    const ids = this.notifs$.value.filter(n => n.lue).map(n => n.id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
  }

  getAll(): Observable<Notification[]> {
    return this.notifs$.asObservable().pipe(delay(150));
  }

  getNonLues(): Observable<Notification[]> {
    return this.notifs$.pipe(map(list => list.filter(n => !n.lue)), delay(100));
  }

  countNonLues(): Observable<number> {
    return this.notifs$.pipe(map(list => list.filter(n => !n.lue).length), delay(100));
  }

  marquerLue(id: string): void {
    const list = this.notifs$.value.map(n => n.id === id ? { ...n, lue: true } : n);
    this.notifs$.next(list);
    this.persistReadIds();
  }

  marquerToutesLues(): void {
    const list = this.notifs$.value.map(n => ({ ...n, lue: true }));
    this.notifs$.next(list);
    this.persistReadIds();
  }

  create(notification: Omit<Notification, 'id' | 'date' | 'lue'>): void {
    const newNotif: Notification = {
      ...notification,
      id: `n${Date.now()}`,
      date: new Date(),
      lue: false,
    };
    this.notifs$.next([newNotif, ...this.notifs$.value]);
  }

  /** Simule des notifications temps réel (appelé au démarrage) */
  startSimulation(): void {
    const scenarios = [
      { type: 'alerte' as const, titre: 'Stock critique', message: 'Le stock de NPK 15-15-15 est en dessous du seuil d\'alerte.' },
      { type: 'succes' as const, titre: 'Visite complétée', message: 'Visite de la Parcelle Walo Nord terminée avec succès.' },
      { type: 'avertissement' as const, titre: 'Tâche en retard', message: 'Le traitement fongicide Podor Est a dépassé sa date d\'échéance.' },
      { type: 'info' as const, titre: 'Nouveau membre', message: 'Un nouveau technicien a été ajouté à l\'Équipe Fleuve Nord.' },
    ];

    let i = 0;
    setInterval(() => {
      const scenario = scenarios[i % scenarios.length];
      this.create(scenario);
      i++;
    }, 60000); // une notification toutes les 60s
  }
}

@Injectable({ providedIn: 'root' })
export class MeteoService {
  getMeteo(): Observable<MeteoJour[]> {
    return of(MOCK_METEO).pipe(delay(300));
  }

  getAujourdhui(): Observable<MeteoJour> {
    return of(MOCK_METEO[0]).pipe(delay(200));
  }
}
