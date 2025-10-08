import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const excludedUrls = [
      '/auth/register',
      '/auth/authenticate',
      '/auth/activate-account'
    ];

    // On vérifie si la requête est vers une URL qu'on veut exclure
    const isExcluded = excludedUrls.some(url => req.url.includes(url));

    // Si l'URL est exclue, on ne modifie pas la requête
    if (isExcluded) {
      return next.handle(req);
    }

    const token = localStorage.getItem('access_token');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}
