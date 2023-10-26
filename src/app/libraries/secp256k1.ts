import * as bip39 from 'bip39';
import { base58encode, base58decode, prefix as _prefix } from './common';
import { entropyToMnemonic, mnemonicToEntropy, validBase58string, validMnemonic } from './utils';

function getShiftedWord(word: string) {
  const mnemonicWordIndexMap: Record<string, number> = {};
  bip39.wordlists.english.forEach((word, index) => (mnemonicWordIndexMap[word] = index));
  const index = mnemonicWordIndexMap[word];
  if (index === undefined) {
    throw new Error('Invalid word to shift');
  }
  const checksumByte = index % 256;
  const newIndex = index - checksumByte + ((checksumByte + 128) % 256);
  return bip39.wordlists.english[newIndex];
}

// We allow users to export their Social Login secret keys as a mnemonic, but
// these are tz2 addresses. Most Tezos wallets do not support tz2 so we do not
// want users to try to import these mnemonics in other wallets and get the
// wrong key so we offset the last byte to break the checksum. When we
// import these keys we must revert that behavior.
function shiftChecksum(mnemonic: string) {
  let isValidMnemonic = 0;
  if (mnemonic.split(' ').length !== 24) {
    throw new Error('Invalid length');
  }
  validMnemonic(mnemonic) ? isValidMnemonic++ : null;
  const words = mnemonic.split(' ');
  words[23] = getShiftedWord(words[23]);
  mnemonic = words.join(' ');
  validMnemonic(mnemonic) ? isValidMnemonic++ : null;
  if (isValidMnemonic !== 1) {
    throw new Error('Invalid mnemonic');
  }
  return mnemonic;
}
function spskToShiftedMnemonic(sk: string): string {
  const entropy = base58decode(sk, _prefix.spsk);
  const mnemonic = entropyToMnemonic(entropy);
  return shiftChecksum(mnemonic);
}
function mnemonicToSpsk(mnemonic: string): string {
  return base58encode(mnemonicToEntropy(mnemonic), _prefix.spsk);
}

function shiftedMnemonicToMnemonic(mnemonic: string): string {
  return shiftChecksum(mnemonic);
}

const validSecretKey = (sk: string): boolean => {
  return sk && sk.length === 54 && validBase58string(sk, 'spsk');
};

export { spskToShiftedMnemonic, shiftedMnemonicToMnemonic, validSecretKey, mnemonicToSpsk };
