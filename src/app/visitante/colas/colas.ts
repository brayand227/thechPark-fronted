import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VisitanteService } from '../../services/visitante.service';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-colas',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './colas.html',
  styleUrls: ['./colas.css']
})
export class ColasVisitante implements OnInit {
  usuario: any = null;
  misColas: any[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private visitanteService: VisitanteService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    console.log('=== INICIALIZANDO MIS COLAS ===');
    console.log('Usuario:', this.usuario);
    
    if (this.usuario && this.usuario.id) {
      console.log('Cargando colas para usuario ID:', this.usuario.id);
      this.cargarMisColas();
    } else {
      console.error('No hay usuario logueado');
      this.loading = false;
    }
  }

  cargarMisColas() {
    if (!this.usuario || !this.usuario.id) {
      console.log('No hay usuario o ID inválido');
      this.loading = false;
      return;
    }
    
    this.loading = true;
    console.log('🚀 Haciendo petición a getMisColas para ID:', this.usuario.id);
    
    this.visitanteService.getMisColas(this.usuario.id).subscribe({
      next: (response) => {
        console.log('✅ Respuesta recibida:', response);
        if (response.success) {
          this.misColas = response.data || [];
          console.log('📋 Colas cargadas:', this.misColas.length);
          console.log('Detalle:', this.misColas);
        } else {
          console.log('Respuesta no exitosa:', response.message);
          this.misColas = [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error en petición:', error);
        this.toastr.error('Error al cargar tus colas', 'Error');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

 cancelarCola(cola: any) {
  if (!this.usuario) return;
  
  this.visitanteService.cancelarCola(this.usuario.id, cola.atraccionId).subscribe({
    next: (response) => {
      if (response.success) {
        this.toastr.success(`Has cancelado tu cola en ${cola.atraccionNombre}`, '✅ Cola cancelada');
        this.cargarMisColas();
        this.actualizarContadorEnDashboard();
      }
    },
    error: (error) => {
      this.toastr.error(error.error?.message || 'Error al cancelar la cola', '❌ Error');
    }
  });
}

  obtenerColorPosicion(posicion: number): string {
    if (posicion <= 3) return '#28a745';
    if (posicion <= 10) return '#ffc107';
    return '#dc3545';
  }

  obtenerTextoEstado(estado: string): string {
    switch(estado) {
      case 'EN_COLA': return 'En espera';
      case 'ATENDIDO': return 'Atendido';
      case 'CANCELADO': return 'Cancelado';
      default: return estado;
    }
  }


  ngOnDestroy(): void {
  // Notificar al dashboard que debe actualizar el contador
  this.actualizarContadorEnDashboard();
    }

  actualizarContadorEnDashboard() {
  // Forzar actualización cuando se sale de la página
  if (this.usuario) {
     this.visitanteService.contarMisColasActivas(this.usuario.id).subscribe({
       next: (response) => {
         if (response.success) {
           console.log('Contador actualizado al salir de colas');
         }
       },
       error: () => {}
     });
   }
 }
}