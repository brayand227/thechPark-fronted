import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.8s ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  rememberMe = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  onSubmit() {
    console.log('1. onSubmit iniciado');
    
    if (!this.email) {
      this.toastr.warning('Por favor ingresa tu correo electrónico', 'Campo requerido');
      return;
    }

    if (!this.password) {
      this.toastr.warning('Por favor ingresa tu contraseña', 'Campo requerido');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.toastr.warning('Ingresa un correo electrónico válido', 'Error de formato');
      return;
    }
    
    console.log('2. Enviando petición al servidor');
    
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('3. Login exitoso', response);
      },
      error: (error) => {
        console.log('4. Error capturado:', error);
        console.log('4a. error.status:', error.status);
        console.log('4b. error.error:', error.error);
        console.log('4c. error.message:', error.message);
        
        let mensajeError = 'Error al iniciar sesión';
        
        if (error.error?.message) {
          mensajeError = error.error.message;
          console.log('5. Mensaje desde error.error.message:', mensajeError);
        } else if (error.status === 401) {
          mensajeError = '❌ Correo electrónico o contraseña incorrectos';
          console.log('5. Mensaje por status 401:', mensajeError);
        } else if (error.status === 0) {
          mensajeError = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en el puerto 8080';
          console.log('5. Mensaje por conexión:', mensajeError);
        }
        
        console.log('6. Mostrando toast con mensaje:', mensajeError);
        this.toastr.error(mensajeError, 'Error de autenticación');
        console.log('7. Toast mostrado');
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}