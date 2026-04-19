import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Coordonnees } from '../models/parcelle.model';
import { NdviData, NdviSource } from '../models/ndvi.model';
import {
  SentinelHubCatalogRequest,
  SentinelHubCatalogResponse,
  SentinelHubFeature,
  SentinelHubStatRequest,
  SentinelHubStatResponse,
  SentinelHubStatEntry,
  NDVI_STATS_EVALSCRIPT,
} from '../models/sentinelhub.model';
import { SentinelHubAuthService } from './sentinelhub-auth.service';

@Injectable({ providedIn: 'root' })
export class SentinelHubService {
  private http = inject(HttpClient);
  private auth = inject(SentinelHubAuthService);

  private readonly baseUrl = environment.sentinelhub.baseUrl;
  private readonly instanceId = environment.sentinelhub.instanceId;
  private readonly maxCloud = environment.sentinelhub.maxCloudCoverage;

  /** true si Sentinel Hub est configure (credentials + instance) */
  get isConfigured(): boolean {
    return this.auth.isConfigured;
  }

  /**
   * Recherche les images Sentinel-2 L2A disponibles via Catalog API.
   * Filtre par couverture nuageuse et couverture donnees.
   */
  searchImages(geometry: Coordonnees[], from: Date, to: Date, maxCloudCoverage?: number): Observable<SentinelHubFeature[]> {
    const bbox = this.geometryToBbox(geometry);
    const body: SentinelHubCatalogRequest = {
      collections: ['sentinel-2-l2a'],
      datetime: `${from.toISOString()}/${to.toISOString()}`,
      bbox,
      filter: `eo:cloud_cover < ${maxCloudCoverage ?? this.maxCloud}`,
      limit: 20,
    };

    return this.auth.getToken().pipe(
      switchMap(token => this.http.post<SentinelHubCatalogResponse>(
        `${this.baseUrl}/api/v1/catalog/1.0.0/search`,
        body,
        { headers: this.authHeaders(token) }
      )),
      map(response => response.features
        .filter(f => (f.properties['sentinel:data_coverage'] ?? 100) > 50)
        .sort((a, b) => new Date(b.properties.datetime).getTime() - new Date(a.properties.datetime).getTime())
      )
    );
  }

  /**
   * Recupere les statistiques NDVI via Statistical API.
   * Un seul appel couvre tout l'intervalle avec agregation journaliere (P1D).
   * L'evalscript filtre les nuages par pixel via la bande SCL.
   */
  getStatistics(geometry: Coordonnees[], from: Date, to: Date): Observable<SentinelHubStatResponse> {
    const geoJson = this.toGeoJsonPolygon(geometry);
    const fromStr = from.toISOString();
    const toStr = to.toISOString();

    const body: SentinelHubStatRequest = {
      input: {
        data: [{
          type: 'sentinel-2-l2a',
          dataFilter: {
            timeRange: { from: fromStr, to: toStr },
            maxCloudCoverage: this.maxCloud,
          },
        }],
        bounds: { geometry: geoJson },
      },
      aggregation: {
        timeRange: { from: fromStr, to: toStr },
        aggregationInterval: { of: 'P1D' },
        evalscript: NDVI_STATS_EVALSCRIPT,
      },
    };

    return this.auth.getToken().pipe(
      switchMap(token => this.http.post<SentinelHubStatResponse>(
        `${this.baseUrl}/api/v1/statistics`,
        body,
        { headers: this.authHeaders(token) }
      ))
    );
  }

  /**
   * Construit l'URL WMS pour affichage NDVI dans Leaflet via L.tileLayer.wms().
   * Necessite un instanceId configure dans le dashboard Sentinel Hub.
   */
  buildWmsTileUrl(): string {
    return `${this.baseUrl}/ogc/wms/${this.instanceId}`;
  }

  /**
   * Convertit les reponses Sentinel Hub en NdviData interne.
   * Associe les features du Catalog avec les stats du Statistical API.
   */
  toNdviDataList(
    parcelleId: string,
    features: SentinelHubFeature[],
    statsResponse: SentinelHubStatResponse
  ): NdviData[] {
    // Index stats par date (YYYY-MM-DD)
    const statsMap = new Map<string, SentinelHubStatEntry>();
    for (const entry of statsResponse.data) {
      const dateKey = entry.interval.from.split('T')[0];
      statsMap.set(dateKey, entry);
    }

    const results: NdviData[] = [];
    const wmsTileUrl = this.instanceId ? this.buildWmsTileUrl() : undefined;

    for (const feature of features) {
      const dateKey = feature.properties.datetime.split('T')[0];
      const statEntry = statsMap.get(dateKey);
      if (!statEntry) continue;

      const bandStats = statEntry.outputs?.ndvi?.bands?.B0?.stats;
      if (!bandStats || bandStats.sampleCount === 0) continue;

      const dt = new Date(feature.properties.datetime);

      results.push({
        id: `sh-${parcelleId}-${Math.floor(dt.getTime() / 1000)}`,
        parcelleId,
        date: dt,
        ndviMoyen: bandStats.mean,
        ndviMin: bandStats.min,
        ndviMax: bandStats.max,
        resolution: 10,
        source: 'sentinel-2' as NdviSource,
        zones: [],
        tileUrl: wmsTileUrl,
        tileType: wmsTileUrl ? 'wms' : undefined,
        imageUrl: undefined,
        cloudCoverage: Math.round(feature.properties['eo:cloud_cover'] ?? 0),
      });
    }

    return results.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  // ── Helpers ──

  /** Calcule la bounding box [minLng, minLat, maxLng, maxLat] depuis la geometrie */
  geometryToBbox(geometry: Coordonnees[]): [number, number, number, number] {
    const lats = geometry.map(c => c.lat);
    const lngs = geometry.map(c => c.lng);
    return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
  }

  /** Convertit la geometrie {lat,lng}[] en GeoJSON Polygon {type, coordinates: [[lng,lat]...]} */
  toGeoJsonPolygon(geometry: Coordonnees[]): { type: string; coordinates: number[][][] } {
    const coords = geometry.map(c => [c.lng, c.lat]);
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coords.push([...first]);
    }
    return { type: 'Polygon', coordinates: [coords] };
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }
}
