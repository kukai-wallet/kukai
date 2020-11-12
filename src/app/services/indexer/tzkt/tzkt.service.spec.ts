import { TestBed } from '@angular/core/testing';

import { TzktService } from './tzkt.service';

describe('TzktService', () => {
  let service: TzktService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TzktService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
