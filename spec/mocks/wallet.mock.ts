import { WalletObject } from './../../src/app/services/wallet/wallet';
import { WalletTools } from './library.mock';

export class WalletServiceStub {
	wallet: WalletObject;
	emptyWallet(walletType: number = 1) {
		if (walletType === 1) {
			return new WalletTools().generateWalletV1(undefined, undefined, undefined, undefined, 0);
		} else if (walletType === 2) {
			return new WalletTools().generateWalletV2(undefined, undefined, undefined, undefined, 0);
		}
		return null;
	}
	storeWallet(): string {
		return 'Great Job!';
	}

	exportKeyStore(): string {
	return 'Great Job!';
}
}
