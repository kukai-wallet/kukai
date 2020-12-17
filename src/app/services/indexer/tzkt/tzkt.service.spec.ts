import { TestBed } from '@angular/core/testing';
import { TzktService } from './tzkt.service';
import { storageMock, contractMetadataBigMapMock, tokenMetadataBigMapMock, contractIpfsMock, tokenIpfsMock, expectedResult } from './tzkt.mock';
import { CONSTANTS } from '../../../../environments/environment';

describe('TzktService', () => {
  let service: TzktService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TzktService);
  });

  it('should return token metadata', async () => {
    const contractAddress = 'KT1RhzBigSQWQkEZQpNSyi4abTFm5fpMyihH';
    const bigMapId = { contract: 26006, token: 26009 };
    const tokenCloudUrl = 'https://cloudflare-ipfs.com/ipfs/QmZDycNwSy12vueaPnxuCMFUCHeQieT5wA5yNwqswwFn3V';
    const contractCloudUrl = 'https://cloudflare-ipfs.com/ipfs/QmVBdYhUXmF3QSRSYgoZfvUhLKgW4oCWC6xMzvHzV5TFVA';
    spyOn(service, 'fetchApi')
      .withArgs(`${this.service.bcd}/contract/${CONSTANTS.NETWORK}/${contractAddress}/storage`)
      .and.callFake(async () => JSON.parse(storageMock))
      .withArgs(`${this.service.bcd}/v1/bigmap/${CONSTANTS.NETWORK}/${bigMapId.token}/keys`)
      .and.callFake(async function () { return JSON.parse(tokenMetadataBigMapMock); })
      .withArgs(`${this.service.bcd}/v1/bigmap/${CONSTANTS.NETWORK}/${bigMapId.contract}/keys`)
      .and.callFake(async function () { return JSON.parse(contractMetadataBigMapMock); })
      .withArgs(tokenCloudUrl)
      .and.callFake(async function () { return JSON.parse(tokenIpfsMock); })
      .withArgs(contractCloudUrl)
      .and.callFake(async function () { return JSON.parse(contractIpfsMock); });
    expect(await service.getBigMapIds(contractAddress)).toEqual(bigMapId);
    expect(await service.getTokenMetadata(contractAddress, 0)).toEqual(expectedResult);
  });
});
