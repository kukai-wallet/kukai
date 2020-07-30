// class under inspection
import { ExportService } from './export.service';

// class dependencies
import * as FileSaver from 'file-saver';
import { WalletService } from '../wallet/wallet.service';

// unit-testing framework
import { WalletServiceStub } from '../../../../spec/mocks/wallet.mock';
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

		service = TestBed.inject(ExportService);
		walletService = TestBed.inject(WalletService);
  });

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe ('> Download Wallet', () => {

		beforeEach(() => {

			data = {
				encryptedEntropy: '574bc1c9521bde63185dedc3a0a0ba7f8db98d57==13cc85f6fefaaa7e87bdcdd11c175707',
				encryptedSeed: '5d88a97d5b4acf6fb9c3ee6b772a950899f7123564d9457a6670f0744f4a1bcd==dcb36d2ead10b455153cb1f73c20b87d',
				iv: '0dfdc3ab773f499411696d1cb80500dd',
				provider: 'Kukai',
				version: 3,
				walletType: 0
			};

			/** filesaver.saveAs() arguments */
			fileblob = new Blob( [JSON.stringify(data, null, 4)], { type: 'application/json' } );
			filename = 'wallet.tez';

			/** spy on downloadWallet() function */
			spyOn(service, 'downloadWallet').and.callThrough();


			/** spy on saveAs call, return nothing. we don't want to actually download  */
			spyOn(FileSaver, 'saveAs').and.callFake( function() {   } );

		});

		it('should export the keystore', () => {
			service.downloadWallet(data);
			expect(service.downloadWallet).toHaveBeenCalled();
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
