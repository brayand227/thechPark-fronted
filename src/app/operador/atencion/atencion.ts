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
  selector: 'app-atencion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './atencion.html',
  styleUrls: ['./atencion.css']
})
export class AtencionComponent implements OnInit {
  usuario: any = null;
  atracciones: any[] = [];
  atraccionSeleccionada: number = 0;
  siguienteVisitante: any = null;
  loading = false;
  atendiendo = false;
  cargandoAtracciones = true;

  constructor(
    private authService: AuthService,
    private visitanteService: VisitanteService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
  this.usuario = this.authService.getUsuario();
  console.log('Operador:', this.usuario);
  
  // Verificar si hay una atracción preseleccionada
  const atraccionGuardada = sessionStorage.getItem('atraccionSeleccionada');
  if (atraccionGuardada) {
    this.atraccionSeleccionada = parseInt(atraccionGuardada);
    sessionStorage.removeItem('atraccionSeleccionada');
    // Opcional: cargar automáticamente el siguiente
    setTimeout(() => this.cargarSiguiente(), 500);
  }
  
  this.cargarAtracciones();
  this.cargarDatosIniciales();
}

  cargarDatosIniciales() {
    // Opcional: cargar datos iniciales si es necesario
  }

  cargarAtracciones() {
    this.cargandoAtracciones = true;
    console.log('Cargando atracciones para operador...');
    
    this.visitanteService.getAtracciones().subscribe({
      next: (response) => {
        console.log('Atracciones cargadas:', response);
        if (response.success) {
          this.atracciones = response.data;
          console.log('Total atracciones:', this.atracciones.length);
        }
        this.cargandoAtracciones = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando atracciones:', error);
        this.toastr.error('Error al cargar las atracciones', 'Error');
        this.cargandoAtracciones = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarSiguiente() {
    if (!this.atraccionSeleccionada) {
      this.toastr.warning('Selecciona una atracción', 'Campo requerido');
      return;
    }

    this.loading = true;
    this.siguienteVisitante = null;
    this.cdr.detectChanges();
    
    console.log('=== ATENCIÓN: BUSCANDO SIGUIENTE ===');
    console.log('Atracción ID:', this.atraccionSeleccionada);
    console.log('Operador ID:', this.usuario?.id);
    
    this.visitanteService.getSiguienteEnCola(this.atraccionSeleccionada, this.usuario?.id).subscribe({
      next: (response) => {
        console.log('RESPUESTA COMPLETA:', JSON.stringify(response, null, 2));
        
        // ⭐ CORRECCIÓN IMPORTANTE: La respuesta tiene success: true y data con los datos
        if (response && response.success === true && response.data) {
          // Los datos del visitante están en response.data
          const visitante = response.data;
          this.siguienteVisitante = {
            visitanteId: visitante.visitanteId,
            nombreVisitante: visitante.nombreVisitante,
            tipoTicket: visitante.tipoTicket,
            horaIngreso: visitante.horaIngreso
          };
          console.log('✅ VISITANTE ENCONTRADO:', this.siguienteVisitante);
          this.toastr.success(`Visitante: ${this.siguienteVisitante.nombreVisitante} (${this.siguienteVisitante.tipoTicket})`, '✅ Listo para atender');
        } else {
          console.log('⚠️ No hay visitantes en cola');
          this.siguienteVisitante = null;
          this.toastr.info(response?.message || 'No hay visitantes en cola', 'Cola vacía');
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ ERROR:', error);
        console.error('Status:', error.status);
        console.error('Mensaje:', error.error?.message);
        this.loading = false;
        this.cdr.detectChanges();
        
        if (error.status === 404 || error.status === 400) {
          this.toastr.info('No hay visitantes en cola para esta atracción', 'Cola vacía');
        } else {
          this.toastr.error(error.error?.message || 'Error al cargar el siguiente visitante', 'Error');
        }
      }
    });
  }

  atender() {
    if (!this.siguienteVisitante) return;

    this.atendiendo = true;
    this.cdr.detectChanges();
    
    // Simular atención (aquí se llamaría al endpoint para marcar como atendido)
    setTimeout(() => {
      this.atendiendo = false;
      this.toastr.success(`${this.siguienteVisitante.nombreVisitante} ha sido atendido correctamente`, '✅ Atención completada');
      this.siguienteVisitante = null;
      this.cdr.detectChanges();
      // Cargar el siguiente automáticamente
      this.cargarSiguiente();
    }, 1500);
  }
}