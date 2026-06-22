import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertaDetalle } from './alerta-detalle';

describe('AlertaDetalle', () => {
  let component: AlertaDetalle;
  let fixture: ComponentFixture<AlertaDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertaDetalle],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertaDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
