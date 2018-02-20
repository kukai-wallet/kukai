import { WalletAdapter } from './wallet-adapter';
export class Wallet {
    private walletAdapter = new WalletAdapter();
    private mnemonic: string;
    private passphrase: string;
    private sk: string;
    private pk: string;
    private pkh: string;
    constructor() {
        this.setMnemonic(this.walletAdapter.generateMnemonic());
    }
    setMnemonic(mnemonic: string) {
        this.mnemonic = mnemonic;
    }
    getMnemonic(): string {
        return this.mnemonic;
    }
    setKeyPair() {
        const keyPair = this.walletAdapter.keyPairFromMnemonic(this.mnemonic);
        this.setSk(keyPair.sk);
        this.setPk(keyPair.pk);
        this.setPkh(keyPair.pkh);
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
    setPassphrase(pwd: string) {
        this.passphrase = pwd;
    }
    getPassphrase(): string {
        return this.passphrase;
    }
}
