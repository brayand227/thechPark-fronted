import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VisitanteService } from '../../services/visitante.service';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './panel.html',
  styleUrls: ['./panel.css']
})
export class PanelComponent implements OnInit, OnDestroy {
  usuario: any = null;
  loading = true;
  alertas: any[] = [];
  atraccionesRiesgo: any[] = [];
  atraccionesConColas: any[] = [];
  alertaSeleccionada: any = null;
  ultimoConteoAlertas = 0;
  private intervalId: any;

  stats = [
    { icon: '🎟️', value: '0', label: 'En Cola Total', color: '#ff6b35' },
    { icon: '🎢', value: '0', label: 'Atracciones con Cola', color: '#667eea' },
    { icon: '🔧', value: '0', label: 'Mantenimiento', color: '#ffc107' },
    { icon: '⚠️', value: '0', label: 'Alertas', color: '#dc3545' }
  ];

  constructor(
    private authService: AuthService,
    private visitanteService: VisitanteService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    console.log('👨‍🔧 Operador:', this.usuario);
    this.cargarDatos();
    
    // Actualizar cada 15 segundos
    this.intervalId = setInterval(() => {
      this.cargarDatos();
    }, 15000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

cargarDatos() {
    this.loading = true;
    
    // Cargar atracciones con colas
    this.visitanteService.getAtraccionesConColas().subscribe({
        next: (response) => {
            if (response.success && response.data) {
                this.atraccionesConColas = response.data || [];
                const totalEnCola = this.atraccionesConColas.reduce((sum, a) => sum + (a.colasPendientes || 0), 0);
                this.stats[0].value = totalEnCola.toString();
                this.stats[1].value = this.atraccionesConColas.length.toString();
            }
            this.cdr.detectChanges();
        },
        error: (error) => {
            console.error('Error cargando atracciones con colas:', error);
            this.atraccionesConColas = [];
            this.cdr.detectChanges();
        }
    });

    // Cargar alertas de mantenimiento
    this.visitanteService.getAlertasMantenimiento().subscribe({
        next: (response) => {
            if (response.success && response.data) {
                this.alertas = response.data || [];
                this.stats[3].value = this.alertas.length.toString();
            }
            this.cdr.detectChanges();
        },
        error: (error) => {
            console.error('Error cargando alertas:', error);
            this.alertas = [];
            this.cdr.detectChanges();
        }
    });

    // Cargar atracciones en riesgo (con manejo de error)
    this.visitanteService.getAtraccionesEnRiesgo().subscribe({
        next: (response) => {
            if (response.success && response.data) {
                this.atraccionesRiesgo = response.data || [];
                console.log('Atracciones en riesgo:', this.atraccionesRiesgo.length);
            }
            this.cdr.detectChanges();
        },
        error: (error) => {
            console.error('Error cargando atracciones en riesgo:', error);
            this.atraccionesRiesgo = [];
            this.cdr.detectChanges();
        }
    });

    this.loading = false;
}

  irAAtencion(atraccionId: number) {
    // Guardar la atracción seleccionada en sessionStorage
    sessionStorage.setItem('atraccionSeleccionada', atraccionId.toString());
    window.location.href = `/operador/atencion`;
  }

  verDetalleAlerta(alerta: any) {
    this.alertaSeleccionada = alerta;
  }

  cerrarDetalleAlerta() {
    this.alertaSeleccionada = null;
  }

  obtenerIconoPorTipo(tipo: string): string {
    const icons: { [key: string]: string } = {
      'MECANICA': '🎢',
      'ACUATICA': '💧',
      'INFANTIL': '🧸',
      'SHOW': '🎭'
    };
    return icons[tipo] || '🎢';
  }

  reproducirSonidoAlerta() {
    // Opcional: reproducir un sonido (crea la carpeta assets/sounds)
    try {
      const audio = new Audio('/assets/sounds/alert.mp3');
      audio.play().catch(e => console.log('Error reproduciendo sonido:', e));
    } catch (e) {
      console.log('Sonido no disponible');
    }
  }

  getColorPorEstado(estado: string): string {
    switch(estado) {
      case 'ACTIVA': return '#28a745';
      case 'MANTENIMIENTO': return '#ffc107';
      case 'CERRADA': return '#dc3545';
      default: return '#6c757d';
    }
  }

  actualizarDatos() {
    this.cargarDatos();
    this.toastr.info('Datos actualizados', '🔄 Actualización');
  }
}