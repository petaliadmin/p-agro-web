import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

/**
 * Intercepteur global d'erreurs HTTP.
 * Gère 401 (redirection login), 403 (accès refusé), 500+ (erreur serveur).
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ne pas traiter les erreurs des API externes (Sentinel Hub)
      if (req.url.includes('sentinel-hub.com')) {
        return throwError(() => error);
      }

      switch (error.status) {
        case 401:
          auth.logout();
          router.navigate(['/login']);
          toast.error('Session expirée. Veuillez vous reconnecter.');
          break;
        case 403:
          toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
          router.navigate(['/403']);
          break;
        case 404:
          toast.error('Ressource introuvable.');
          break;
        case 0:
          toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
          break;
        default:
          if (error.status >= 500) {
            toast.error('Erreur serveur. Veuillez réessayer ultérieurement.');
            router.navigate(['/500']);
          }
          break;
      }
      return throwError(() => error);
    })
  );
};
