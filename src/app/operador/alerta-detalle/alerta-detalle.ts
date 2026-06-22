import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-alerta-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="modal-overlay" (click)="cerrar()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>⚠️ Alerta de Mantenimiento</h3>
          <button class="close-btn" (click)="cerrar()">✕</button>
        </div>
        <div class="modal-body">
          <div class="alerta-info">
            <p><strong>Atracción:</strong> {{ alerta.atraccionNombre }}</p>
            <p><strong>Visitantes:</strong> {{ alerta.visitantesAcumulados }}/500</p>
            <p><strong>Prioridad:</strong> 
              <span [class]="alerta.prioridad === 'ALTA' ? 'text-danger' : 'text-warning'">
                {{ alerta.prioridad }}
              </span>
            </p>
            <p><strong>Descripción:</strong> {{ alerta.descripcion }}</p>
            <p><strong>Fecha:</strong> {{ alerta.fechaGeneracion | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>
          <div class="modal-actions">
            <button class="btn-cancelar" (click)="cerrar()">Cerrar</button>
            <a routerLink="/operador/mantenimiento" class="btn-atender" (click)="cerrar()">
              Ir a Mantenimiento
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-container {
      background: white;
      border-radius: 20px;
      width: 90%;
      max-width: 450px;
      overflow: hidden;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #dc3545;
      color: white;
    }
    .modal-body { padding: 1.5rem; }
    .alerta-info p { margin: 0.5rem 0; }
    .text-danger { color: #dc3545; font-weight: bold; }
    .text-warning { color: #ffc107; font-weight: bold; }
    .modal-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .btn-cancelar, .btn-atender {
      flex: 1;
      padding: 0.5rem;
      border-radius: 10px;
      text-align: center;
      text-decoration: none;
    }
    .btn-cancelar {
      background: #e9ecef;
      color: #333;
      border: none;
      cursor: pointer;
    }
    .btn-atender {
      background: #dc3545;
      color: white;
    }
    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
    }
  `]
})
export class AlertaDetalleComponent {
  @Input() alerta: any;
  @Output() close = new EventEmitter<void>();

  cerrar() {
    this.close.emit();
  }
}