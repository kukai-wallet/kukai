import { TestBed, inject } from '@angular/core/testing';

import { FaucetService } from './faucet.service';

describe('FaucetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FaucetService]
    });
  });

  it('should be created', inject([FaucetService], (service: FaucetService) => {
    expect(service).toBeTruthy();
  }));
});
