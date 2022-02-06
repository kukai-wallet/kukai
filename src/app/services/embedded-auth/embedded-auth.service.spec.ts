import { TestBed } from '@angular/core/testing';
import { WalletTools } from '../../../../spec/mocks/library.mock';
import { WalletService } from '../wallet/wallet.service';
import { EmbeddedAuthService } from './embedded-auth.service';
import { EncryptionService } from '../encryption/encryption.service';
import { OperationService } from '../operation/operation.service';
import { TorusService } from '../torus/torus.service';
import { InputValidationService } from '../input-validation/input-validation.service';
import { ErrorHandlingPipe } from '../../pipes/error-handling.pipe';
import { http_imports, translate_imports } from '../../../../spec/helpers/service.helper';
import { WalletObject } from '../wallet/wallet';
import { CONSTANTS } from '../../../environments/environment';

describe('EmbeddedAuthService', () => {
  let service: EmbeddedAuthService;
  let walletService: WalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [http_imports, translate_imports],
      providers: [EmbeddedAuthService, WalletService, EncryptionService, OperationService, TorusService, InputValidationService, ErrorHandlingPipe]
    });
    const walletgen: WalletTools = new WalletTools();
    const mockwallet: WalletObject = walletgen.generateWalletEmbedded();
    service = TestBed.inject(EmbeddedAuthService);
    walletService = TestBed.inject(WalletService);
    walletService.wallet = mockwallet;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('> Authenticate', async () => {
    beforeEach(() => {
      spyOn(Date, 'now').and.returnValue(1616770407005);
      spyOn(service, '_network').and.returnValue('edonet');
    });
    it('should sign authentication message', async () => {
      const resp = await service.authenticate(
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nonce: '32174589748'
        },
        'https://test.com'
      );
      expect(resp).toEqual({
        message:
          'Tezos Signed Message: {"requestId":"123e4567-e89b-12d3-a456-426614174000","purpose":"authentication","currentTime":"1616770407","nonce":"32174589748","network":"edonet","publicKey":"sppk7cZsZeBApsFgYEdWuSwj92YCWkJxMmBfkN3FeKRmEB7Lk5pmDrT","address":"tz2WKg52VqnYXH52TZbSVjT4hcc8YGVKi7Pd","domain":"https://test.com"}',
        signature: 'spsig18Pt8uZVhcDc2jzqsBLpgpkJD6qkedpkfxr537kCxZzYxvGJyY7pQLMsog4cwSEoTcRn82EA7ZkqbudQoo6JZbcSUqxm5a'
      });
    });
  });
});
