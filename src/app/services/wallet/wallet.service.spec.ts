// unit-testing framework
import { TestBed } from '@angular/core/testing';
import { WalletTools } from '../../../../spec/mocks/library.mock';

// class under inspection
import { WalletService } from './wallet.service';

// class dependencies
import { OperationService } from '../operation/operation.service';
import { EncryptionService } from '../encryption/encryption.service';
import * as bip39 from 'bip39';
import { utils, hd } from '@tezos-core-tools/crypto-utils';

// mocking
import { KeyPair, http_imports, translate_imports, rx, walletsrv_providers} from '../../../../spec/helpers/service.helper';
import { WalletObject, LegacyWalletV1, LegacyWalletV2 } from './wallet';

/**
 * Suite: WalletService
 */
describe('[ WalletService ]', () => {
	let service: WalletService;
  	let encrypt: EncryptionService;
	let ops: OperationService;

	// mocking tools
	const walletgen: WalletTools = new WalletTools();
	const mockwallet: WalletObject = walletgen.generateWalletV1();

  	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [http_imports, translate_imports],
			providers: [ walletsrv_providers ],

		});

		// inject services
		  service = TestBed.inject(WalletService);
		  encrypt = TestBed.inject(EncryptionService);
		  ops = TestBed.inject(OperationService);

		// create mock wallet data
		  service.wallet = mockwallet;
	});

	afterEach(() => {
		// reset mock wallet data
		service.wallet = mockwallet;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should get primary pkh salt', () => {
		let salt;
		if (service.wallet instanceof LegacyWalletV1) {
			salt = service.wallet.salt;
		}
		expect(salt).toEqual('U2R9zKaKW6EjngeL');
	});

	describe('> Create Wallet(s)', () => {
		let mnemonic;

		beforeEach(() => {
			mnemonic = 'code finish repair shine click deliver guide argue cheap accident adapt dust absurd obey fresh';
		});

		it('should create wallet', () => {
			spyOn(utils, 'generateMnemonic').and.returnValue(mnemonic);
			const x = service.createNewWallet();
			expect(x).toBe(mnemonic);
		});

		/** Broken in 1.3.0 update
		it('should create an encrypted wallet', () => {

		})
		*/
	});

	/** TODO
	describe('{ @todo: should return keys }', () => {
		beforeEach(() => {

		})

		it('@todo: should return full wallet keys', () => {

		})

		it('@todo: should return null full wallet if keys don\'t match', () => {
			let keys = service.getKeys('');
			expect(keys).toBe(null);
		})


		it('@todo: should return w/null sk if view-only wallet', () => {
			service.wallet.type = 1;
			console.log('pk: ' + service.wallet.seed)

		})
	})
	describe('{ @todo: should store wallet data }', () => {
		beforeEach(() => {

		})

		it('@todo: should store wallet', () => {

		})

		it('@todo: should load stored wallet', () => {

		})

		it('@todo: should export the keystore', () => {

		})

		it('@todo: should clear wallet current wallet', () => {

		})
	})
	*/
});
