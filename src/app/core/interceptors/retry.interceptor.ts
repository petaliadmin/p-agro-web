import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, timer } from 'rxjs';

/**
 * Intercepteur de retry automatique.
 * Relance les requêtes GET échouées jusqu'à 2 fois avec délai exponentiel.
 * Les mutations (POST, PUT, PATCH, DELETE) ne sont pas relancées.
 */
export const retryInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Ne retry que les GET (idempotentes)
  if (req.method !== 'GET') {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: 2,
      delay: (error, retryCount) => {
        // Pas de retry sur 4xx (erreurs client)
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
        // Délai exponentiel : 1s, 2s
        return timer(retryCount * 1000);
      },
    })
  );
};
