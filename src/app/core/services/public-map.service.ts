import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ParcelleService } from './parcelle.service';
import { Parcelle } from '../models/parcelle.model';
import { PointOfInterest, CarbonEmission } from '../models/poi.model';
import { MOCK_POIS, MOCK_CARBON_EMISSIONS } from '../../../assets/mock-data/poi.mock';

@Injectable({ providedIn: 'root' })
export class PublicMapService {
  private parcelleService = inject(ParcelleService);

  getPublicParcelles(): Observable<Parcelle[]> {
    return this.parcelleService.getAll();
  }

  getPoisByParcelle(parcelleId: string): Observable<PointOfInterest[]> {
    return of(MOCK_POIS.filter(p => p.parcelleId === parcelleId)).pipe(delay(150));
  }

  getAllPois(): Observable<PointOfInterest[]> {
    return of(MOCK_POIS).pipe(delay(150));
  }

  getCarbonEmissions(): Observable<CarbonEmission[]> {
    return of(MOCK_CARBON_EMISSIONS).pipe(delay(100));
  }

  getCarbonByParcelle(parcelleId: string): Observable<CarbonEmission | undefined> {
    return of(MOCK_CARBON_EMISSIONS.find(c => c.parcelleId === parcelleId)).pipe(delay(100));
  }
}
