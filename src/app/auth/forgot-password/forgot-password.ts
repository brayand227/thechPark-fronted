import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  emailSent = false;
  errorMensaje = '';

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMensaje = '';
    
    if (!this.email) {
      this.errorMensaje = 'Por favor ingresa tu correo electrónico';
      this.toastr.warning(this.errorMensaje, 'Campo requerido');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMensaje = 'Ingresa un correo electrónico válido';
      this.toastr.warning(this.errorMensaje, 'Error de formato');
      return;
    }

    this.loading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        this.emailSent = true;
        
        // Mensaje de éxito
        this.toastr.success(
          '¡Correo enviado! Revisa tu bandeja de entrada. Si no lo encuentras, revisa la carpeta de spam.',
          '📧 Enlace de recuperación enviado',
          { timeOut: 8000 }
        );
        
        // Redirigir al login después de 5 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
      },
      error: (error) => {
        this.loading = false;
        
        let mensaje = 'Error al enviar el correo. Intenta nuevamente.';
        
        if (error.error?.message) {
          mensaje = error.error.message;
        } else if (error.status === 400) {
          mensaje = 'Correo electrónico inválido. Verifica el formato.';
        } else if (error.status === 500) {
          mensaje = 'Error en el servidor. Intenta más tarde.';
        }
        
        this.errorMensaje = mensaje;
        this.toastr.error(mensaje, '❌ Error');
      }
    });
  }
}