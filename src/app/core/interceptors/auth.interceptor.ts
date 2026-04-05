import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const sessionService = inject(SessionService);
  const token = sessionService.accessToken()?.trim() ?? null;
  const tokenType = sessionService.tokenType()?.trim() || 'Bearer';

  if (!token) {
    // console.log('[authInterceptor] Request without token', request.method, request.url);
    return next(request);
  }

  const authorizationValue = `${tokenType} ${token}`;

  // console.log('[authInterceptor] Attaching Authorization header', {
  //   method: request.method,
  //   url: request.url,
  //   tokenType,
  //   hasToken: Boolean(token),
  // });

  return next(
    request.clone({
      setHeaders: {
        Authorization: authorizationValue,
      },
    })
  );
};
