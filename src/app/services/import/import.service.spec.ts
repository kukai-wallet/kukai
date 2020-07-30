// suite unit-test frameworks
import { HttpClientTestingModule } from '@angular/common/http/testing';

// class under inspection
import { ImportService } from './import.service';

// class dependencies
import { HttpClientModule } from '@angular/common/http';
import { WalletService } from '../wallet/wallet.service';
import { http_imports, translate_imports, balancesrv_providers, rx} from '../../../../spec/helpers/service.helper';

// provider sub-dependencies
import { TranslateService, TranslateLoader, TranslateFakeLoader, TranslateModule } from '@ngx-translate/core';
import { EncryptionService } from '../encryption/encryption.service';
import { OperationService } from '../operation/operation.service';
import { TestBed } from '@angular/core/testing';
import { ErrorHandlingPipe } from '../../pipes/error-handling.pipe';
import { KeyPair } from '../../interfaces';
import { MessageService } from '../message/message.service';
import { BalanceService } from '../balance/balance.service';
import { CoordinatorService } from '../coordinator/coordinator.service';
import { TzrateService } from '../tzrate/tzrate.service';
import { ActivityService } from '../activity/activity.service';
import { DelegateService } from '../delegate/delegate.service';
import { FullWallet, LegacyWalletV2, HdWallet, LegacyWalletV3 } from '../wallet/wallet';
import { ConseilService } from '../conseil/conseil.service';




/**
 * Suite: ImportService
 */
describe('[ ImportService ]', () => {
	// class under inspection
	let service: ImportService;

	// class dependencies
	/*let httpMock: HttpTestingController;
	let translate: TranslateService;
	let errorHandlingPipe: ErrorHandlingPipe;*/

	let wallet: WalletService;
	let operation: OperationService;
	let conseil: ConseilService;


	// testing data
	const encrypted_seedkey = '66746740b4b925d2a336744339b31bf4850357a01a7d309e79604fe95fc11dd6';
	const mnemonic = 'inhale valley fog rubber sun shiver glory fancy total accident hospital crack home build forest';
	const passphrase = 'Upward&Onward';
	const publickeyhash = 'tz1WzGiA46TxyZdUHGJgUYHaR5HyUyH8Rssn';
	const salt = 'WzGiA46TxyZdUHGJ';
	const hd = {
		mnemonic: 'icon salute dinner depend radio announce urge hello danger join long toe ridge clever toast opera spot rib outside explain mixture eyebrow brother share',
		pkh: 'tz1TogVQurVUhTFY1d62QJGmkMdEadM9MNpu',
		pk: 'edpkvXyJHwuFRkngpcPyYWndZhAqf72owWrMnkkNsBoBkS54V4GJrM',
		password: 'KukaiTestWallet',
		keyStore: {
			provider: 'Kukai',
    		version: 3,
			walletType: 4,
			encryptedSeed: '90f57ef8f82e9acfa11a44e02aefaa8444596c3a8d2aa2aeaecfbb51187484a0354bf8a6c009bb4836716dc030d790978948044454dd85e6e2f2fb6284ac2c50==a533b34b90fcf71742a0d6abc9eaed15',
			encryptedEntropy: '8178b31d4c23c4e07f2fdc024966a76ca7630c4607018847a3aec315a765e17b==5d0c16c5f2207409f67f259110b9ca93',
			iv: 'aff0bfd4ccdab8ae3e35eeab9e7af782'
		}
	};
	const legacyV3 = {
		mnemonic: 'icon salute dinner depend radio announce urge hello danger join long toe ridge clever toast opera spot rib outside explain mixture eyebrow brother share',
		pkh: 'tz1UTA4f3Hx7udXeqqu3N2EfdpiHrKuXpWdi',
		pk: 'edpktxWNPfnvZpa9vLDDpoudNNCYWmWWpnUsWkwQitUfMkgZgC4SuN',
		password: 'KukaiTestWallet',
		keyStore: {
			provider: 'Kukai',
			version: 3,
			walletType: 0,
			encryptedSeed: '27588fe17f8905122f46878b77a62fdbf648e43c538367edff10634dd103d02e==d42fb4c1cd622241e27c1f12fe71871a',
			encryptedEntropy: '0896d126f7e51d17d04099a17e03adf034bf555c71c82bd23981375dc3572057==b6664bd3f0ef927acf72d80ef70f651e',
			iv: '66d7cd21e79cea95079200bd89e6ed03'
		}
	};
//	let isJson: boolean = true;
// tslint:disable-next-line:max-line-length
//	let walletJson: string = JSON.stringify({"provider": "Kukai","version": 1,"walletType": 0,"pkh": "tz1WzGiA46TxyZdUHGJgUYHaR5HyUyH8Rssn","encryptedSeed": "66746740b4b925d2a336744339b31bf4850357a01a7d309e79604fe95fc11dd6", iv:});
	const seedkey = 'edskReZHRkGSEGDAKtrNWTo6Kd4L9tv7QwDEbAxBLqQKBavhBfTUzYy7BEgELbPW5LJUN4X1YZqAdmbiJXhRgsFtbBbsJWwS6Y';
	const publickey = 'edpkv5PQ1dkf5avSEEPCn5oUe9cYmkbpbizuEo4SpybauNfSQ9Umyh';
	let keys: KeyPair;

	beforeEach(() => {
		TestBed.configureTestingModule({
		imports: [
			HttpClientModule,
			HttpClientTestingModule,
			TranslateModule.forRoot( {
			loader: {
				provide: TranslateLoader,
				useClass: TranslateFakeLoader
			}
			})
		],
		providers: [
			ImportService,
			WalletService,
			MessageService,
			TranslateService,
			BalanceService,
			CoordinatorService,
			OperationService,
			EncryptionService,
			ErrorHandlingPipe,
			TzrateService,
			ActivityService,
			DelegateService
		]
		});

		// inject services
		service = TestBed.inject(ImportService);
		wallet = TestBed.inject(WalletService);
		operation = TestBed.inject(OperationService);
		conseil = TestBed.inject(ConseilService);

		//spyOn(service, 'importWalletData');
		//spyOn(service, 'importWalletFromPkh')
		spyOn(console, 'log');

	});

	afterEach(() => {
		keys = {sk: null, pk: null, pkh: null};
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});


	describe('> Import Wallet', () => {
		let walletdata: string;
		let password: string;
		let pkh: string;

		beforeEach(() => {
			// full wallet data
			walletdata = JSON.stringify({'provider': 'Kukai', 'version': 2, 'walletType': 0,
				'encryptedSeed': '64324eedf2604c5af143f32ceb6a1beb9e717f745b209504718ec8cc42211e44==fc09b629d9ee0aeefac57d2e066914c2',
				'iv': 'b838931b9b7507fb8d5be5ecef08c2f5'});

			password = 'ILoveKukai!2019';
			pkh = 'tz1NPLZjpov8oFBT3qfdWBedktALQZjs5Hkt';

		});
		describe('> Import Full Wallet', () => {
			let walletdata2: string;
			let password2: string;
			// let pkh: string;

			beforeEach(() => {
				// full wallet data
				walletdata2 = JSON.stringify({'provider': 'Kukai', 'version': 2, 'walletType': 0,
					'encryptedSeed': '64324eedf2604c5af143f32ceb6a1beb9e717f745b209504718ec8cc42211e44==fc09b629d9ee0aeefac57d2e066914c2',
					'iv': 'b838931b9b7507fb8d5be5ecef08c2f5'});

				password2 = 'ILoveKukai!2019';
				pkh = 'tz1NPLZjpov8oFBT3qfdWBedktALQZjs5Hkt';

			});

			it('should import full wallet v2', async () => {
				await service.importWalletFromJson(walletdata2, password2);
				console.log(wallet.wallet);

				// expect a full wallet
				expect(wallet.wallet instanceof LegacyWalletV2).toBeTruthy();

				// expect encryption version 2
				if (wallet.wallet instanceof LegacyWalletV2) {
					expect(wallet.wallet.IV).toBe('b838931b9b7507fb8d5be5ecef08c2f5');

					// expect seed to be '64324eedf2604c5af143f32ceb6a1beb9e717f745b209504718ec8cc42211e44==fc09b629d9ee0aeefac57d2e066914c2'
					expect(wallet.wallet.encryptedSeed).toBe('64324eedf2604c5af143f32ceb6a1beb9e717f745b209504718ec8cc42211e44==fc09b629d9ee0aeefac57d2e066914c2');
				}

				// expect pkh to be 'tz1NPLZjpov8oFBT3qfdWBedktALQZjs5Hkt'
				expect(wallet.wallet.implicitAccounts[0].pkh).toBe('tz1NPLZjpov8oFBT3qfdWBedktALQZjs5Hkt');

			});
		});

		describe('> Handle Importing Bad Data', async () => {
			beforeEach(() => {
				wallet.wallet = null;
			});
			it('should throw an error', async () => {
				await service.importWalletFromJson('baddata', password);
				expect(wallet.wallet).toBeFalsy();
			});
			it('should throw an error', async () => {
				const ans = await service.importWalletFromJson(JSON.stringify(hd.keyStore), 'wrong pwd');
				expect(ans).toBeFalsy();
				expect(wallet.wallet).toBeFalsy();
			});
			it('should throw an error', async () => {
				const ans = await service.importWalletFromJson(JSON.stringify(legacyV3.keyStore), 'wrong pwd');
				expect(ans).toBeFalsy();
				expect(wallet.wallet).toBeFalsy();
			});
		});
		describe('> Legacy v3', async () => {
			beforeEach(() => {
				spyOn(conseil, 'getContractAddresses').and.callFake(async function() { return ['KT1KwPDCVmkrXQ2ZKWhVAiiFzYxiXCEyhE7U']; });
				spyOn(conseil, 'accountInfo').and.callFake(function() { return rx.Observable.of(0);	});
				wallet.wallet = null;
			});
			it('should import Legacy v3 wallet', async () => {
				const success = await service.importWalletFromJson(JSON.stringify(legacyV3.keyStore), legacyV3.password);
				expect(success).toBeTruthy();
				expect(wallet.wallet).toBeTruthy();
				expect(wallet.wallet instanceof LegacyWalletV3).toBeTruthy();
				if (wallet.wallet instanceof LegacyWalletV3) {
					expect(wallet.wallet.IV).toBe(legacyV3.keyStore.iv);
					expect(wallet.wallet.encryptedSeed).toBe(legacyV3.keyStore.encryptedSeed);
					expect(wallet.wallet.encryptedEntropy).toBe(legacyV3.keyStore.encryptedEntropy);
				}
				expect(wallet.wallet.implicitAccounts[0].activitiesCounter).toBe(-1);
				expect(wallet.wallet.implicitAccounts[0].pkh).toBe('tz1UTA4f3Hx7udXeqqu3N2EfdpiHrKuXpWdi');
				expect(wallet.wallet.implicitAccounts[0].address).toBe('tz1UTA4f3Hx7udXeqqu3N2EfdpiHrKuXpWdi');
				expect(wallet.wallet.implicitAccounts[0].pk).toBe('edpktxWNPfnvZpa9vLDDpoudNNCYWmWWpnUsWkwQitUfMkgZgC4SuN');
				expect(wallet.wallet.implicitAccounts[0].derivationPath).not.toBeDefined();
				expect(wallet.wallet.implicitAccounts[1]).not.toBeDefined();

				expect(wallet.wallet.implicitAccounts[0].originatedAccounts[0].address).toBe('KT1KwPDCVmkrXQ2ZKWhVAiiFzYxiXCEyhE7U');
				expect(wallet.wallet.implicitAccounts[0].originatedAccounts[0].pkh).toBe('tz1UTA4f3Hx7udXeqqu3N2EfdpiHrKuXpWdi');
				expect(wallet.wallet.implicitAccounts[0].originatedAccounts[0].pk).toBe('edpktxWNPfnvZpa9vLDDpoudNNCYWmWWpnUsWkwQitUfMkgZgC4SuN');
				expect(wallet.wallet.implicitAccounts[0].originatedAccounts[1]).not.toBeDefined();
			});
		});
		describe('> HD', async () => {
			let numberOfAccounts = 2;
			beforeAll(() => {
			});
			beforeEach(() => {
				spyOn(conseil, 'getContractAddresses').and.callFake(async function() { return []; });
				spyOn(conseil, 'accountInfo').and.callFake(function() { return rx.Observable.of(numberOfAccounts--); });
			});
			it('should import HD wallet', async () => {
				const success = await service.importWalletFromJson(JSON.stringify(hd.keyStore), hd.password);
				expect(success).toBeTruthy();
				expect(wallet.wallet).toBeTruthy();
				expect(wallet.wallet instanceof HdWallet).toBeTruthy();
				if (wallet.wallet instanceof HdWallet) {
					expect(wallet.wallet.IV).toBe(hd.keyStore.iv);
					expect(wallet.wallet.encryptedSeed).toBe(hd.keyStore.encryptedSeed);
					expect(wallet.wallet.encryptedEntropy).toBe(hd.keyStore.encryptedEntropy);
					expect(await wallet.revealMnemonicPhrase(hd.password)).toEqual(hd.mnemonic);
				}
				expect(wallet.wallet.implicitAccounts[0].activitiesCounter).toBe(-1);
				expect(wallet.wallet.implicitAccounts[0].pkh).toBe('tz1TogVQurVUhTFY1d62QJGmkMdEadM9MNpu');
				expect(wallet.wallet.implicitAccounts[0].address).toBe('tz1TogVQurVUhTFY1d62QJGmkMdEadM9MNpu');
				expect(wallet.wallet.implicitAccounts[0].pk).toBe('edpkvXyJHwuFRkngpcPyYWndZhAqf72owWrMnkkNsBoBkS54V4GJrM');
				expect(wallet.wallet.implicitAccounts[0].derivationPath).toBe('44\'/1729\'/0\'/0\'');
				expect(wallet.wallet.implicitAccounts[1]).toBeDefined();
				expect(wallet.wallet.implicitAccounts[1].pkh).toBe('tz1dXCZTs4pRTVvoXJXNRUmrYqtCde4fdP8N');
				expect(wallet.wallet.implicitAccounts[1].address).toBe('tz1dXCZTs4pRTVvoXJXNRUmrYqtCde4fdP8N');
				expect(wallet.wallet.implicitAccounts[1].pk).toBe('edpkvaNoKcTrQ8jBVHkVUzwZnLAaZT98ALxucqcfmkPAWGXuRVM9Db');
				expect(wallet.wallet.implicitAccounts[1].derivationPath).toBe('44\'/1729\'/1\'/0\'');
				expect(wallet.wallet.implicitAccounts[2]).not.toBeDefined();

			});
		});
	});
});
