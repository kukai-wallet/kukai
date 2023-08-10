import { Injectable } from '@angular/core';
import { SubjectService } from '../../subject/subject.service';
import { SwapLiquidityService } from '../../swap-liquidity/swap-liquidity.service';

@Injectable({
  providedIn: 'root'
})
export class DipDupService {
  private readonly storeKey = 'dipdup';
  private readonly maxTokensReturned = 1000;
  public tokens = new Map<string, any>();
  constructor(private subjectService: SubjectService) {
    this.rehydrate();
  }
  async fetchTokensMidPrice(offset = 0): Promise<void> {
    const baseUrl = `https://dex.dipdup.net/v1/graphql`;
    const req = {
      query: `{
            token(where: {} offset: ${offset}) {
              exchanges(where: {_not: {name: {_eq: "lb"}}}) {
                midPrice,
                sharesTotal,
                token {
                  address,
                  tokenId
                }
              }
      }}`
    };
    const response = await (
      await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req)
      })
    ).json();
    if (response?.data?.token?.length) {
      if (offset === 0) {
        this.tokens = new Map<string, any>();
      }
      for (const t of response.data.token) {
        const exchange = t.exchanges.reduce((p, c) =>
          (!!c?.sharesTotal && !!p?.sharesTotal && Number(c.sharesTotal) > Number(p.sharesTotal)) || (c?.sharesTotal && !p?.sharesTotal) ? c : p
        );
        if (exchange?.token?.address === 'KT1TjnZYs5CGLbmV6yuW169P8Pnr9BiVwwjz' && exchange?.token?.tokenId === 0) {
          // exception for oXTZ
          exchange.midPrice = '1';
        }
        this.tokens.set(`${exchange.token.address}:${exchange.token.tokenId}`, Boolean(Number(exchange?.midPrice)) ? exchange?.midPrice : '0');
      }
    }
    if (response?.data?.token?.length >= this.maxTokensReturned) {
      this.fetchTokensMidPrice(offset + this.maxTokensReturned);
    } else if (this.tokens.size) {
      this.store();
    }
    return;
  }
  store() {
    const obj = Object.fromEntries(this.tokens);
    localStorage.setItem(
      this.storeKey,
      JSON.stringify({
        midPrices: obj
      })
    );
    this.subjectService.refreshTokens.next(null);
  }
  rehydrate() {
    const json = localStorage.getItem(this.storeKey);
    if (json) {
      const parsed = JSON.parse(json);
      if (parsed?.midPrices) {
        for (const key of Object.keys(parsed.midPrices)) {
          this.tokens.set(key, parsed.midPrices[key]);
        }
        this.subjectService.refreshTokens.next(null);
      }
    }
  }
}
