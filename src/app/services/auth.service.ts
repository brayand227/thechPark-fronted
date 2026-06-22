import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  token?: string;
  documento?: string;
  edad?: number;
  estatura?: number;
  saldoVirtual?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'techpark_token';
  private usuarioKey = 'techpark_usuario';

  // Modal recuperación contraseña
  public showForgotPasswordModal = false;

  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.cargarUsuarioStorage();
  }

  // =========================
  // LOGIN
  // =========================
  login(email: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      { email, password }
    ).pipe(
      tap({
        next: (response: any) => {
          if (response.success && response.data) {
            this.guardarSesion(response.data);
            this.toastr.success(
              `¡Bienvenido ${response.data.nombre}!`,
              '✅ Login exitoso'
            );
            this.redirigirPorRol(response.data.rol);
          }
        },
        error: (error) => {
          console.error('Error en login service:', error);
        }
      })
    );
  }

  // =========================
  // REGISTRO
  // =========================
  registro(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/registro`,
      data
    );
  }

  // =========================
  // LOGOUT
  // =========================
  logout(): void {
    // Usar sessionStorage en lugar de localStorage
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.usuarioKey);
    this.usuarioSubject.next(null);
    this.toastr.info(
      'Sesión cerrada correctamente',
      '👋 Hasta luego'
    );
    this.router.navigate(['/login']);
  }

  // =========================
  // GUARDAR SESIÓN (usando sessionStorage)
  // =========================
  private guardarSesion(data: any): void {
    // Usar sessionStorage para que cada pestaña tenga su propia sesión
    sessionStorage.setItem(this.tokenKey, data.token);
    const usuario: Usuario = {
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      documento: data.documento || '',
      edad: data.edad || 0,
      estatura: data.estatura || 0,
      saldoVirtual: data.saldoVirtual || 0
    };
    sessionStorage.setItem(this.usuarioKey, JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
    console.log('✅ Sesión guardada en sessionStorage para usuario:', usuario.email);
  }

  // =========================
  // CARGAR STORAGE (desde sessionStorage)
  // =========================
  private cargarUsuarioStorage(): void {
    const usuarioStr = sessionStorage.getItem(this.usuarioKey);
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.usuarioSubject.next(usuario);
      console.log('📂 Usuario cargado desde sessionStorage:', usuario.email);
    }
  }

  // =========================
  // OBTENER TOKEN (desde sessionStorage)
  // =========================
  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  // =========================
  // OBTENER USUARIO
  // =========================
  getUsuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  // =========================
  // VALIDAR AUTENTICACIÓN
  // =========================
  isAuthenticated(): boolean {
    return this.getToken() !== null && this.getUsuario() !== null;
  }

  // =========================
  // VALIDAR ROL
  // =========================
  hasRole(rol: string): boolean {
    const usuario = this.getUsuario();
    return usuario !== null && usuario.rol === rol;
  }

  // =========================
  // REDIRECCIÓN POR ROL
  // =========================
  redirigirPorRol(rol: string): void {
    switch (rol) {
      case 'ADMINISTRADOR':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'OPERADOR':
        this.router.navigate(['/operador/panel']);
        break;
      case 'VISITANTE':
        this.router.navigate(['/visitante/dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  // =========================
  // RECUPERAR CONTRASEÑA
  // =========================

  openForgotPasswordModal(): void {
    this.showForgotPasswordModal = true;
  }

  closeForgotPasswordModal(): void {
    this.showForgotPasswordModal = false;
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/forgot-password`,
      { email }
    ).pipe(
      tap({
        next: (response: any) => {
          if (response.success) {
            this.toastr.success(
              response.message || 'Se ha enviado un enlace de recuperación a tu correo',
              '📧 Correo enviado'
            );
          }
        },
        error: (error) => {
          this.toastr.info(
            'Si el correo existe en nuestro sistema, recibirás un enlace de recuperación',
            '📧 Revisa tu bandeja de entrada'
          );
        }
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/reset-password`,
      { token, newPassword }
    ).pipe(
      tap({
        next: (response: any) => {
          if (response.success) {
            this.toastr.success(
              response.message || 'Contraseña actualizada exitosamente',
              '✅ Contraseña actualizada'
            );
          }
        },
        error: (error) => {
          let mensaje = 'Error al restablecer la contraseña';
          if (error.error?.message) {
            mensaje = error.error.message;
          } else if (error.status === 400) {
            mensaje = 'Token inválido o expirado. Solicita un nuevo enlace.';
          }
          this.toastr.error(mensaje, '❌ Error');
        }
      })
    );
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate-reset-token?token=${token}`);
  }
}