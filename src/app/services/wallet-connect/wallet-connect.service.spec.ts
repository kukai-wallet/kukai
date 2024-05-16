import { TestBed } from '@angular/core/testing';

import { WalletConnectService } from './wallet-connect.service';
import { OperationService } from '../operation/operation.service';
import { BcService } from '../bc/bc.service';
import { WalletService } from '../wallet/wallet.service';
import { SubjectService } from '../subject/subject.service';
import { AppModule } from '../../app.module';

describe('WalletConnectService', () => {
  let service: WalletConnectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [WalletConnectService, SubjectService, OperationService, BcService, WalletService]
    });
    service = TestBed.inject(WalletConnectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
