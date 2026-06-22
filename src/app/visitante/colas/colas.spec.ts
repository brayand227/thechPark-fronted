import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Colas } from './colas';

describe('Colas', () => {
  let component: Colas;
  let fixture: ComponentFixture<Colas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Colas],
    }).compileComponents();

    fixture = TestBed.createComponent(Colas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
