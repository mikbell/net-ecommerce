import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { BusyService } from '../services/busy.service';

/**
 * HTTP Interceptor that automatically manages busy state for HTTP requests
 */
export const busyInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const busyService = inject(BusyService);

  // Skip busy state for certain requests (like config files, assets, etc.)
  const skipBusyUrls = [
    '/assets/',
    '.json',
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.ico'
  ];

  const shouldSkipBusy = skipBusyUrls.some(url => req.url.includes(url));

  if (shouldSkipBusy) {
    return next(req);
  }

  // Set busy state for this request
  busyService.setBusy();

  return next(req).pipe(
    finalize(() => {
      // Always set idle when request completes (success or error)
      busyService.setIdle();
    })
  );
};
