import { TestBed } from '@angular/core/testing';

import { TokenService, TokenResponseType } from './token.service';
import { IndexerService } from '../indexer/indexer.service';

describe('TokenService', () => {
  let service: TokenService;
  let indexerService: IndexerService;
  let response: any = {};

  beforeEach(() => {
    TestBed.configureTestingModule({});
    spyOn(localStorage.__proto__, 'getItem').and.returnValue(undefined);
    service = TestBed.inject(TokenService);
    (service as any).contracts = {};
    spyOn(service, 'explore').and.callFake(function () { return true; });
    indexerService = TestBed.inject(IndexerService);
    response = {
      decimals: 0,
      tokenType: 'FA2',
      name: 'Test NFT',
      symbol: 'tzTe',
      uri: 'ipfs://QmTMHwTQhttR5e3R7Kbt2JyqRjrNxE61ENtHGzkp4h6MJD',
      displayUri: 'https://gateway.pinata.cloud/ipfs/QmNYkGR7wb4XLHqTwF8NZKAMpsMUQGqBwfQXr5VcZy75ki'
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('> Search metadata', async () => {
    beforeEach(() => {
      spyOn(indexerService, 'getTokenMetadata').and.callFake(async function () { return response; });
    });
    it('Valid metadata => inclusion', async (done) => {
      await service.searchMetadata('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM', 0);
      const expectedTokenResponse: TokenResponseType = {
        kind: 'FA2',
        id: 0,
        decimals: 0,
        name: 'Test NFT',
        description: '',
        category: '',
        symbol: 'tzTe',
        contractAddress: 'KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM',
        displayUrl: '../../../assets/img/tokens/default.png',
        nonTransferable: false,
        booleanAmount: false
      };
      expect(service.getAsset('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM:0')).toEqual(expectedTokenResponse);
      done();
    });
    it('Metadata with undefined decimals => exclusion', async (done) => {
      response.decimals = undefined;
      await service.searchMetadata('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM', 0);
      expect(service.getAsset('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM:0')).toEqual(null);
      done();
    });
    it('Metadata with no symbol => exclusion', async (done) => {
      response.symbol = null;
      await service.searchMetadata('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM', 0);
      expect(service.getAsset('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM:0')).toEqual(null);
      done();
    });
    it('Metadata with negative decimals => exclusion', async (done) => {
      response.decimals = -1;
      await service.searchMetadata('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM', 0);
      expect(service.getAsset('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM:0')).toEqual(null);
      done();
    });
    it('Metadata with no name => exclusion', async (done) => {
      response.name = null;
      await service.searchMetadata('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM', 0);
      expect(service.getAsset('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM:0')).toEqual(null);
      done();
    });
  });
});
