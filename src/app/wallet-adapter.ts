import * as lib from '../assets/js/main.js';
import * as bip39 from 'bip39';
import * as sodium from 'libsodium-wrappers';
import * as Rijndael from 'rijndael-js';
// import * as bs58check from 'bs58check';
import * as pbkdf2 from 'pbkdf2';
import * as crs from 'crypto-random-string';

export class WalletAdapter {
    generateMnemonic() {
        const mnemonic = bip39.generateMnemonic();
        if (bip39.validateMnemonic(mnemonic)) {
            return mnemonic;
        }
        return null;
    }
    keyPairFromMnemonic(mnemonic: string) {
        return lib.eztz.crypto.generateKeys(mnemonic, '');
    }
}
