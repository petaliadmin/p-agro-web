import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, finalize, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SentinelHubTokenResponse } from '../models/sentinelhub.model';

@Injectable({ providedIn: 'root' })
export class SentinelHubAuthService {
  private http = inject(HttpClient);

  private readonly tokenUrl = `${environment.sentinelhub.baseUrl}/auth/realms/main/protocol/openid-connect/token`;
  private readonly clientId = environment.sentinelhub.clientId;
  private readonly clientSecret = environment.sentinelhub.clientSecret;

  private cachedToken: { accessToken: string; expiresAt: number } | null = null;
  private tokenRequest$: Observable<string> | null = null;

  /** true si les credentials Sentinel Hub sont configurees */
  get isConfigured(): boolean {
    return !!this.clientId && !!this.clientSecret;
  }

  /**
   * Retourne un bearer token valide. Utilise le cache en memoire si le token
   * n'expire pas dans les 60 prochaines secondes, sinon en demande un nouveau.
   * shareReplay(1) empeche les requetes token concurrentes.
   */
  getToken(): Observable<string> {
    if (this.isTokenValid()) {
      return of(this.cachedToken!.accessToken);
    }

    if (!this.tokenRequest$) {
      const body = new URLSearchParams();
      body.set('grant_type', 'client_credentials');
      body.set('client_id', this.clientId);
      body.set('client_secret', this.clientSecret);

      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

      this.tokenRequest$ = this.http.post<SentinelHubTokenResponse>(this.tokenUrl, body.toString(), { headers }).pipe(
        map(res => {
          this.cachedToken = {
            accessToken: res.access_token,
            expiresAt: Date.now() + (res.expires_in * 1000),
          };
          return res.access_token;
        }),
        finalize(() => { this.tokenRequest$ = null; }),
        shareReplay(1)
      );
    }

    return this.tokenRequest$;
  }

  private isTokenValid(): boolean {
    if (!this.cachedToken) return false;
    // Marge de 60 secondes avant expiration
    return this.cachedToken.expiresAt > Date.now() + 60_000;
  }
}
