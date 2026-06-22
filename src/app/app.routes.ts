import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { Login } from './auth/login/login';
import { Registro } from './auth/registro/registro';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './auth/reset-password/reset-password';
import { Dashboard } from './admin/dashboard/dashboard';
import { Reportes } from './admin/reportes/reportes';
import { AtraccionesAdmin } from './admin/atracciones/atracciones';
import { Usuarios } from './admin/usuarios/usuarios';
import { Personal } from './admin/personal/personal';
import { PanelComponent } from './operador/panel/panel';
import { AtencionComponent } from './operador/atencion/atencion';
import { MantenimientoComponent } from './operador/mantenimiento/mantenimiento';
import { DashboardVisitante } from './visitante/dashboard/dashboard';
import { AtraccionesVisitante } from './visitante/atracciones/atracciones';
import { ColasVisitante } from './visitante/colas/colas';
import { MapaVisitante } from './visitante/mapa/mapa';
import { PerfilVisitante } from './visitante/perfil/perfil';
import { RecargaVisitante } from './visitante/recarga/recarga';

export const routes: Routes = [
  // Redirección por defecto a login
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Rutas de autenticación (sin layout)
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  
  // ================= RUTAS DE ADMINISTRADOR =================
  {
    path: 'admin',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'reportes', component: Reportes },
      { path: 'atracciones', component: AtraccionesAdmin },
      { path: 'usuarios', component: Usuarios },
      { path: 'personal', component: Personal }
    ]
  },
  
  // ================= RUTAS DE OPERADOR =================
  {
    path: 'operador',
    component: MainLayoutComponent,
    children: [
      { path: 'panel', component: PanelComponent },
      { path: 'atencion', component: AtencionComponent },
      { path: 'mantenimiento', component: MantenimientoComponent }
    ]
  },
  
  // ================= RUTAS DE VISITANTE =================
  {
    path: 'visitante',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardVisitante },
      { path: 'atracciones', component: AtraccionesVisitante },
      { path: 'colas', component: ColasVisitante },
      { path: 'mapa', component: MapaVisitante },
      { path: 'perfil', component: PerfilVisitante },
      { path: 'recarga', component: RecargaVisitante }
    ]
  },
  
  // Cualquier otra ruta redirige a login
  { path: '**', redirectTo: '/login' }
];