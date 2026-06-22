import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VisitanteService, Atraccion } from '../../services/visitante.service';
import { RutaService, RutaResponse } from '../../services/ruta.service';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { FooterComponent } from '../../shared/footer/footer';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.css']
})
export class MapaVisitante implements OnInit, AfterViewInit {
  @ViewChild('mapCanvas') mapCanvas!: ElementRef<HTMLCanvasElement>;

  atracciones: Atraccion[] = [];
  origenId: number = 0;
  destinoId: number = 0;
  ruta: RutaResponse | null = null;
  loading = true;
  calculando = false;

  // Posiciones de los nodos (escala más grande para mejor visualización)
  posiciones: { [key: number]: { x: number; y: number } } = {
    // Zona Extrema (esquina superior izquierda)
    1: { x: 150, y: 80 },   // Montaña Rusa
    2: { x: 220, y: 50 },   // Torre de Caída
    3: { x: 100, y: 40 },   // Sillas Voladoras
    4: { x: 180, y: 130 },  // Casa del Terror
    
    // Zona Acuática (esquina superior derecha)
    5: { x: 650, y: 100 },  // Río Salvaje
    6: { x: 720, y: 140 },  // Tobogán
    7: { x: 600, y: 180 },  // Piscina
    8: { x: 680, y: 60 },   // Rápido
    
    // Zona Infantil (centro izquierda)
    9: { x: 80, y: 280 },   // Carritos
    10: { x: 120, y: 350 }, // Carrusel
    11: { x: 40, y: 220 },  // Avioncitos
    12: { x: 150, y: 300 }, // Tren
    
    // Zona Shows (centro derecha)
    13: { x: 550, y: 250 }, // Show Magia
    14: { x: 620, y: 320 }, // Circo
    15: { x: 480, y: 300 }, // Cine 4D
    16: { x: 580, y: 400 }, // Concierto
    
    // Zona Gastronómica (parte inferior)
    17: { x: 350, y: 520 }, // Restaurante
    18: { x: 280, y: 480 }, // Cafetería
    19: { x: 420, y: 470 }  // Heladería
  };

  coloresPorTipo: { [key: string]: string } = {
    'MECANICA': '#ff6b35',
    'ACUATICA': '#4cc9f0',
    'INFANTIL': '#06ffa5',
    'SHOW': '#7209b7'
  };

  // Conexiones únicas y organizadas
  conexiones: number[][] = [
    // Zona Extrema
    [1, 2], [2, 3], [3, 1], [1, 4], [2, 4],
    
    // Zona Acuática
    [5, 6], [6, 7], [7, 8], [8, 5], [5, 14],
    
    // Zona Infantil
    [9, 10], [10, 11], [11, 9], [9, 12], [10, 12],
    
    // Zona Shows
    [13, 14], [14, 15], [15, 16], [13, 16],
    
    // Conexiones entre zonas
    [4, 13], [8, 16], [12, 7], [3, 11],
    
    // Zona Gastronómica
    [16, 17], [17, 18], [18, 19], [17, 19],
    [17, 14], [18, 15]
  ];

  constructor(
    private visitanteService: VisitanteService,
    private rutaService: RutaService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarAtracciones();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dibujarMapa();
    }, 500);
  }

  cargarAtracciones() {
    this.loading = true;
    this.visitanteService.getAtracciones().subscribe({
      next: (response) => {
        if (response.success) {
          this.atracciones = response.data;
          this.dibujarMapa();
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.toastr.error('Error al cargar las atracciones', 'Error');
        this.loading = false;
      }
    });
  }

  onOrigenChange() {
    this.limpiarRuta();
    if (this.origenId && this.destinoId) {
      this.calcularRuta();
    }
    this.dibujarMapa();
  }

  onDestinoChange() {
    this.limpiarRuta();
    if (this.origenId && this.destinoId) {
      this.calcularRuta();
    }
    this.dibujarMapa();
  }

   calcularRuta() {
  if (!this.origenId || !this.destinoId || this.origenId === this.destinoId) return;

  this.calculando = true;
  this.ruta = null;
  this.cdr.detectChanges();

  this.rutaService.obtenerRutaMasCorta(this.origenId, this.destinoId).subscribe({
    next: (response) => {
      this.calculando = false;
      
      if (response.success && response.data) {
        this.ruta = response.data;
        
        if (response.data.distanciaTotal > 0) {
          this.toastr.success(`Ruta encontrada: ${response.data.distanciaTotal}m`, '✅ Éxito');
        } else {
          this.toastr.info('El origen y destino están muy cerca', '📍 Distancia corta');
        }
      } else {
        this.toastr.warning('No se encontró una ruta válida entre estos puntos', 'Sin ruta');
      }
      
      this.dibujarMapa();
      this.cdr.detectChanges();
    },
    error: (error) => {
      this.calculando = false;
      this.cdr.detectChanges();
      this.toastr.error(error.error?.message || 'No se pudo calcular la ruta', 'Error');
      this.dibujarMapa();
    }
  });
}

  limpiarRuta() {
    this.ruta = null;
    this.dibujarMapa();
  }

  dibujarMapa() {
    const canvas = this.mapCanvas?.nativeElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 800;
    canvas.height = 600;
    
    // Fondo
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    this.dibujarAristas(ctx);
    this.dibujarRuta(ctx);
    this.dibujarNodos(ctx);
  }

  dibujarAristas(ctx: CanvasRenderingContext2D) {
    // Dibujar conexiones
    for (const [id1, id2] of this.conexiones) {
      const p1 = this.posiciones[id1];
      const p2 = this.posiciones[id2];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  dibujarRuta(ctx: CanvasRenderingContext2D) {
    if (!this.ruta || !this.ruta.pasos || this.ruta.pasos.length < 2) return;
    
    // Dibujar la ruta encontrada
    for (let i = 0; i < this.ruta.pasos.length - 1; i++) {
      const p1 = this.posiciones[this.ruta.pasos[i].atraccionId];
      const p2 = this.posiciones[this.ruta.pasos[i + 1].atraccionId];
      
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 5;
        ctx.stroke();
      }
    }
  }

  dibujarNodos(ctx: CanvasRenderingContext2D) {
    for (const atraccion of this.atracciones) {
      const pos = this.posiciones[atraccion.id];
      if (!pos) continue;
      
      const esOrigen = this.origenId === atraccion.id;
      const esDestino = this.destinoId === atraccion.id;
      const enRuta = this.ruta && this.ruta.pasos?.some(p => p.atraccionId === atraccion.id);
      
      let color = this.coloresPorTipo[atraccion.tipo] || '#6c757d';
      let radio = 18;
      
      if (esOrigen) {
        color = '#28a745';
        radio = 22;
      } else if (esDestino) {
        color = '#dc3545';
        radio = 22;
      } else if (enRuta) {
        radio = 20;
      }
      
      // Círculo
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radio, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Icono
      ctx.font = '18px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.getIconoPorTipo(atraccion.tipo), pos.x, pos.y);
      
      // Nombre (solo para nodos importantes o con espacio)
      if (esOrigen || esDestino || enRuta) {
        ctx.font = '10px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(atraccion.nombre, pos.x, pos.y + radio + 10);
      }
    }
  }

  onCanvasMouseMove(event: MouseEvent) {
    const canvas = this.mapCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;
    
    let found = false;
    for (const atraccion of this.atracciones) {
      const pos = this.posiciones[atraccion.id];
      if (pos && Math.hypot(mouseX - pos.x, mouseY - pos.y) < 20) {
        this.tooltipAtraccion = atraccion;
        this.tooltipX = event.clientX + 15;
        this.tooltipY = event.clientY - 30;
        this.tooltipVisible = true;
        found = true;
        break;
      }
    }
    
    if (!found) {
      this.tooltipVisible = false;
    }
  }

  onCanvasClick(event: MouseEvent) {
    const canvas = this.mapCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;
    
    for (const atraccion of this.atracciones) {
      const pos = this.posiciones[atraccion.id];
      if (pos && Math.hypot(mouseX - pos.x, mouseY - pos.y) < 20) {
        if (this.origenId === 0) {
          this.origenId = atraccion.id;
          this.toastr.info(`Origen: ${atraccion.nombre}`, '📍');
        } else if (this.destinoId === 0 && this.origenId !== atraccion.id) {
          this.destinoId = atraccion.id;
          this.toastr.info(`Destino: ${atraccion.nombre}`, '🎯');
          this.calcularRuta();
        } else if (this.origenId === atraccion.id) {
          this.origenId = 0;
          this.limpiarRuta();
          this.toastr.info('Origen removido', '📍');
        } else if (this.destinoId === atraccion.id) {
          this.destinoId = 0;
          this.limpiarRuta();
          this.toastr.info('Destino removido', '🎯');
        }
        this.dibujarMapa();
        break;
      }
    }
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

  // Variables para tooltip
  tooltipVisible = false;
  tooltipX = 0;
  tooltipY = 0;
  tooltipAtraccion: Atraccion | null = null;
}