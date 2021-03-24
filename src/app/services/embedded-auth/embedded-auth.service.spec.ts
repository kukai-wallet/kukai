import { TestBed } from '@angular/core/testing';

import { EmbeddedAuthService } from './embedded-auth.service';

describe('EmbeddedAuthService', () => {
  let service: EmbeddedAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmbeddedAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
