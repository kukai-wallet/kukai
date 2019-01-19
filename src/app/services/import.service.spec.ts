// suite unit-test frameworks
import { HttpTestingController, HttpClientTestingModule, TestRequest } from "@angular/common/http/testing";

// class under inspection
import { ImportService } from "./import.service";

// class dependencies
import { HttpClientModule } from "@angular/common/http";
import { WalletService } from "./wallet.service";

// provider sub-dependencies
import { TranslateService, TranslateLoader, TranslateFakeLoader, TranslateModule } from "@ngx-translate/core";
import { EncryptionService } from './encryption.service';
import { OperationService } from "./operation.service";
import { TestBed } from "@angular/core/testing";
import { ErrorHandlingPipe } from "../pipes/error-handling.pipe";
import { Account, Wallet, Balance, KeyPair } from "../interfaces";
import { MessageService } from "./message.service";
import { BalanceService } from "./balance.service";
import { CoordinatorService } from "./coordinator.service";
import { TzscanService } from "./tzscan.service";
import { TzrateService } from "./tzrate.service";
import { ActivityService } from "./activity.service";
import { DelegateService } from "./delegate.service";




/**
 * Suite: ImportService
 */
describe('[ ImportService ]', () => {
	// class under inspection
	let service: ImportService;

	// class dependencies
	let httpMock:HttpTestingController;
	let translate: TranslateService;
	let errorHandlingPipe: ErrorHandlingPipe;

	let wallet: WalletService;
	let operation: OperationService;


	// testing data
	let encrypted_seedkey: string = '66746740b4b925d2a336744339b31bf4850357a01a7d309e79604fe95fc11dd6';
	let mnemonic: string = 'inhale valley fog rubber sun shiver glory fancy total accident hospital crack home build forest';
	let passphrase: string = 'Upward&Onward';
	let publickeyhash: string = 'tz1WzGiA46TxyZdUHGJgUYHaR5HyUyH8Rssn';
	let salt: string = 'WzGiA46TxyZdUHGJ';
	let isJson: boolean = true;
	let walletJson: string = JSON.stringify({"provider": "Kukai","version": 1,"walletType": 0,"pkh": "tz1WzGiA46TxyZdUHGJgUYHaR5HyUyH8Rssn","encryptedSeed": "66746740b4b925d2a336744339b31bf4850357a01a7d309e79604fe95fc11dd6"});
	let seedkey: string = 'edskReZHRkGSEGDAKtrNWTo6Kd4L9tv7QwDEbAxBLqQKBavhBfTUzYy7BEgELbPW5LJUN4X1YZqAdmbiJXhRgsFtbBbsJWwS6Y';
	let publickey: string = 'edpkv5PQ1dkf5avSEEPCn5oUe9cYmkbpbizuEo4SpybauNfSQ9Umyh';
	let keys:KeyPair;
	
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
			TzscanService,
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

		spyOn(service, 'importWalletData');
		spyOn(service, 'importWalletFromPkh')
		spyOn(console, 'log');

	});

	afterEach(() => {
		keys = {sk: null, pk: null, pkh: null};
	})

	it('should be created', () => {
		expect(service).toBeTruthy();
	});


	describe('should import a wallet', () => {
		let walletdata: string;
		beforeEach(() => {
			walletdata = JSON.stringify({"provider": "Kukai","version": 1,"walletType": 0,"pkh": "tz1WzGiA46TxyZdUHGJgUYHaR5HyUyH8Rssn","encryptedSeed": "66746740b4b925d2a336744339b31bf4850357a01a7d309e79604fe95fc11dd6", iv: "testiv"});

		})


		/*
		it('should import wallet data', () => {       

		});
		*/
	})
	

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