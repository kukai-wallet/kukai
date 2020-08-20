import { TestBed } from '@angular/core/testing';

import { BeaconService } from './beacon.service';

describe('BeaconService', () => {
  let service: BeaconService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BeaconService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
