import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';


// =====================================================
// INTERFACES
// =====================================================

export interface Atraccion {
  id: number;
  nombre: string;
  tipo: string;
  capacidadMaxima: number;
  alturaMinima: number;
  edadMinima: number;
  costoAdicional: number;
  contadorVisitantes: number;
  tiempoEsperaEstimado: number;
  estado: string;
  motivoCierre?: string;
  zonaId: number;
  zonaNombre: string;
  posicionX: number;
  posicionY: number;
}

export interface ColaVirtual {
  id: number;
  visitanteId: number;
  atraccionId: number;
  atraccionNombre: string;
  posicion: number;
  tiempoEstimadoEspera: number;
  estado: string;
}

export interface RespuestaCola {
  posicion: number;
  tiempoEstimadoEspera: number;
  personasDelante: number;
  tienePrioridad: boolean;
  mensaje: string;
}

export interface RecargaRequest {
  usuarioId: number;
  monto: number;
  metodoPago?: string;
}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class VisitanteService {

  // ===================================================
  // API URL (CORREGIDO - sin doble /api)
  // ===================================================

  private apiUrl = environment.apiUrl;  // ← CORREGIDO: environment.apiUrl ya incluye /api

  constructor(private http: HttpClient) {}

  // ===================================================
  // ATRACCIONES
  // ===================================================

  getAtracciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/atracciones`);
  }

  getAtraccion(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/atracciones/${id}`);
  }

  // ===================================================
  // COLAS
  // ===================================================

  unirseACola(visitanteId: number, atraccionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/colas/unirse`, { visitanteId, atraccionId });
  }

  getEstadoCola(atraccionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/colas/estado/${atraccionId}`);
  }

  getMiPosicion(visitanteId: number, atraccionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/colas/posicion/${visitanteId}/${atraccionId}`);
  }

  cancelarCola(visitanteId: number, atraccionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/colas/cancelar/${visitanteId}/${atraccionId}`);
  }

  getMisColas(visitanteId: number): Observable<any> {
    console.log(`🔗 API: ${this.apiUrl}/colas/mis-colas/${visitanteId}`);
    return this.http.get(`${this.apiUrl}/colas/mis-colas/${visitanteId}`);
  }

  contarMisColasActivas(visitanteId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/colas/contar/${visitanteId}`);
  }

  // ===================================================
  // OPERADOR
  // ===================================================

  getSiguienteEnCola(atraccionId: number, operadorId: number): Observable<any> {
    console.log(`🔗 API Call: ${this.apiUrl}/colas/siguiente/${atraccionId}/${operadorId}`);
    return this.http.get(`${this.apiUrl}/colas/siguiente/${atraccionId}/${operadorId}`);
  }

  getAtraccionesConColas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/colas/atracciones-con-colas`);
  }

  // ===================================================
  // MANTENIMIENTO
  // ===================================================

  registrarRevision(revision: any): Observable<any> {
    console.log('📝 Enviando revisión:', revision);
    return this.http.post(`${this.apiUrl}/mantenimiento/revision`, revision);
  }

  getAlertasMantenimiento(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mantenimiento/alertas-pendientes`);
  }

  getHistorialMantenimiento(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mantenimiento/historial`);
  }

  reactivarAtraccion(atraccionId: number, operadorId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/mantenimiento/reactivar/${atraccionId}/${operadorId}`, {});
  }

  getAtraccionesEnRiesgo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mantenimiento/atracciones-en-riesgo`).pipe(
      catchError((error) => {
        console.error('❌ Error obteniendo atracciones en riesgo:', error);
        return of({ success: false, data: [] });
      })
    );
  }

  // ===================================================
  // USUARIO
  // ===================================================

  recargarSaldo(usuarioId: number, monto: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/recargar`, { usuarioId, monto });
  }

  getSaldo(usuarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/saldo/${usuarioId}`);
  }

  // ===================================================
  // ESTADÍSTICAS
  // ===================================================

  getTiempoPromedioEspera(): Observable<any> {
    return this.http.get(`${this.apiUrl}/atracciones/tiempo-promedio`);
  }

  getTiempoPromedioConCola(): Observable<any> {
    return this.http.get(`${this.apiUrl}/colas/tiempo-promedio-con-cola`);
  }

  cambiarEstadoAtraccion(atraccionId: number, nuevoEstado: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/atracciones/estado/${atraccionId}?nuevoEstado=${nuevoEstado}`, {});
}

ponerEnMantenimiento(atraccionId: number, operadorId: number, motivo?: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/mantenimiento/poner-mantenimiento/${atraccionId}/${operadorId}?motivo=${motivo || ''}`, {});
}
}