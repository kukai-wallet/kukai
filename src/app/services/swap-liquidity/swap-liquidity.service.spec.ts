import { TestBed } from '@angular/core/testing';

import { SwapLiquidityService } from './swap-liquidity.service';

describe('TezosDomainsService', () => {
  let service: SwapLiquidityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwapLiquidityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
