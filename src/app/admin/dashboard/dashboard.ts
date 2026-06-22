import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar';

// IMPORTS DE ANIMACIONES
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],

  // ANIMACIONES
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(30px)'
        }),
        animate(
          '0.5s ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)'
          })
        )
      ])
    ])
  ]
})
export class Dashboard {

  stats = [
    {
      icon: '👥',
      value: '1,234',
      label: 'Visitantes Hoy',
      gradient: 'linear-gradient(135deg, #4361ee, #3a56d4)',
      trend: 12,
      delay: '0.1s'
    },
    {
      icon: '🎢',
      value: '12',
      label: 'Atracciones Activas',
      gradient: 'linear-gradient(135deg, #06ffa5, #00b4d8)',
      trend: 5,
      delay: '0.2s'
    },
    {
      icon: '💰',
      value: '$12.5K',
      label: 'Ingresos Totales',
      gradient: 'linear-gradient(135deg, #ffb703, #fb8500)',
      trend: 8,
      delay: '0.3s'
    },
    {
      icon: '⚠️',
      value: '3',
      label: 'Alertas Pendientes',
      gradient: 'linear-gradient(135deg, #ef233c, #d90429)',
      trend: -2,
      delay: '0.4s'
    }
  ];

  quickActions = [
    {
      icon: '📊',
      title: 'Ver Reportes',
      description: 'Analiza las estadísticas del parque',
      link: '/admin/reportes'
    },
    {
      icon: '🎢',
      title: 'Gestionar Atracciones',
      description: 'Agrega o modifica atracciones',
      link: '/admin/atracciones'
    },
    {
      icon: '👥',
      title: 'Gestionar Usuarios',
      description: 'Administra los usuarios del sistema',
      link: '/admin/usuarios'
    },
    {
      icon: '👨‍💼',
      title: 'Gestionar Personal',
      description: 'Administra el personal del parque',
      link: '/admin/personal'
    }
  ];
}