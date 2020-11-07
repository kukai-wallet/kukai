import { TestBed } from '@angular/core/testing';

import { DeeplinkService } from './deeplink.service';

describe('DeeplinkService', () => {
  let service: DeeplinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeeplinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
