import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  selector: 'app-recarga',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './recarga.html',
  styleUrls: ['./recarga.css']
})
export class RecargaVisitante implements OnInit {
  usuario: any = null;
  saldoActual: number = 0;
  monto: number = 0;
  metodoPago: string = 'TARJETA';
  loading = false;
  recargaExitosa = false;

  montosSugeridos = [10, 20, 50, 100];

  constructor(
    private authService: AuthService,
    private visitanteService: VisitanteService,
    private saldoService: SaldoService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    console.log('Usuario en recarga:', this.usuario);
    this.cargarSaldo();
    
    // Suscribirse a cambios de saldo desde otros componentes
    this.saldoService.saldo$.subscribe(nuevoSaldo => {
      console.log('Saldo actualizado desde servicio en recarga:', nuevoSaldo);
      this.saldoActual = nuevoSaldo;
      this.cdr.detectChanges();
    });
  }

  cargarSaldo() {
    if (!this.usuario) {
      console.log('No hay usuario en recarga');
      return;
    }
    
    console.log('Cargando saldo en recarga para usuario:', this.usuario.id);
    
    this.visitanteService.getSaldo(this.usuario.id).subscribe({
      next: (response) => {
        console.log('Respuesta saldo recarga:', response);
        if (response.success) {
          this.saldoActual = response.data;
          console.log('Saldo actual cargado:', this.saldoActual);
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error cargando saldo en recarga:', error);
        this.toastr.error('Error al cargar el saldo', 'Error');
      }
    });
  }

  seleccionarMonto(monto: number) {
    this.monto = monto;
    console.log('Monto seleccionado:', monto);
    this.cdr.detectChanges();
  }

  actualizarMonto(event: any) {
    this.monto = event.target.value;
    this.cdr.detectChanges();
  }

  recargar() {
    if (this.monto <= 0) {
      this.toastr.warning('Por favor selecciona o ingresa un monto válido', 'Monto inválido');
      return;
    }

    this.loading = true;
    this.recargaExitosa = false;
    this.cdr.detectChanges();
    
    console.log('Recargando:', { usuarioId: this.usuario.id, monto: this.monto });
    
    this.visitanteService.recargarSaldo(this.usuario.id, this.monto).subscribe({
      next: (response) => {
        console.log('Respuesta recarga completa:', response);
        
        if (response.success) {
          // El saldo está en response.data.saldoVirtual
          const nuevoSaldo = response.data.saldoVirtual;
          this.saldoActual = nuevoSaldo;
          
          console.log('Nuevo saldo después de recarga:', this.saldoActual);
          
          // Notificar cambio de saldo a todos los componentes
          this.saldoService.actualizarSaldo(this.saldoActual);
          
          this.recargaExitosa = true;
          this.toastr.success(`Has recargado $${this.monto} exitosamente. Nuevo saldo: $${this.saldoActual.toFixed(2)}`, '✅ Recarga exitosa');
          this.monto = 0;
          
          this.cdr.detectChanges();
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error en recarga:', error);
        
        if (error.status === 403) {
          this.toastr.error('No autorizado. Por favor inicia sesión nuevamente.', 'Error');
        } else {
          this.toastr.error(error.error?.message || 'Error al recargar saldo', '❌ Error');
        }
      }
    });
  }
}