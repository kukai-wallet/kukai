// suite unit-test frameworks
import { HttpTestingController, HttpClientTestingModule, TestRequest } from '@angular/common/http/testing';

// class under inspection
import { TzrateService } from './tzrate.service';

// class dependencies
import { HttpClientModule } from '@angular/common/http';
import { WalletService } from '../wallet/wallet.service';
import { WalletTools } from '../../../../spec/mocks/library.mock';

// provider sub-dependencies
import { TranslateService, TranslateLoader, TranslateFakeLoader, TranslateModule } from '@ngx-translate/core';
import { EncryptionService } from '../encryption/encryption.service';
import { OperationService } from '../operation/operation.service';
import { TestBed } from '@angular/core/testing';
import { ErrorHandlingPipe } from '../../pipes/error-handling.pipe';
import { Account, Wallet, Balance } from '../../interfaces';
import { WalletObject } from '../wallet/wallet';


/**
 * Suite: TzrateService
 * @todo Remove mock on cmc api
 */
describe('[ TzrateService ]', () => {
	// class under inspection
	let service: TzrateService;

	// class dependencies
	let walletservice: WalletService;
	let httpMock: HttpTestingController;
	const walletTols = new WalletTools();

	// mock network data
	const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=tezos&vs_currencies=usd';
	const ticker = {
		tezos: {
			usd: 2.07
		}
	};
	const mockhttpresponse = {
		'tezos': {
			'usd': 2.07
		}
	};

	beforeEach(() => {

		// WalletService mock
		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule, TranslateModule.forRoot(
				{ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } })],
			providers: [
				TzrateService,
				WalletService,
				TranslateService,
				OperationService,
				EncryptionService,
				ErrorHandlingPipe
			]
		});

		service = TestBed.inject(TzrateService);
		walletservice = TestBed.inject(WalletService);
		httpMock = TestBed.inject(HttpTestingController);

		walletservice.wallet = walletTols.generateWalletV2();
		// spies
		spyOn(service, 'getTzrate').and.callThrough();
		spyOn(service, 'updateFiatBalances').and.callThrough();
		spyOn(walletservice, 'storeWallet');
		spyOn(console, 'log');
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('> Update XTZ Rate', () => {

		beforeEach(() => {
			service.getTzrate();
			const req = httpMock.expectOne(apiUrl);
			req.flush(mockhttpresponse);
		});

		/*it('should perform a get request to apiUrl', () => {
			expect(req.request.method).toBe('GET');
		});*/

		it('should update wallet xtzrate from 0 to 2.07', () => {
			expect(walletservice.wallet.XTZrate.toString()).toEqual(ticker.tezos.usd.toString());
		});

		describe('> Update Account Balance', () => {
			it('should update wallet total balance from $0 to $2.07', () => {
				expect(walletservice.wallet.totalBalanceUSD.toString()).toEqual('0.000621');
			});

			it('should call wallet service storeWallet()', () => {
				expect(walletservice.storeWallet).toHaveBeenCalled();
			});
		});
	});
	/*
	describe('> Handle Network Errors', () => {
		const mockErrorResponse = { status: 404, statusText: 'Bad Request' };
		const data = 'Invalid request parameters';
		let errResponse: string;

		beforeEach(() => {
			// tslint:disable-next-line:max-line-length
			errResponse = 'Failed to get xtz price from CMC: {"headers":{"normalizedNames":{},"lazyUpdate":null,"headers":{}},"status":0,
				"statusText":"Unknown Error","url":"https://api.coinmarketcap.com/v1/ticker/tezos/","ok":false,"name":"HttpErrorResponse",
				"message":"Http failure response for https://api.coinmarketcap.com/v1/ticker/tezos/: 0 ","error":{"isTrusted":false}}';
			service.getTzrate();
			const failedreq = httpMock.expectOne(apiUrl).error(new ErrorEvent('network error'));
		});

		it('should log error message if ticker is unavailable', () => {
			expect(console.log).toHaveBeenCalledWith(errResponse);
		});
	});*/
});
