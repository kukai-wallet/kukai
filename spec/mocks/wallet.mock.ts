import { Balance, Wallet, WalletType } from './interfaces.mock';

export class WalletServiceStub {
	wallet: Wallet;
	emptyWallet(type: WalletType): Wallet {
		return {
		  seed: null,
		  salt: null,
		  encryptionVersion: null,
		  type: type,
		  balance: this.emptyBalance(),
		  XTZrate: null,
		  accounts: []
		};
	  }
	  emptyBalance(): Balance {
		return {
		  balanceXTZ: null,
		  pendingXTZ: null,
		  balanceFiat: null,
		  pendingFiat: null
		};
	  }
	  storeWallet(): string {
		  return 'Great Job!';
	  }

	  exportKeyStore(): string {
		return 'Great Job!';
	}
}
