import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Intercepteur HTTP qui injecte le token JWT dans les headers Authorization.
 * Prêt pour branchement API NestJS – en mode mock, les appels HTTP ne sont
 * pas réellement émis, mais l'intercepteur est fonctionnel pour la transition.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const token = localStorage.getItem('agroassist_user')
    ? JSON.parse(localStorage.getItem('agroassist_user')!).token
    : null;

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-App-Version': '1.0.0',
        'Accept-Language': 'fr',
      },
    });
    return next(authReq);
  }

  return next(req);
};
