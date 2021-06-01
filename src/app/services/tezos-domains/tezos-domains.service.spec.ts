import { TestBed } from '@angular/core/testing';

import { TezosDomainsService } from './tezos-domains.service';

describe('TezosDomainsService', () => {
  let service: TezosDomainsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TezosDomainsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
