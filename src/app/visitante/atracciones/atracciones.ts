import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VisitanteService, Atraccion } from '../../services/visitante.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-atracciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './atracciones.html',
  styleUrls: ['./atracciones.css']
})
export class AtraccionesVisitante implements OnInit {
  atracciones: Atraccion[] = [];
  atraccionesFiltradas: Atraccion[] = [];
  filtroTipo: string = 'TODOS';
  loading = true;
  usuario: any = null;

  tipos = ['TODOS', 'MECANICA', 'ACUATICA', 'INFANTIL', 'SHOW'];

  constructor(
    private visitanteService: VisitanteService,
    private authService: AuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    this.cargarAtracciones();
  }

  cargarAtracciones() {
    this.loading = true;
    console.log('Cargando atracciones...');
    
    this.visitanteService.getAtracciones().subscribe({
      next: (response) => {
        console.log('Respuesta recibida:', response);
        if (response.success) {
          this.atracciones = response.data;
          this.aplicarFiltro();
          console.log('Atracciones cargadas:', this.atracciones.length);
          
          // Mostrar notificación si hay atracciones en mantenimiento
          const enMantenimiento = this.atracciones.filter(a => a.estado === 'MANTENIMIENTO').length;
          if (enMantenimiento > 0) {
            this.toastr.info(`${enMantenimiento} atracción(es) están en mantenimiento`, '🔧 Información');
          }
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando atracciones:', error);
        this.toastr.error('Error al cargar las atracciones', 'Error');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltro() {
    if (this.filtroTipo === 'TODOS') {
      this.atraccionesFiltradas = [...this.atracciones];
    } else {
      this.atraccionesFiltradas = this.atracciones.filter(a => a.tipo === this.filtroTipo);
    }
    console.log('Filtro aplicado:', this.filtroTipo, 'Resultados:', this.atraccionesFiltradas.length);
    this.cdr.detectChanges();
  }

  cambiarFiltro(tipo: string) {
    this.filtroTipo = tipo;
    this.aplicarFiltro();
  }

  unirseACola(atraccionId: number) {
    if (!this.usuario) return;
    
    const atraccion = this.atracciones.find(a => a.id === atraccionId);
    
    // Verificar si la atracción está disponible
    if (atraccion?.estado !== 'ACTIVA') {
      if (atraccion?.estado === 'MANTENIMIENTO') {
        this.toastr.warning(`La atracción ${atraccion.nombre} está en mantenimiento`, '🔧 No disponible');
      } else {
        this.toastr.warning(`La atracción ${atraccion?.nombre} no está disponible en este momento`, '⚠️ No disponible');
      }
      return;
    }
    
    this.visitanteService.unirseACola(this.usuario.id, atraccionId).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(response.data.mensaje, '✅ Unido a la cola');
          // Recargar atracciones para actualizar contadores
          this.cargarAtracciones();
        }
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Error al unirse a la cola', '❌ Error');
      }
    });
  }

  getIconoPorTipo(tipo: string): string {
    const icons: { [key: string]: string } = {
      'MECANICA': '🎢',
      'ACUATICA': '💧',
      'INFANTIL': '🧸',
      'SHOW': '🎭'
    };
    return icons[tipo] || '🎢';
  }

  getColorPorEstado(estado: string): string {
    switch(estado) {
      case 'ACTIVA': return '#28a745';
      case 'MANTENIMIENTO': return '#ffc107';
      case 'CERRADA': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getTextoEstado(estado: string): string {
    switch(estado) {
      case 'ACTIVA': return '🟢 Disponible';
      case 'MANTENIMIENTO': return '🟡 En mantenimiento';
      case 'CERRADA': return '🔴 Cerrada';
      default: return '⚪ Desconocido';
    }
  }

  puedeUnirse(estado: string): boolean {
    return estado === 'ACTIVA';
  }
}