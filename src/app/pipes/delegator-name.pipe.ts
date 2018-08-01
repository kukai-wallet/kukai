import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'delegatorName'
})
export class DelegatorNamePipe implements PipeTransform {
    map: Map<string, string> = new Map([
        ['tz1XQ7SRj4QQWjaeebNd8dFwuTrCot3GGDRF', 'Tz Baker'],  // no longer listed
        // ['tz1L5GqtsKbasq9yD4hvtGC7VprPXDPmeb9V', 'Tezos Bakes'],  no longer active
        ['tz1TDSmoZXwVevLTEvKCTHWpomG76oC9S2fJ', 'Tezos Community'],
        ['tz1eEnQhbwf6trb8Q8mPb2RaPkNk2rN7BKi8', 'Cryptium Labs'],
        ['tz1NortRftucvAkD1J58L32EhSVrQEWJCEnB', 'Bake’n’Rolls'],
        ['tz1LLNkQK4UQV6QcFShiXJ2vT2ELw449MzAA', 'TezoSteam'],
        ['tz1bHzftcTKZMTZgLLtnrXydCm6UEqf4ivca', 'Tezos Vote'],
        ['tz1YTyvABUyhE7JHpxMVBVqjZnZM4ofMrWKE', 'Tezos Delegate EU'],
        ['tz1WCd2jm4uSt4vntk4vSuUWoZQGhLcDuR9q', 'Happy Tezos'],
        ['tz1TcH4Nb3aHNDJ7CGZhU7jgAK1BkSP4Lxds', 'XTZ Antipodes'],
        ['tz1iLbZZ9uoRuVJCrZ9ZwiJMpfzhy3c67mav', 'AirBie'],
        ['tz1WpeqFaBG9Jm73Dmgqamy8eF8NWLz9JCoY', 'Staking Facilities'],
        ['tz1L3vFD8mFzBaS8yLHFsd7qDJY1t276Dh8i', 'Zednode'],
        ['tz1iZEKy4LaAjnTmn2RuGDf2iqdAQKnRi8kY', 'Tezzigator'],
        ['tz1YKh8T79LAtWxX29N5VedCSmaZGw9LNVxQ', 'TezosBr'],
        ['tz1hThMBD8jQjFt78heuCnKxJnJtQo9Ao25X', 'Tezos Chef'],
        ['tz3bEQoFCZEEfZMskefZ8q8e4eiHH1pssRax', 'Ceibo XTZ'],  // Listing Error
        ['tz1Tnjaxk6tbAeC2TmMApPh8UsrEVQvhHvx5', 'Crypto Delegate'],
        ['tz1ZTG13gkvouxSANka3HG3uys8C5gu3DPXZ', 'Just a Baker'],
        ['tz1PYLN9TsKZHfn2GtrXnxkeGvahmYdBTG5v', 'Tezos Bakes'],
        ['tz1Zhv3RkfU2pHrmaiDyxp7kFZpZrUCu1CiF', 'TZBake'],
        ['tz1PriNQyDC7d5ccPAD96ugujYy5YbdGLdQ5', 'Tezos Baker JP'],
        ['tz1Z1WwoqgRFbLE3YNdYRpCx44NSfiMJzeAG', 'Bakemon'],
        ['tz1bkg7rynMXVcjomoe3diB4URfv8GU2GAcw', 'tz Bank'],
        ['tz1Lhf4J9Qxoe3DZ2nfe8FGDnvVj7oKjnMY6', 'Tez Baker'],  // Listing Error
        ['tz1YdCPrYbksK7HCoYKDyzgfXwY16Fy9rrGa', 'Norn Delegate'],
        ['tz1LesY3S4wfe15SNm1W3qJmQzWxLqVjTruH', 'Xtez.io'],
        ['tz1Yc6ATtfUJyDjHwJ8WoVL22sJueDenueke', 'TezDele Baker A'],
        ['tz1SdwBHocSrcuMFNLPUg4LPRfx9eaqjVUEL', 'TezDele Baker B']
    ]);

    transform(pkh: string): string {
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
