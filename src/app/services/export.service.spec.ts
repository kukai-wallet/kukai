// class under inspection
import { ExportService } from './export.service';

// class dependencies
import * as FileSaver from 'file-saver';
import { WalletService } from './wallet.service';

// unit-testing framework
import { WalletServiceStub } from '../../../spec/mocks/wallet.mock';
import { TestBed } from '@angular/core/testing';


/**
 * Suite: Export Service Testing
 * @todo: perform a deep equal on spied arguments? possible refactor.
 * @done: Imports: Could not find a declaration file for module 'file-saver/FileSaver'.
 * @done: Method: describe downloadOperationData
 * @done: Find a way to check the blob?
 * @done: Find a way to check the SaveAs file?
 * @done: Cleanup & re-enable mocha runner.
 * @done: mock keystore exports, move to integration testing?
 */
describe('[ ExportService ]', () => {

	// class to inspect & dependencies
	let service: ExportService;
	let walletService: WalletService;

	// parameters to inspect
	let data: any;

	// arguments to inspect
	let fileblob: Blob;
	let filename: string;

  	beforeEach(() => {

		TestBed.configureTestingModule({
			providers: [ ExportService, {provide: WalletService, useClass: WalletServiceStub} ]
			});

		service = TestBed.get(ExportService);
		walletService = TestBed.get(WalletService);
  });

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe ('> Download Wallet', () => {

		beforeEach(() => {

			data = {
				provider: 'Kukai',
				version: 1.0,
				pkh: 'public key hash',
				walletType: 2
			};

			/** filesaver.saveAs() arguments */
			fileblob = new Blob( [JSON.stringify(data, null, 4)], { type: 'application/json' } );
			filename = 'wallet.tez';

			/** spy on downloadWallet() function */
			spyOn(service, 'downloadWallet').and.callThrough();

			/** spy on exportkeystore, return mock data */
			spyOn(walletService, 'exportKeyStore').and.returnValue(data);

			/** spy on saveAs call, return nothing. we don't want to actually download  */
			spyOn(FileSaver, 'saveAs').and.callFake( function() {   } );

		});

		it('should export the keystore', () => {
			service.downloadWallet();
			expect(walletService.exportKeyStore).toHaveBeenCalled();
		});

		it('should save file wallet.tez', () => {

			// mock data exportKeyStore()
			data.walletType = 0;
			data.encryptedSeed = 'encryptedSeed';

			// download full wallet
			service.downloadWallet(data);

			// verify our arguments match
			expect(FileSaver.saveAs).toHaveBeenCalledWith(fileblob, filename);

		});

		it('should save file observer_wallet.tez', () => {

			/** filesaver.saveAs() arguments */
			fileblob = new Blob( [JSON.stringify(data, null, 4)], { type: 'application/json' } );
			filename = 'observer_wallet.tez';

			// download full wallet
			service.downloadWallet(data);

		});

	});

	describe ('> Download View-Only Wallet', () => {
		let pk: string;

		beforeEach(() => {
			// set mock public key
			pk = 'mockseed';

			// set mock view-wallet export keystore
			data = {
				provider: 'Kukai',
				version: 1.0,
				walletType: 1,
				pkh: 'mockpkh',
				pk: 'mockseed'
			};

			/** filesaver.saveAs() arguments */
			fileblob = new Blob( [JSON.stringify(data, null, 4)], { type: 'application/json' } );
			filename = 'view-only_wallet.tez';

			/** spy on downloadvowallet */
			spyOn(service, 'downloadViewOnlyWallet').and.callThrough();

			/** spy on downloadWallet() function */
			spyOn(service, 'downloadWallet').and.callThrough();

			/** spy on saveAs call, fake return to do nothing.
			 * we don't want to actually download anything just know properties of  */
			spyOn(FileSaver, 'saveAs').and.callFake( function() {   } );

			/** spy on exportkeystore, return mock data */
			spyOn(walletService, 'exportKeyStore').and.returnValue(data);

			service.downloadViewOnlyWallet(pk);

		});

		it('should export the keystore', () => {
				expect(walletService.exportKeyStore).toHaveBeenCalled();
		});

		it('should pass keystore data downloadWallet', () => {
			expect(service.downloadWallet).toHaveBeenCalledWith(data);
		});

		it('should save file view-only_wallet.tez', () => {
			expect(FileSaver.saveAs).toHaveBeenCalledWith(fileblob, filename);
		});

	});

	describe('> Download Operation Data', () => {
		let hex: string;

		beforeEach(() => {
			hex = 'fd00000aa8660';

			data = {
				hex: hex,
				signed: true
			};

			// spies
			spyOn(service, 'downloadOperationData').and.callThrough();
			spyOn(FileSaver, 'saveAs').and.callFake( function() {   } );

		});

		it('should save signed ops file signed.tzop', () => {

			service.downloadOperationData(hex, true);

			expect(FileSaver.saveAs).toHaveBeenCalledWith( new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' }), 'signed.tzop');
		});

		it('should save unsigned ops file unsigned.tzop', () => {
			//signed = false;

			service.downloadOperationData(hex, false);

			expect(FileSaver.saveAs).toHaveBeenCalledWith( new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' }), 'unsigned.tzop');
		});
	});
});
