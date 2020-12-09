import { TestBed } from '@angular/core/testing';
import { TzktService } from './tzkt.service';
import { storageMock, bigMapMock, bigMapMock2, ipfsMock, ipfsMock2, expectedResult } from './tzkt.mock';
import { CONSTANTS } from '../../../../environments/environment';

describe('TzktService', () => {
  let service: TzktService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TzktService);
  });

  it('should return token metadata', async () => {
    const contractAddress = 'KT1XnAdcer9EK3qWg4GTYzZM7i3x1gu1k837';
    const bigMapId = { contract: 31948, token: 31951 };
    const cloudUrl = 'https://cloudflare-ipfs.com/ipfs/QmZ5jRzHSeCYbyArRsPy7sQBZEroQ3xMhdZSMt4uqhsRGA';
    const cloudUrl2 = 'https://cloudflare-ipfs.com/ipfs/QmZQck9Akebnabp58YJukBMEUg5fjZLfrV2DqnPNYpQPJJ';
    const subdomain = 'you';
    spyOn(service, 'fetchApi')
      .withArgs(`https://${subdomain}.better-call.dev/v1/contract/${CONSTANTS.NETWORK}/${contractAddress}/storage`)
      .and.callFake(async () => JSON.parse(storageMock))
      .withArgs(`https://${subdomain}.better-call.dev/v1/bigmap/${CONSTANTS.NETWORK}/${bigMapId.token}/keys`)
      .and.callFake(async function () { return JSON.parse(bigMapMock); })
      .withArgs(`https://${subdomain}.better-call.dev/v1/bigmap/${CONSTANTS.NETWORK}/${bigMapId.contract}/keys`)
      .and.callFake(async function () { return JSON.parse(bigMapMock2); })
      .withArgs(cloudUrl)
      .and.callFake(async function () { return JSON.parse(ipfsMock); })
      .withArgs(cloudUrl2)
      .and.callFake(async function () { return JSON.parse(ipfsMock2); });
    expect(await service.getBigMapIds(contractAddress)).toEqual(bigMapId);
    expect(await service.getTokenMetadata(contractAddress, 2)).toEqual(expectedResult);
  });
});
