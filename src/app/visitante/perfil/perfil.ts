import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VisitanteService } from '../../services/visitante.service';
import { SaldoService } from '../../services/saldo.service';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilVisitante implements OnInit {
  usuario: any = null;
  editando = false;
  loading = false;

  // Datos editables
  perfilEdit = {
    nombre: '',
    email: '',
    documento: '',
    edad: 0,
    estatura: 0
  };

  // Cambio de contraseña
  passwordActual = '';
  passwordNueva = '';
  confirmPassword = '';
  cambiandoPassword = false;

  constructor(
    private authService: AuthService,
    private visitanteService: VisitanteService,
    private saldoService: SaldoService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    console.log('Usuario en perfil:', this.usuario);
    this.cargarDatosCompletos();
    
    // Suscribirse a cambios de saldo
    this.saldoService.saldo$.subscribe(nuevoSaldo => {
      if (this.usuario) {
        this.usuario.saldoVirtual = nuevoSaldo;
      }
    });
  }

  cargarDatosCompletos() {
    if (!this.usuario) return;
    
    // Cargar saldo
    this.visitanteService.getSaldo(this.usuario.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.usuario.saldoVirtual = response.data;
          console.log('Saldo cargado en perfil:', this.usuario.saldoVirtual);
        }
      },
      error: (error) => {
        console.error('Error cargando saldo:', error);
      }
    });
  }

  editarPerfil() {
    this.perfilEdit = {
      nombre: this.usuario?.nombre || '',
      email: this.usuario?.email || '',
      documento: this.usuario?.documento || '',
      edad: this.usuario?.edad || 0,
      estatura: this.usuario?.estatura || 0
    };
    this.editando = true;
  }

  cancelarEdicion() {
    this.editando = false;
  }

  guardarPerfil() {
    this.loading = true;
    // TODO: Conectar con endpoint de actualización de perfil
    setTimeout(() => {
      this.usuario.nombre = this.perfilEdit.nombre;
      this.usuario.email = this.perfilEdit.email;
      this.usuario.documento = this.perfilEdit.documento;
      this.usuario.edad = this.perfilEdit.edad;
      this.usuario.estatura = this.perfilEdit.estatura;
      
      // Actualizar localStorage
      localStorage.setItem('techpark_usuario', JSON.stringify(this.usuario));
      
      this.toastr.success('Perfil actualizado exitosamente', '✅ Éxito');
      this.editando = false;
      this.loading = false;
    }, 500);
  }

  cambiarPassword() {
    if (!this.passwordNueva || this.passwordNueva.length < 6) {
      this.toastr.warning('La contraseña debe tener al menos 6 caracteres', 'Contraseña débil');
      return;
    }

    if (this.passwordNueva !== this.confirmPassword) {
      this.toastr.warning('Las contraseñas no coinciden', 'Error');
      return;
    }

    this.cambiandoPassword = true;
    // TODO: Conectar con endpoint de cambio de contraseña
    setTimeout(() => {
      this.toastr.success('Contraseña actualizada exitosamente', '✅ Éxito');
      this.passwordActual = '';
      this.passwordNueva = '';
      this.confirmPassword = '';
      this.cambiandoPassword = false;
    }, 500);
  }
}