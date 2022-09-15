import { TestBed } from '@angular/core/testing';

import { DipDupService } from './dipdup.service';

describe('DipDupService', () => {
  let service: DipDupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DipDupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
