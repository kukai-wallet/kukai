import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'delegatorName'
})
export class DelegatorNamePipe implements PipeTransform {
    map: Map<string, string> = new Map([
        ['tz1TDSmoZXwVevLTEvKCTHWpomG76oC9S2fJ', 'Tezos Community'],
        ['tz1eEnQhbwf6trb8Q8mPb2RaPkNk2rN7BKi8', 'Cryptium Labs'],
        ['tz1abTjX2tjtMdaq5VCzkDtBnMSCFPW2oRPa', 'TEZ Rocket'],
        ['tz1NortRftucvAkD1J58L32EhSVrQEWJCEnB', 'Bake’n’Rolls'],
        ['tz1bHzftcTKZMTZgLLtnrXydCm6UEqf4ivca', 'Tezos Vote'],
        ['tz1LLNkQK4UQV6QcFShiXJ2vT2ELw449MzAA', 'TezoSteam'],
        ['tz1Xek93iSXXckyQ6aYLVS5Rr2tge2en7ZxS', 'XTZ Delegate'],
        ['tz1TcH4Nb3aHNDJ7CGZhU7jgAK1BkSP4Lxds', 'XTZ Antipodes'],
        ['tz1fZ767VDbqx4DeKiFswPSHh513f51mKEUZ', 'Tezos Bakery'],
        ['tz1YTyvABUyhE7JHpxMVBVqjZnZM4ofMrWKE', 'Tezos Delegate EU'],
        ['tz1UUgPwikRHW1mEyVZfGYy6QaxrY6Y7WaG5', 'Tez Patisserie'],
        ['tz1PesW5khQNhy4revu2ETvMtWPtuVyH2XkZ', 'Tz Dutch'],
        ['tz1WpeqFaBG9Jm73Dmgqamy8eF8NWLz9JCoY', 'Staking Facilities'],
        ['tz1iZEKy4LaAjnTmn2RuGDf2iqdAQKnRi8kY', 'Tezzigator'],
        ['tz1WCd2jm4uSt4vntk4vSuUWoZQGhLcDuR9q', 'Happy Tezos'],
        ['tz1hThMBD8jQjFt78heuCnKxJnJtQo9Ao25X', 'Tezos Chef'],
        ['tz1L3vFD8mFzBaS8yLHFsd7qDJY1t276Dh8i', 'Zednode'],
        ['tz1iLbZZ9uoRuVJCrZ9ZwiJMpfzhy3c67mav', 'AirBie'],
        ['tz1ZTG13gkvouxSANka3HG3uys8C5gu3DPXZ', 'Just a Baker'],
        ['tz3bEQoFCZEEfZMskefZ8q8e4eiHH1pssRax', 'Ceibo XTZ'],
        ['tz1YKh8T79LAtWxX29N5VedCSmaZGw9LNVxQ', 'TezosBr'],
        ['tz1VYQpZvjVhv1CdcENuCNWJQXu1TWBJ8KTD', 'Tezos Tokyo'],
        ['tz1PriNQyDC7d5ccPAD96ugujYy5YbdGLdQ5', 'Tezos Baker JP'],
        ['tz1Tnjaxk6tbAeC2TmMApPh8UsrEVQvhHvx5', 'Crypto Delegate'],
        ['tz1RCFbB9GpALpsZtu6J58sb74dm8qe6XBzv', 'Staked'],
        ['tz1Yc6ATtfUJyDjHwJ8WoVL22sJueDenueke', 'TezDele Baker A'],
        ['tz1SdwBHocSrcuMFNLPUg4LPRfx9eaqjVUEL', 'TezDele Baker B'],
        ['tz1YvG6poSGhPLTdzbzCmqShMndzoyhyVg7J', 'Tezos Baking Club'],
        ['tz1Z1WwoqgRFbLE3YNdYRpCx44NSfiMJzeAG', 'Bakemon'],
        ['tz1iMAHAVpkCVegF9FLGWUpQQeiAHh4ffdLQ', 'Wetez Wallet'],
        ['tz1Lhf4J9Qxoe3DZ2nfe8FGDnvVj7oKjnMY6', 'Tez Baker'],
        ['tz1Suih9uWEnubDeqCTCEfueSCGWYohjyaA5', 'XTZ Black'],
        ['tz1eZwq8b5cvE2bPKokatLkVMzkxz24z3Don', 'You Loaf We Bake'],
        ['tz1hAYfexyzPGG6RhZZMpDvAHifubsbb6kgn', 'Tezos Suisse'],
        ['tz1S1Aew75hMrPUymqenKfHo8FspppXKpW7h', 'Tezos Aus'],
        ['tz1YdCPrYbksK7HCoYKDyzgfXwY16Fy9rrGa', 'Norn Delegate'],
        ['tz1SohptP53wDPZhzTWzDUFAUcWF6DMBpaJV', 'Hayek Lab'],
        ['tz1aRhFErGMgL57DYHMT1vYwv7PzsJN1chrk', 'Baked Tezos'],
        ['tz1b5ppWdFzLHV2i11WcvM7bYVQbQC4K6ZVM', 'TeZetetic'],
        ['tz1NqKH9D5HdfvoEQssMS5Up13CVypVxLA1k', 'Cypher Baker'],
        ['tz1PYLN9TsKZHfn2GtrXnxkeGvahmYdBTG5v', 'Tezos Bakes'],
        ['tz1Zhv3RkfU2pHrmaiDyxp7kFZpZrUCu1CiF', 'TZ Bake'],
        ['tz1Vd1rXpV8hTHbFXCXN3c3qzCsgcU5BZw1e', 'Tz Node'],
        ['tz1fP9PoNWMpAaiPcBEb1gqQTskUAFNDiWD4', 'Tezocracy'],
        ['tz1LBEKXaxQbd5Gtzbc1ATCwc3pppu81aWGc', 'Tez Baking'],
        ['tz1bkg7rynMXVcjomoe3diB4URfv8GU2GAcw', 'Tz Bank'],
        ['tz1Lh9jeLSWDHYy8AshvG2dpNQseDaHg7cms', 'Tezos Spanish'],
        ['tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1', 'Hyper Blocks Pro'],
        ['tz1WnfXMPaNTBmH7DBPwqCWs9cPDJdkGBTZ8', 'Tezos HODL'],
        ['tz1go7f6mEQfT2xX2LuHAqgnRGN6c2zHPf5c', 'Stakery'],
        ['tz1bakeKFwqmtLBzghw8CFnqFvRxLj849Vfg', 'Tez Milk'],
        ['tz1eFXLaCUcKbhXkLBGUGMGNY9tKHjWGG25V', 'Tezos Node Spain'],
        ['tz1ZQppA6UerMz5CJtGvZmmB6z8L9syq7ixu', 'First Block'],
        ['tz1QGZ3dD2YpRKZ4APeso6EXTeyCUUkw6MQC', 'Tezos BC'],
        ['tz1NXPdPC2DfyA5ohitnS6ryqrDKbFJeu5Nn', 'Tez Boss'],
        ['tz1Z3KCf8CLGAYfvVWPEr562jDDyWkwNF7sT', 'Hot Stake'],
        ['tz1KfEsrtDaA1sX7vdM4qmEPWuSytuqCDp5j', 'XTZ Master'],
        ['tz1TgvirXEwVJPg1cCrxT9zFubdzw7Ng6Ke9', 'Tezos Moon'],
        ['tz2LBtbMMvvguWQupgEmtfjtXy77cHgdr5TE', 'Tez Central'],
        ['tz1ZKi4VrDMEQpypn2NTn9pPbZL3xLRkETLA', 'XTZ Baker'],
        ['tz1MowoYvqgxhKToQMAmGgTtjfZcRfS733JY', 'Stake Bake'],
        ['tz1RV1MBbZMR68tacosb7Mwj6LkbPSUS1er1', 'Baking Tacos'],
        ['tz1aiYKXmSRckyJ9EybKmpVry373rfyngJU8', 'View Nodes'],
        ['tz1PeZx7FXy7QRuMREGXGxeipb24RsMMzUNe', 'Tezos Panda'],
        ['tz1bTArEJxjYZKdXsMwLWixtpTnXNq6EZydC', 'Stack Tezos'],
        ['tz1d6Fx42mYgVFnHUW8T8A7WBfJ6nD9pVok8', 'My Tezos Baking']
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
