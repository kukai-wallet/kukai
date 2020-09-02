import { TestBed } from '@angular/core/testing';

import { TorusService } from './torus.service';

describe('TorusService', () => {
  let service: TorusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TorusService);
  });

  /*it('should be created', () => {
    expect(service).toBeTruthy();
  });*/
});
