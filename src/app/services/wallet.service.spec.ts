// unit-testing framework
import { TestBed } from '@angular/core/testing';
import { WalletTools } from '../../../spec/mocks/library.mock';

// class under inspection
import { WalletService } from './wallet.service';

// class dependencies
import { OperationService } from './operation.service';
import { EncryptionService } from './encryption.service';
import * as bip39 from 'bip39';

// mocking
import { KeyPair, Balance, http_imports, translate_imports, rx, walletsrv_providers, Wallet} from '../../../spec/helpers/service.helper'

/**
 * Suite: WalletService
 */
describe('[ WalletService ]', () => {
	let service: WalletService;
  	let encrypt:EncryptionService;
	let ops:OperationService;
	
	// mocking tools
	let walletgen:WalletTools = new WalletTools();
	let mockwallet:Wallet = walletgen.generateWallet('encryptedsecretseed', 0, ['tz1UtdtjoFuTVgPjG6cXY5JZnZv1yieJj3Fe', 'KT1contract1', 'KT1contract2']);

  	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [http_imports, translate_imports],
			providers: [ walletsrv_providers ],
			
		});

		// inject services 
		  service = TestBed.get(WalletService);
		  encrypt = TestBed.get(EncryptionService)
		  ops = TestBed.get(OperationService);

		// create mock wallet data
		  service.wallet = mockwallet;
	});
	  
	afterEach(() => {
		// reset mock wallet data
		service.wallet = mockwallet;
	})

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should get primary pkh salt', () => {
		let salt = service.getSalt(service.wallet.accounts[0].pkh)
		expect(salt).toEqual('UtdtjoFuTVgPjG6c')
	})
	it('should get index of pkh', () => {
		let index = service.getIndexFromPkh(service.wallet.accounts[0].pkh);
		expect(index).toEqual(0)
	})

	describe('> Create Wallet(s)', () => {
		let mnemonic;

		beforeEach(() => {
			mnemonic = 'code finish repair shine click deliver guide argue cheap accident adapt dust absurd obey fresh';
		})

		it('should create wallet', () => {
			spyOn(bip39, 'generateMnemonic').and.returnValue(mnemonic);
			let x = service.createNewWallet()
			expect(x).toBe(mnemonic);
		})

		/** Broken in 1.3.0 update 
		it('should create an encrypted wallet', () => {

		})
		*/
	})
	
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