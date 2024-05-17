import { TestBed } from '@angular/core/testing';

import { WalletConnectService } from './wallet-connect.service';

describe('WalletConnectService', () => {
  let service: WalletConnectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalletConnectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
