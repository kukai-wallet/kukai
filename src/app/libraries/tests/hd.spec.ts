import { seedToKeyPair, keyPairFromAccountIndex } from '../hd';
import { mnemonicToSeed, secretKeyToKeyPair } from '../utils';

const ed25519Ledger = {
  mnemonic:
    'gym exact clown can answer hope sample mirror knife twenty powder super imitate lion churn almost shed chalk dust civil gadget pyramid helmet trade',
  derivations: [
    {
      path: "44'/1729'/0'/0'",
      pkh: 'tz1TyyX7U6r6tB1uSS4aUnfKX9rj3y9NCEVL'
    },
    {
      path: "44'/1729'/1'/0'",
      pkh: 'tz1WCBJKr1rRivyCnN9hREpRAMqrLdmqDcym'
    },
    {
      path: "44'/1729'/2147483647'/0'",
      pkh: 'tz1WKKg7eN7rADsFrfzZmRrEECfBcZbXKtvS'
    },
    {
      path: "44'/1729'/1'/1'/1'",
      pkh: 'tz1dAgezeiGexQkgfbPm8MgP1XTqA4rJRt3C'
    }
  ],
  invalidDerivations: [
    {
      path: "44'/1729'/2147483648'/0'",
      error: 'Invalid derivation path. Out of bound.'
    },
    {
      path: "44'/1729'",
      error: 'Invalid derivation path. Only hardened derivation paths on Tezos domain space is supported.'
    },
    {
      path: "44'/1729'/0",
      error: 'Invalid derivation path. Only hardened derivation paths on Tezos domain space is supported.'
    }
  ]
};

const seed = mnemonicToSeed(ed25519Ledger.mnemonic, null, true);

describe('#seedToKeyPair', () => {
  ed25519Ledger.derivations.forEach((derivation) => {
    it('given %p as derivation path, returns %p', () => {
      expect(seedToKeyPair(seed, derivation.path).pkh).toEqual(derivation.pkh);
    });
  });
  ed25519Ledger.invalidDerivations.forEach((derivation) => {
    it('given %p as derivation path, fail with %p', () => {
      let error = '';
      try {
        seedToKeyPair(seed, derivation.path);
      } catch (e) {
        error = e.message;
      }
      expect(error).toBe(derivation.error);
    });
  });
});

describe('#seedToKeyPair', () => {
  const keyPair = {
    pk: 'edpkufQ3nNdMJBkgfzCgCLmk1tbfLsqK7W8AR37KiCe7tDVvmsroHh',
    pkh: 'tz1WCBJKr1rRivyCnN9hREpRAMqrLdmqDcym',
    sk: 'edskS31ZXzfzGBi1jEigpPvaWwVzwWCX3PNhx8FUpwY65SZC2oVmZ4iCHqwXCC6LBiGgdknhzJ6xAzHbpwQMEH3KKVjZ4aL4kw'
  };
  const derivedKeyPair = keyPairFromAccountIndex(seed, 1);
  it('should return a key pair', () => {
    expect(derivedKeyPair).toEqual(keyPair);
  });
  it('should derive everything from sk', () => {
    expect(secretKeyToKeyPair(derivedKeyPair.sk)).toEqual(derivedKeyPair);
  });
});
