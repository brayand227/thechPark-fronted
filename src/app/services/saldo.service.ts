import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaldoService {
  private saldoSubject = new BehaviorSubject<number>(0);
  public saldo$ = this.saldoSubject.asObservable();

  actualizarSaldo(saldo: number) {
    console.log('SaldoService: Actualizando saldo a:', saldo);
    this.saldoSubject.next(saldo);
    
    // Actualizar sessionStorage en lugar de localStorage
    const usuarioStr = sessionStorage.getItem('techpark_usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      usuario.saldoVirtual = saldo;
      sessionStorage.setItem('techpark_usuario', JSON.stringify(usuario));
    }
  }

  getSaldoActual(): number {
    return this.saldoSubject.value;
  }
}