import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VisitanteService, Atraccion } from '../../services/visitante.service';
import { SaldoService } from '../../services/saldo.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-dashboard-visitante',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardVisitante implements OnInit, OnDestroy {

  usuario: any = null;
  saldo: number = 0;
  atraccionesDestacadas: Atraccion[] = [];
  misColasActivas: any[] = [];
  loading = true;
  private intervalId: any;

  stats = [
    {
      icon: '🎢',
      value: '0',
      label: 'Atracciones Disponibles',
      color: '#ff6b35'
    },
    {
      icon: '⏱️',
      value: '0 min',
      label: 'Tiempo Promedio Espera',
      color: '#28a745'
    },
    {
      icon: '💰',
      value: '$0',
      label: 'Mi Saldo',
      color: '#007bff'
    },
    {
      icon: '🎫',
      value: '0',
      label: 'Mis Colas',
      color: '#6f42c1'
    }
  ];

  constructor(
    private authService: AuthService,
    private visitanteService: VisitanteService,
    private saldoService: SaldoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
    console.log('👤 Usuario en dashboard:', this.usuario);
    
    // Suscribirse a los cambios de saldo
    this.saldoService.saldo$.subscribe(nuevoSaldo => {
      console.log('💰 Saldo recibido del servicio:', nuevoSaldo);
      this.saldo = nuevoSaldo;
      this.stats[2].value = `$${this.saldo.toFixed(2)}`;
      this.cdr.detectChanges();
    });
    
    // Cargar todos los datos al iniciar
    this.cargarTodosLosDatos();
    
    // Actualizar cada 15 segundos
    this.intervalId = setInterval(() => {
      this.actualizarDatosEnTiempoReal();
    }, 15000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  cargarTodosLosDatos() {
    this.cargarAtracciones();
    this.cargarSaldo();
    this.actualizarMisColas();
    this.cargarTiempoPromedio();
  }

  actualizarMisColas() {
    if (!this.usuario) return;
    
    this.visitanteService.contarMisColasActivas(this.usuario.id).subscribe({
      next: (response) => {
        if (response.success) {
          const cantidad = response.data;
          this.stats[3].value = cantidad.toString();
          this.cdr.detectChanges();
          console.log('📊 Colas actualizadas:', cantidad);
        }
      },
      error: (error) => {
        console.error('Error actualizando colas:', error);
      }
    });
  }

  cargarAtracciones() {
    this.loading = true;

    this.visitanteService.getAtracciones().subscribe({
      next: (response) => {
        if (response.success) {
          const todas: Atraccion[] = response.data;

          this.atraccionesDestacadas = todas
            .filter((a: Atraccion) => a.estado === 'ACTIVA')
            .slice(0, 4);

          const activas = todas.filter((a: Atraccion) => a.estado === 'ACTIVA');
          this.stats[0].value = activas.length.toString();
          
          console.log('🎢 Atracciones activas:', activas.length);
          this.cdr.detectChanges();
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando atracciones:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarTiempoPromedio() {
    this.visitanteService.getTiempoPromedioConCola().subscribe({
      next: (response) => {
        if (response.success) {
          const promedio = response.data;
          if (promedio > 0) {
            this.stats[1].value = `${promedio} min`;
            console.log('⏱️ Tiempo promedio de atracciones con cola:', promedio);
          } else {
            this.stats[1].value = '0 min';
            console.log('⏱️ No hay colas activas');
          }
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error cargando tiempo promedio:', error);
        this.stats[1].value = '0 min';
        this.cdr.detectChanges();
      }
    });
  }

  actualizarDatosEnTiempoReal() {
    console.log('🔄 Actualizando datos en tiempo real...');
    this.actualizarMisColas();
    this.cargarSaldo();
    this.cargarTiempoPromedio();
  }

  cargarSaldo() {
    if (!this.usuario) {
      console.log('No hay usuario en dashboard');
      return;
    }
    
    console.log('💰 Cargando saldo para usuario:', this.usuario.id);
    
    this.visitanteService.getSaldo(this.usuario.id).subscribe({
      next: (response) => {
        console.log('Respuesta saldo dashboard:', response);
        if (response.success) {
          this.saldo = response.data;
          this.stats[2].value = `$${this.saldo.toFixed(2)}`;
          this.saldoService.actualizarSaldo(this.saldo);
          console.log('✅ Saldo actualizado en dashboard:', this.saldo);
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error cargando saldo en dashboard:', error);
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

  irARecarga(): void {
    window.location.href = '/visitante/recarga';
  }

  irAMisColas(): void {
    window.location.href = '/visitante/colas';
  }

  irAMapa(): void {
    window.location.href = '/visitante/mapa';
  }

  irAPerfil(): void {
    window.location.href = '/visitante/perfil';
  }

  irAVerAtracciones(): void {
    window.location.href = '/visitante/atracciones';
  }
}