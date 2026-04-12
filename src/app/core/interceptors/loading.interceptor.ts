import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';

/**
 * Intercepteur de loading global.
 * Incrémente/décrémente le compteur de requêtes actives dans LoadingService.
 */
export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const loading = inject(LoadingService);

  loading.start();
  return next(req).pipe(
    finalize(() => loading.stop())
  );
};
