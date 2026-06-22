import { Component, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
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
export class Registro {
  // Datos del formulario
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  documento = '';
  edad: number | null = null;
  estatura: number | null = null;
  tipoTicket = 'GENERAL';
  
  // Estados
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  aceptaTerminos = false;
  registroExitoso = false;
  errorBackend = '';

  // Opciones de tickets
  tiposTicket = [
    { value: 'GENERAL', label: 'General', price: '$45', icon: '🎫' },
    { value: 'FAMILIAR', label: 'Familiar', price: '$120', icon: '👨‍👩‍👧‍👦' },
    { value: 'FAST_PASS', label: 'Fast-Pass', price: '$80', icon: '⚡' }
  ];

  // Errores de validación
  errors = {
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    documento: '',
    edad: '',
    estatura: '',
    terminos: ''
  };

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef  // Agregar ChangeDetectorRef
  ) {}

  validarFormulario(): boolean {
    let esValido = true;
    
    this.errors = {
      nombre: '', email: '', password: '', confirmPassword: '',
      documento: '', edad: '', estatura: '', terminos: ''
    };
    this.errorBackend = '';

    if (!this.nombre || this.nombre.trim().length < 3) {
      this.errors.nombre = 'El nombre debe tener al menos 3 caracteres';
      esValido = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email || !emailRegex.test(this.email)) {
      this.errors.email = 'Ingresa un correo electrónico válido';
      esValido = false;
    }

    if (!this.documento || this.documento.length < 6) {
      this.errors.documento = 'El documento debe tener al menos 6 dígitos';
      esValido = false;
    }

    if (!this.edad || this.edad < 0 || this.edad > 120) {
      this.errors.edad = 'Ingresa una edad válida (1-120)';
      esValido = false;
    }

    if (!this.estatura || this.estatura < 0.5 || this.estatura > 2.5) {
      this.errors.estatura = 'Ingresa una estatura válida (0.5m - 2.5m)';
      esValido = false;
    }

    if (!this.password || this.password.length < 6) {
      this.errors.password = 'La contraseña debe tener al menos 6 caracteres';
      esValido = false;
    }

    if (this.password !== this.confirmPassword) {
      this.errors.confirmPassword = 'Las contraseñas no coinciden';
      esValido = false;
    }

    if (!this.aceptaTerminos) {
      this.errors.terminos = 'Debes aceptar los términos y condiciones';
      esValido = false;
    }

    return esValido;
  }

  onSubmit() {
    if (!this.validarFormulario()) {
      const erroresLista = Object.values(this.errors).filter(e => e);
      if (erroresLista.length > 0) {
        this.toastr.warning(erroresLista[0], 'Por favor corrige');
      }
      return;
    }

    const registroData = {
      nombre: this.nombre.trim(),
      documento: this.documento,
      email: this.email.toLowerCase().trim(),
      password: this.password,
      edad: this.edad,
      estatura: this.estatura,
      tipoTicket: this.tipoTicket
    };

    this.loading = true;
    this.registroExitoso = false;
    this.errorBackend = '';

    this.authService.registro(registroData).subscribe({
      next: (response) => {
        this.loading = false;
        this.registroExitoso = true;
        this.cdr.detectChanges(); // Forzar detección de cambios
        
        this.toastr.success(
          `¡Bienvenido ${this.nombre}! Tu cuenta ha sido creada exitosamente.`,
          '🎉 Registro Exitoso',
          { timeOut: 5000 }
        );
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.loading = false;
        
        let mensajeError = 'Error al registrarse. Intenta nuevamente.';
        
        if (error.error?.message) {
          mensajeError = error.error.message;
        } else if (error.message) {
          mensajeError = error.message;
        } else if (typeof error.error === 'string') {
          mensajeError = error.error;
        }
        
        this.errorBackend = mensajeError;
        this.cdr.detectChanges(); // Forzar detección de cambios
        
        if (mensajeError.toLowerCase().includes('email')) {
          this.errors.email = mensajeError;
        } else if (mensajeError.toLowerCase().includes('documento')) {
          this.errors.documento = mensajeError;
        }
        
        this.toastr.error(mensajeError, '❌ Error al registrar');
        console.error('Error en registro:', error);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  limpiarError(campo: string) {
    this.errors[campo as keyof typeof this.errors] = '';
    this.errorBackend = '';
  }
}