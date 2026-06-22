import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VisitanteService } from '../../services/visitante.service';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './mantenimiento.html',
  styleUrls: ['./mantenimiento.css']
})
export class MantenimientoComponent implements OnInit {
  usuario: any = null;
  alertas: any[] = [];
  historial: any[] = [];
  atracciones: any[] = [];
  atraccionSeleccionada: number = 0;
  comentario: string = '';
  loading = false;
  registrando = false;
  mostrandoHistorial = false;

  constructor(
    private authService: AuthService,
    private visitanteService: VisitanteService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    console.log('🔧 Mantenimiento - Usuario:', this.usuario);
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargarAtracciones();
    this.cargarAlertas();
    this.cargarHistorial();
  }

  cargarAtracciones() {
    this.visitanteService.getAtracciones().subscribe({
      next: (response) => {
        if (response.success) {
          this.atracciones = response.data;
          console.log('✅ Atracciones cargadas:', this.atracciones.length);
          console.log('IDs:', this.atracciones.map(a => ({ id: a.id, nombre: a.nombre, estado: a.estado })));
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error cargando atracciones:', error);
      }
    });
  }

  cargarAlertas() {
    this.visitanteService.getAlertasMantenimiento().subscribe({
      next: (response) => {
        if (response.success) {
          this.alertas = response.data || [];
          console.log('✅ Alertas cargadas:', this.alertas.length);
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error cargando alertas:', error);
      }
    });
  }

  cargarHistorial() {
    this.visitanteService.getHistorialMantenimiento().subscribe({
      next: (response) => {
        if (response.success) {
          this.historial = response.data || [];
          console.log('✅ Historial cargado:', this.historial.length);
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error cargando historial:', error);
      }
    });
  }

  seleccionarAtraccion(atraccionId: number) {
    console.log('📌 Seleccionando atracción ID:', atraccionId);
    
    // Verificar que el ID existe en la lista
    const existe = this.atracciones.some(a => a.id === atraccionId);
    
    if (!existe) {
      console.error('❌ ID no encontrado. IDs disponibles:', this.atracciones.map(a => a.id));
      this.toastr.error(`Atracción ID ${atraccionId} no encontrada`, 'Error');
      return;
    }
    
    this.atraccionSeleccionada = atraccionId;
    const atraccion = this.atracciones.find(a => a.id === atraccionId);
    this.toastr.info(`Seleccionada: ${atraccion?.nombre}`, 'Atracción');
    this.cdr.detectChanges();
  }

  registrarRevision() {
    if (!this.atraccionSeleccionada || this.atraccionSeleccionada === 0) {
      this.toastr.warning('Selecciona una atracción', 'Campo requerido');
      return;
    }

    const atraccion = this.atracciones.find(a => a.id === this.atraccionSeleccionada);
    if (!atraccion) {
      this.toastr.error('Atracción no encontrada', 'Error');
      return;
    }

    this.registrando = true;
    this.cdr.detectChanges();

    const revision = {
      atraccionId: this.atraccionSeleccionada,
      operadorId: this.usuario.id,
      comentario: this.comentario || 'Mantenimiento realizado',
      mantenimientoExitoso: true
    };

    console.log('📝 Registrando revisión:', revision);

    this.visitanteService.registrarRevision(revision).subscribe({
      next: (response) => {
        console.log('✅ Respuesta:', response);
        if (response.success) {
          this.toastr.success(`Revisión registrada para ${atraccion.nombre}`, '✅ Mantenimiento');
          this.atraccionSeleccionada = 0;
          this.comentario = '';
          this.cargarDatos();
        } else {
          this.toastr.warning(response.message || 'No se pudo registrar', '⚠️ Atención');
        }
        this.registrando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.registrando = false;
        this.cdr.detectChanges();
        this.toastr.error(error.error?.message || 'Error al registrar', '❌ Error');
      }
    });
  }

  reactivarAtraccion(atraccionId: number, nombreAtraccion: string) {
    if (!confirm(`¿Reactivar ${nombreAtraccion}?`)) return;

    this.visitanteService.reactivarAtraccion(atraccionId, this.usuario.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(`${nombreAtraccion} reactivada`, '✅ Éxito');
          this.cargarDatos();
        } else {
          this.toastr.warning(response.message || 'No se pudo reactivar', '⚠️');
        }
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Error al reactivar', '❌ Error');
      }
    });
  }

  limpiarFormulario() {
    this.atraccionSeleccionada = 0;
    this.comentario = '';
    this.toastr.info('Formulario limpiado', '🧹');
  }

  getEstadoAtraccion(): string {
    const atraccion = this.atracciones.find(a => a.id === this.atraccionSeleccionada);
    return atraccion?.estado || 'No seleccionada';
  }

  getTextoEstado(estado: string): string {
    switch(estado) {
      case 'ACTIVA': return '🟢 Activa';
      case 'MANTENIMIENTO': return '🟡 En Mantenimiento';
      case 'CERRADA': return '🔴 Cerrada';
      default: return estado || 'Desconocido';
    }
  }

  getColorEstado(estado: string): string {
    switch(estado) {
      case 'ACTIVA': return '#28a745';
      case 'MANTENIMIENTO': return '#ffc107';
      case 'CERRADA': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getVisitantesAtraccion(): number {
    const atraccion = this.atracciones.find(a => a.id === this.atraccionSeleccionada);
    return atraccion?.contadorVisitantes || 0;
  }

  getPorcentajeVisitantes(): number {
    return (this.getVisitantesAtraccion() / 500) * 100;
  }
  getNombreAtraccionSeleccionada(): string {
  const atraccion = this.atracciones.find(a => a.id === this.atraccionSeleccionada);
  return atraccion?.nombre || '';
}

  onAtraccionChange() {
    const atraccion = this.atracciones.find(a => a.id === this.atraccionSeleccionada);
    if (atraccion) {
      console.log('Atracción cambiada a:', atraccion.nombre);
    }
    this.cdr.detectChanges();
  }

  toggleHistorial() {
    this.mostrandoHistorial = !this.mostrandoHistorial;
    if (this.mostrandoHistorial) {
      this.cargarHistorial();
    }
  }

  getTextoPrioridad(prioridad: string): string {
    switch(prioridad) {
      case 'ALTA': return '🚨 ALTA';
      case 'MEDIA': return '⚠️ MEDIA';
      case 'BAJA': return '📋 BAJA';
      default: return prioridad || 'NORMAL';
    }
  }

  ponerEnMantenimiento() {
  if (!this.atraccionSeleccionada || this.atraccionSeleccionada === 0) {
    this.toastr.warning('Selecciona una atracción', 'Campo requerido');
    return;
  }

  const atraccion = this.atracciones.find(a => a.id === this.atraccionSeleccionada);
  if (!atraccion) return;

  const motivo = prompt('Motivo del mantenimiento:', 'Mantenimiento programado');
  if (motivo === null) return;

  this.visitanteService.ponerEnMantenimiento(this.atraccionSeleccionada, this.usuario.id, motivo).subscribe({
    next: (response) => {
      if (response.success) {
        this.toastr.success(`${atraccion.nombre} puesta en mantenimiento`, '🔧 Mantenimiento');
        this.cargarDatos();
        this.atraccionSeleccionada = 0;
      } else {
        this.toastr.warning(response.message || 'No se pudo poner en mantenimiento', '⚠️');
      }
    },
    error: (error) => {
      this.toastr.error(error.error?.message || 'Error al poner en mantenimiento', '❌ Error');
    }
  });
}


}