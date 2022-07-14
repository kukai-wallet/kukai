import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SubjectService } from '../../subject/subject.service';
import { CONSTANTS } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeztoolsService {
  readonly storeKey = 'teztools';
  //public markets = new BehaviorSubject<any>([]);
  public defiTokens = [];
  constructor(private subjectService: SubjectService) {
    this.rehydrate();
  }
  getMarkets() {
    if (CONSTANTS.MAINNET) {
      fetch('https://api.teztools.io/v1/prices')
        .then((response) => response.json())
        .then((r) => {
          const _defiTokens = [];
          const _markets = [];
          for (const contract of r.contracts) {
            const id = contract?.tokenId !== undefined ? contract.tokenId : 0;
            if (contract?.tokenAddress) {
              const tokenId: string = `${contract.tokenAddress}:${id}`;
              _defiTokens.push(tokenId);
              if (contract.usdValue && contract.tezPool) {
                const threshold = contract.tezPool % 1 === 0 ? 100000000 : 100;
                if (contract.tezPool > threshold) {
                  _markets.push({
                    tokenId,
                    usdValue: contract.usdValue
                  });
                }
              }
            }
          }
          this.subjectService.markets.next(_markets);
          this.defiTokens = _defiTokens;
          this.store();
        });
    }
  }
  store() {
    localStorage.setItem(
      this.storeKey,
      JSON.stringify({
        defiTokens: this.defiTokens,
        markets: this.subjectService.markets.value
      })
    );
  }
  rehydrate() {
    const json = localStorage.getItem(this.storeKey);
    if (json) {
      const parsed = JSON.parse(json);
      if (parsed) {
        this.defiTokens = parsed.defiTokens;
        this.subjectService.markets.next(parsed.markets);
      }
    }
  }
}
