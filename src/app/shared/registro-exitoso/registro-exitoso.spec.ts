import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroExitoso } from './registro-exitoso';

describe('RegistroExitoso', () => {
  let component: RegistroExitoso;
  let fixture: ComponentFixture<RegistroExitoso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroExitoso],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroExitoso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
