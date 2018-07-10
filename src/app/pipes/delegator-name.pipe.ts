import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'delegatorName'
})
export class DelegatorNamePipe implements PipeTransform {
  map: Map<string, string> = new Map([
    ['tz1TDSmoZXwVevLTEvKCTHWpomG76oC9S2fJ', 'Tezos.Community'],
    ['tz1WCd2jm4uSt4vntk4vSuUWoZQGhLcDuR9q', 'Happy Tezos'],
    ['tz1XQ7SRj4QQWjaeebNd8dFwuTrCot3GGDRF', 'Tz Baker'],
    ['tz1YKh8T79LAtWxX29N5VedCSmaZGw9LNVxQ', 'Tezos Brazil'],
    ['tz3bEQoFCZEEfZMskefZ8q8e4eiHH1pssRax', 'Ceibo XTZ'],
    ['tz1hThMBD8jQjFt78heuCnKxJnJtQo9Ao25X', 'Tezos Chef'],
    ['tz1L3vFD8mFzBaS8yLHFsd7qDJY1t276Dh8i', 'Zednode'],
    ['tz1Tnjaxk6tbAeC2TmMApPh8UsrEVQvhHvx5', 'My Crypto Delegate'],
    ['tz1LesY3S4wfe15SNm1W3qJmQzWxLqVjTruH', 'Xtez.io'],
    ['tz1L5GqtsKbasq9yD4hvtGC7VprPXDPmeb9V', 'Tezos Bakes']
  ]);
  transform(pkh: string): any {
    if (!pkh) {
      return '';
    }
    const name = this.map.get(pkh);
    if (name) {
      return name;
    } else {
      return pkh;
    }
  }
}
