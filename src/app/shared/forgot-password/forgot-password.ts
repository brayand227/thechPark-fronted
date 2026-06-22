import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {
  @Output() close = new EventEmitter<void>();
  
  email = '';
  loading = false;
  emailSent = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  onSubmit() {
    if (!this.email) {
      this.toastr.warning('Por favor ingresa tu correo electrónico');
      return;
    }

    this.loading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        this.emailSent = true;
        this.toastr.success('Se ha enviado un correo con las instrucciones', 'Revisa tu bandeja de entrada');
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error(error.error?.message || 'Error al procesar la solicitud', 'Error');
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}