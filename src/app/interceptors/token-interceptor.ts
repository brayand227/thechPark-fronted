import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  
  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Cambiar localStorage a sessionStorage
    const token = sessionStorage.getItem('techpark_token');
    
    let authReq = req;
    if (token && !req.url.includes('/auth/')) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.toastr.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'Sesión expirada');
          sessionStorage.removeItem('techpark_token');
          sessionStorage.removeItem('techpark_usuario');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}