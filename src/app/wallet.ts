import * as tzlib from '../assets/js/main.js';
export class Wallet {
    mnemonic: string;
    passphrase: string;
    sk: string;
    pk: string;
    pkh: string;
    constructor() {
        const walletObject = tzlib.eztz.crypto.generateKeysNoSeed();
        this.setSk(walletObject.sk);
        this.setPk(walletObject.pk);
        this.setPkh(walletObject.pkh);
    }
    setMnemonic(mnemonic: string) {
        this.mnemonic = mnemonic;
    }
    getMnemonic(): string {
        return this.mnemonic;
    }
    setSk(sk: string) {
        this.sk = sk;
    }
    getSk(): string {
        return this.sk;
    }
    setPk(pk: string) {
        this.pk = pk;
    }
    getPk(): string {
        return this.pk;
    }
    setPkh(pkh: string) {
        this.pkh = pkh;
    }
    getPkh(): string {
        return this.pkh;
    }
}
