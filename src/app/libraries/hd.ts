import { sign as naclSign } from 'tweetnacl';
import { full as naclAuthFull } from 'tweetnacl-auth';
import { blake2b } from 'blakejs';
import { base58encode, prefix as _prefix } from './common';
import { KeyPair, Node } from './interfaces';

/*
    Hardened HD derivations for Tezos (bip32-ed25519)

    https://github.com/satoshilabs/slips/blob/master/slip-0010.md
    https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
    https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
    https://github.com/satoshilabs/slips/blob/master/slip-0044.md

    https://github.com/LedgerHQ/ledger-live-common/blob/master/src/derivation.js#L84
    m / 44' / 1729' / account_index' / 0'
*/

const deriveNode = (message: Buffer, key: Buffer): Node => {
  const hmac = naclAuthFull(message, key);
  return {
    privateKey: hmac.slice(0, 32),
    chainCode: hmac.slice(32)
  };
};

const deriveRootNode = (seed: Buffer): Node => {
  if (seed.length !== 64) {
    throw new Error('Invalid seed size');
  }
  const domainSeperator = Buffer.from('ed25519 seed');
  return deriveNode(seed, domainSeperator);
};

const deriveChildNode = (node: Node, index: number): Node => {
  const indexBuf: Buffer = Buffer.allocUnsafe(4);
  indexBuf.writeUInt32BE(index, 0);
  const message: Buffer = Buffer.concat([Buffer.alloc(1, 0), Buffer.from(node.privateKey), indexBuf]);
  return deriveNode(message, Buffer.from(node.chainCode));
};

const derivationPathToArray = (derivationPath: string): number[] => {
  derivationPath = derivationPath.replace('m/', '').replace(/'/g, 'h');
  if (!derivationPath.match(/^44h\/1(729)?(h\/[0-9]+)+h$/g)) {
    throw new Error('Invalid derivation path. Only hardened derivation paths on Tezos domain space is supported.');
  }
  return derivationPath.split('/').map((level: string) => {
    level = level.slice(0, -1);
    if (Number(level) >= Number('0x80000000')) {
      throw new Error('Invalid derivation path. Out of bound.');
    }
    return Number(level) + Number('0x80000000');
  });
};

const seedToKeyPair = (seed: Buffer, derivationPath: string): KeyPair => {
  const pathArray = derivationPathToArray(derivationPath);
  let node = deriveRootNode(seed);
  for (const index of pathArray) {
    node = deriveChildNode(node, index);
  }
  const { secretKey, publicKey } = naclSign.keyPair.fromSeed(Buffer.from(node.privateKey));
  return {
    sk: base58encode(secretKey, _prefix.edsk),
    pk: base58encode(publicKey, _prefix.edpk),
    pkh: base58encode(blake2b(publicKey, null, 20), _prefix.tz1)
  };
};

const keyPairFromAccountIndex = (seed: Buffer, accountIndex: number): KeyPair => {
  return seedToKeyPair(seed, `44h/1729h/${accountIndex}h/0h`);
};

export { seedToKeyPair, keyPairFromAccountIndex };
