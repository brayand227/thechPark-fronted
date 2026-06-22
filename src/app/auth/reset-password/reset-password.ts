import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  loading = false;
  showPassword = false;
  success = false;
  errorMensaje = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.errorMensaje = 'Token inválido. Solicita un nuevo enlace de recuperación.';
        this.toastr.error(this.errorMensaje, 'Error');
        setTimeout(() => {
          this.router.navigate(['/forgot-password']);
        }, 3000);
      }
    });
  }

  onSubmit() {
    this.errorMensaje = '';
    
    if (!this.newPassword) {
      this.errorMensaje = 'Por favor ingresa una nueva contraseña';
      this.toastr.warning(this.errorMensaje, 'Campo requerido');
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMensaje = 'La contraseña debe tener al menos 6 caracteres';
      this.toastr.warning(this.errorMensaje, 'Contraseña débil');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMensaje = 'Las contraseñas no coinciden';
      this.toastr.warning(this.errorMensaje, 'Error de verificación');
      return;
    }

    this.loading = true;

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        
        this.toastr.success(
          'Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
          '✅ Contraseña actualizada',
          { timeOut: 5000 }
        );
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        
        let mensaje = 'Error al restablecer la contraseña.';
        
        if (error.error?.message) {
          mensaje = error.error.message;
        } else if (error.status === 400) {
          mensaje = 'Token inválido o expirado. Solicita un nuevo enlace.';
        } else if (error.status === 404) {
          mensaje = 'Token no encontrado. Solicita un nuevo enlace de recuperación.';
        }
        
        this.errorMensaje = mensaje;
        this.toastr.error(mensaje, '❌ Error');
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}