import { TestBed } from '@angular/core/testing';

import { TokenService, TokenResponseType } from './token.service';
import { IndexerService } from '../indexer/indexer.service';

describe('TokenService', () => {
  let service: TokenService;
  let indexerService: IndexerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
    indexerService = TestBed.inject(IndexerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('> Search metadata', () => {
    let response: any;
    beforeEach(() => {
      response = {
        decimals: 0,
        tokenType: 'FA2',
        name: "Test NFT",
        symbol: "tzTe",
        uri: "ipfs://QmTMHwTQhttR5e3R7Kbt2JyqRjrNxE61ENtHGzkp4h6MJD",
        imageUri: "https://gateway.pinata.cloud/ipfs/QmNYkGR7wb4XLHqTwF8NZKAMpsMUQGqBwfQXr5VcZy75ki",
        isNft: true
      }
    });
    it('Valid metadata => inclusion', async () => {
      spyOn(indexerService, 'getTokenMetadata').and.callFake(async function() { return response; });
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
        imageSrc: 'https://gateway.pinata.cloud/ipfs/QmNYkGR7wb4XLHqTwF8NZKAMpsMUQGqBwfQXr5VcZy75ki',
        isNft: true
      }
      expect(service.getAsset('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM:0')).toEqual(expectedTokenResponse);
    });
    it('Metadata with undefined decimals => exclusion', async () => {
      response.decimals = undefined;
      spyOn(indexerService, 'getTokenMetadata').and.callFake(async function() { return response; });
      await service.searchMetadata('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM', 0);
      expect(service.getAsset('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM:0')).toEqual(null);
    });
    it('Metadata with negative decimals => exclusion', async () => {
      response.decimals = '-1';
      spyOn(indexerService, 'getTokenMetadata').and.callFake(async function() { return response; });
      await service.searchMetadata('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM', 0);
      expect(service.getAsset('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM:0')).toEqual(null);
    });
    it('Metadata with no name => exclusion', async () => {
      response.name = undefined;
      spyOn(indexerService, 'getTokenMetadata').and.callFake(async function() { return response; });
      await service.searchMetadata('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM', 0);
      expect(service.getAsset('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM:0')).toEqual(null);
    });
    it('Metadata with no symbol => exclusion', async () => {
      response.symbol = undefined;
      spyOn(indexerService, 'getTokenMetadata').and.callFake(async function() { return response; });
      await service.searchMetadata('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM', 0);
      expect(service.getAsset('KT1XXCz59vAzfbvDsNrrmKKuqSFrzQgpUqGM:0')).toEqual(null);
    });
  });
});
