import { TestBed } from '@angular/core/testing';

import { Visitante } from './visitante.service';

describe('Visitante', () => {
  let service: Visitante;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Visitante);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
