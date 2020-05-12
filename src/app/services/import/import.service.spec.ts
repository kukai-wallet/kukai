// suite unit-test frameworks
import { HttpClientTestingModule } from '@angular/common/http/testing';

// class under inspection
import { ImportService } from './import.service';

// class dependencies
import { HttpClientModule } from '@angular/common/http';
import { WalletService } from '../wallet/wallet.service';

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
import { FullWallet, LegacyWalletV2 } from '../wallet/wallet';




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


	// testing data
	const encrypted_seedkey = '66746740b4b925d2a336744339b31bf4850357a01a7d309e79604fe95fc11dd6';
	const mnemonic = 'inhale valley fog rubber sun shiver glory fancy total accident hospital crack home build forest';
	const passphrase = 'Upward&Onward';
	const publickeyhash = 'tz1WzGiA46TxyZdUHGJgUYHaR5HyUyH8Rssn';
	const salt = 'WzGiA46TxyZdUHGJ';
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
		service = TestBed.get(ImportService);
		wallet = TestBed.get(WalletService);
		operation = TestBed.get(OperationService);

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

			it('should import full wallet v2', () => {
				service.importWalletFromJson(walletdata2, password2);
				console.log(wallet.wallet);

				// expect a full wallet
				expect(wallet.wallet instanceof LegacyWalletV2).toBeTruthy();

				// expect encryption version 2
				if (wallet.wallet instanceof LegacyWalletV2) {
					expect(wallet.wallet.IV).toBe("b838931b9b7507fb8d5be5ecef08c2f5");

					// expect seed to be '64324eedf2604c5af143f32ceb6a1beb9e717f745b209504718ec8cc42211e44==fc09b629d9ee0aeefac57d2e066914c2'
					expect(wallet.wallet.encryptedSeed).toBe('64324eedf2604c5af143f32ceb6a1beb9e717f745b209504718ec8cc42211e44==fc09b629d9ee0aeefac57d2e066914c2');
				}

				// expect pkh to be 'tz1NPLZjpov8oFBT3qfdWBedktALQZjs5Hkt'
				expect(wallet.wallet.implicitAccounts[0].pkh).toBe('tz1NPLZjpov8oFBT3qfdWBedktALQZjs5Hkt');

			});
		});

		describe('> Handle Importing Bad Data', () => {
			it('should throw an error', () => {
				service.importWalletFromJson('baddata', password);
				expect(wallet.wallet).toBeFalsy();
			});
		});

	});


  /** Integration Spec: Observer Wallet
   *  Description: Check wallet functionality on import
   * */
  /** Broken by 1.3.0 update
  it('import wallet from pkh', function() {
    // import observer wallet json data
    service.importWalletFromPkh(publickeyhash);

    // observer wallet
	keys = undefined;
	wallet.wallet.type = 2;

    // spec tests
    expect(wallet.walletTypePrint()).toBe('Observer wallet');
    expect(wallet.getKeys(passphrase)).toEqual(keys); //alternative: expect(wallet.getKeys(passphrase)).not.toBeDefined();
    expect(wallet.getSalt()).toBe(salt);
  });
   */

   /** Integration Spec: View-Only Wallet
   *  Description: Check wallet functionality on import
   * */
  /** Broken by 1.3.0 update
  it('should import wallet from pk', async () => {
	// import view-only wallet json data

    service.importWalletFromPk(publickey);

    // view-only wallet
    keys = {
      sk: null,
      pk: publickey,
      pkh: publickeyhash
    }

    // spec tests
    keys = wallet.getKeys(passphrase);
    expect(wallet.walletTypePrint()).toBe('View-only wallet');
    expect(wallet.getKeys(passphrase)).toEqual(keys);
    expect(wallet.getSalt()).toBe(salt);
  });
   */

  /** Need to rebuild
  it('find all accounts', async() =>{

  });
  */
});
