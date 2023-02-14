import { TestBed } from '@angular/core/testing';

import { BcService } from './bc.service';

describe('BcService', () => {
  let service: BcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
