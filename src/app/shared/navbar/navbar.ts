import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  usuario: any = null;
  rol: string = '';
  mobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      this.rol = usuario?.rol || '';
    });
  }

  toggleMobileSidebar() {
    this.toggleSidebar.emit();
  }

  logout() {
    this.authService.logout();
  }

  getInitials(): string {
    if (this.usuario?.nombre) {
      return this.usuario.nombre.charAt(0).toUpperCase();
    }
    return 'U';
  }
}