// testing framework
import { TestBed } from '@angular/core/testing';
import { WalletTools } from '../../../../spec/mocks/library.mock';

// class under inspection
import { ActivityService } from './activity.service';

// dependencies
import { WalletService } from '../wallet/wallet.service';
import { MessageService } from '../message/message.service';
import { TranslateService, TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { OperationService } from '../operation/operation.service';
import { EncryptionService } from '../encryption/encryption.service';
import { ErrorHandlingPipe } from '../../pipes/error-handling.pipe';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import 'rxjs/add/operator/mergeMap';
import { of } from 'rxjs/observable/of';
// import { forEach } from '@angular/router/src/utils/collection';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from 'selenium-webdriver/http';
import { RSA_X931_PADDING } from 'constants';




describe('[ ActivityService ]', () => {
	let service: ActivityService;
	let walletservice: WalletService;

	const mockLib = new WalletTools();

	//let pkh, blockhash, operationhash;
	//let acctIndex, activIndex;

	beforeEach(() => {
		//create new activity
		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule, TranslateModule.forRoot(
				{ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } })],
			providers: [ActivityService, WalletService, MessageService,
				TranslateService, OperationService, EncryptionService, ErrorHandlingPipe]
		});

		// configure injected services
		service = TestBed.inject(ActivityService);
		walletservice = TestBed.inject(WalletService);

		// generate random wallet
		walletservice.wallet = mockLib.generateWalletV1();

	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});


	/*it('should get the transaction counter for given pkh', () => {
		const pkh = walletservice.wallet.accounts[0].pkh;
		const number_operations = [walletservice.wallet.accounts[0].numberOfActivites];

		// spyOn(tzscanservice, 'numberOperations').and.returnValue(Observable.of([number_operations]));
		// spyOn(service, 'getTransactions');

		// service.getTransactonsCounter(pkh); // TODO still need to manage observables

		//expect(service.getTransactions).toHaveBeenCalledWith(pkh, number_operations[0]);
	});*/

	/** TODO
	it('@TODO should get transactions', async() => {
		 // Mocks Required: (External Calls)
		 // tzscan.operations [done]
		 // tzscan.getOp serializer [todo]

		let pkh = 'tz1YyqaeFJFXLx9SSY1mfPrJM7jfoMazd8FK';
		let mockops = mockLib.getOperations();

		let x = mockLib.getOperations();
		let a = mockLib.getOp(x[0], pkh);
		let b = mockLib.getOp(x[1], pkh);
		let c = mockLib.getOp(x[2], pkh);

		await service.updateTransactions(pkh)

		expect(walletservice.wallet.accounts.length).toBe(3);
	})
	*/
});
