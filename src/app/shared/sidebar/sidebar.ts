import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  rol: string = '';
  nombreUsuario: string = '';
  menuItems: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.usuario$.subscribe(usuario => {
      if (usuario) {
        this.rol = usuario.rol;
        this.nombreUsuario = usuario.nombre;
        this.cargarMenuPorRol();
      }
    });
  }

  cargarMenuPorRol() {
    switch (this.rol) {
      case 'ADMINISTRADOR':
        this.menuItems = [
          { icon: '📊', titulo: 'Dashboard', link: '/admin/dashboard' },
          { icon: '🎢', titulo: 'Atracciones', link: '/admin/atracciones' },
          { icon: '👥', titulo: 'Usuarios', link: '/admin/usuarios' },
          { icon: '👨‍💼', titulo: 'Personal', link: '/admin/personal' },
          { icon: '📈', titulo: 'Reportes', link: '/admin/reportes' }
        ];
        break;
      case 'OPERADOR':
        this.menuItems = [
          { icon: '🔧', titulo: 'Panel', link: '/operador/panel' },
          { icon: '🎟️', titulo: 'Atención', link: '/operador/atencion' },
          { icon: '🔨', titulo: 'Mantenimiento', link: '/operador/mantenimiento' }
        ];
        break;
      case 'VISITANTE':
        this.menuItems = [
          { icon: '🏠', titulo: 'Inicio', link: '/visitante/dashboard' },
          { icon: '🎫', titulo: 'Mis Colas', link: '/visitante/colas' },
          { icon: '🗺️', titulo: 'Mapa', link: '/visitante/mapa' },
          { icon: '👤', titulo: 'Perfil', link: '/visitante/perfil' }
        ];
        break;
    }
  }

  getUserInitial(): string {
    if (this.nombreUsuario && this.nombreUsuario.length > 0) {
      return this.nombreUsuario.charAt(0).toUpperCase();
    }
    return 'U';
  }

  getUserName(): string {
    if (this.nombreUsuario) {
      // Limitar a 20 caracteres
      return this.nombreUsuario.length > 20 
        ? this.nombreUsuario.substring(0, 20) + '...' 
        : this.nombreUsuario;
    }
    return 'Usuario';
  }

  getRolName(): string {
    switch (this.rol) {
      case 'ADMINISTRADOR':
        return 'Administrador';
      case 'OPERADOR':
        return 'Operador';
      case 'VISITANTE':
        return 'Visitante';
      default:
        return 'Usuario';
    }
  }
}