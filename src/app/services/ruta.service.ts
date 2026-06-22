import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RutaRequest {
  origenId: number;
  destinoId: number;
}

export interface PasoRuta {
  atraccionId: number;
  atraccionNombre: string;
  distanciaDesdeAnterior: number;
  tiempoEstimado: number;
  instruccion: string;
  orden: number;
}

export interface RutaResponse {
  origenId: number;
  origenNombre: string;
  destinoId: number;
  destinoNombre: string;
  pasos: PasoRuta[];
  distanciaTotal: number;
  tiempoEstimadoTotal: number;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class RutaService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  obtenerRutaMasCorta(origenId: number, destinoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/rutas/mas-corta`, { origenId, destinoId });
  }

  obtenerMapaVisual(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rutas/mapa-visual`);
  }

  obtenerAtraccionesCercanas(atraccionId: number, limite: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/rutas/cercanas/${atraccionId}/${limite}`);
  }
  // Agregar este método
  obtenerGrafoCompleto(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rutas/grafo-completo`);
  }

  //obtener posiciones reales 
  obtenerPosiciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rutas/posiciones`); 
  }
}