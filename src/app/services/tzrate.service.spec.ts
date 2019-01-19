// suite unit-test frameworks
import { HttpTestingController, HttpClientTestingModule, TestRequest } from "@angular/common/http/testing";

// class under inspection
import { TzrateService } from './tzrate.service';

// class dependencies
import { HttpClientModule } from "@angular/common/http";
import { WalletService } from "./wallet.service";

// provider sub-dependencies
import { TranslateService, TranslateLoader, TranslateFakeLoader, TranslateModule } from "@ngx-translate/core";
import { EncryptionService } from './encryption.service';
import { OperationService } from "./operation.service";
import { TestBed } from "@angular/core/testing";
import { ErrorHandlingPipe } from "../pipes/error-handling.pipe";
import { Account, Wallet, Balance } from "../interfaces";


/**
 * Suite: TzrateService 
 */
describe('[ TzrateService ]', () => {
	// class under inspection
	let service: TzrateService;

	// class dependencies
	let walletservice:WalletService;
	let httpMock: HttpTestingController;
	  
	// mock network data
	const apiUrl:string = 'https://api.coinmarketcap.com/v1/ticker/tezos/';
	const ticker = [
		{ 
			"id": "tezos", 
			"name": "Tezos", 
			"symbol": "XTZ", 
			"rank": "22", 
			"price_usd": "0.4605297041", 
			"price_btc": "0.00012593", 
			"24h_volume_usd": "1043032.63613", 
			"market_cap_usd": "279766748.0", 
			"available_supply": "607489041.0", 
			"total_supply": "763306930.0", 
			"max_supply": null, 
			"percent_change_1h": "-1.68", 
			"percent_change_24h": "-11.17", 
			"percent_change_7d": "-2.77", 
			"last_updated": "1545964456" 
		}
	];
	const mockhttpresponse = [
		{
		"id": "tezos", 
		"name": "Tezos", 
		"symbol": "XTZ", 
		"rank": "22", 
		"price_usd": "0.4605297041", 
		"price_btc": "0.00012593", 
		"24h_volume_usd": "1043032.63613", 
		"market_cap_usd": "279766748.0", 
		"available_supply": "607489041.0", 
		"total_supply": "763306930.0", 
		"max_supply": null, 
		"percent_change_1h": "-1.68", 
		"percent_change_24h": "-11.17", 
		"percent_change_7d": "-2.77", 
		"last_updated": "1545964456"
		}
	];
	const error = [
		{
		"error": "id not found"
		}
	];

	beforeEach(() => {

		// WalletService mock	
		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule, TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }})],
			providers: [
				TzrateService, 
				WalletService, 
				TranslateService, 
				OperationService, 
				EncryptionService, 
				ErrorHandlingPipe
			]
		});

		service = TestBed.get(TzrateService);
		walletservice = TestBed.get(WalletService);
		httpMock  = TestBed.get(HttpTestingController);

		let mockbalance:Balance = {
			balanceXTZ: 1000000,
			pendingXTZ: null,
			balanceFiat: 0,
			pendingFiat: null
		};

		let mockaccount:Account[] = [{
			pkh: 'mockpkh',
			delegate: '',
			balance: mockbalance,
			numberOfActivites: 0,
			activities: null
		}]	

		walletservice.wallet = <Wallet> 
		{
			XTZrate: 0,
			seed: 'mockseed',
			balance:  mockbalance,
			accounts: mockaccount
		};

		// spies
		spyOn(service, 'getTzrate').and.callThrough();
		spyOn(service, 'updateFiatBalances').and.callThrough();
		spyOn(walletservice, 'storeWallet');
		spyOn(walletservice, 'wallet');
		spyOn(console, 'log');
	
	});

	afterEach(() => {
		httpMock.verify();
	})

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('> Update XTZ Rate', () => {
		let req:TestRequest;	

		beforeEach(() => {
			service.getTzrate();
			req = httpMock.expectOne(apiUrl);
			req.flush(ticker);
		});

		it('should perform a get request to apiUrl', () => {
			expect(req.request.method).toBe("GET");
		});

		it('should update wallet xtzrate from 0 to 0.4605297041', () => {
			expect(walletservice.wallet.XTZrate.toString()).toEqual(ticker[0]['price_usd']);
		});

		it('should log success message [ \'XTZ = $0.4605297041\' ]', () => {
			expect(console.log).toHaveBeenCalledWith('XTZ = $' + ticker[0]['price_usd']);
		});

		describe('> Update Account Balance', () => {
			it('should update wallet total balance from $0 to $0.4605297041', () => {
				expect(walletservice.wallet.balance.balanceFiat.toString()).toEqual('0.4605297041');
			});
	
			it('should call wallet service storeWallet()', () => {
				expect(walletservice.storeWallet).toHaveBeenCalled();
			});
		});
	});

	describe('> Handle Network Errors', () => {
		const mockErrorResponse = { status: 404, statusText: 'Bad Request' };
		const data = 'Invalid request parameters';
		let errResponse:string;

		beforeEach(() => {
			errResponse = 'Failed to get xtz price from CMC: {"headers":{"normalizedNames":{},"lazyUpdate":null,"headers":{}},"status":0,"statusText":"Unknown Error","url":"https://api.coinmarketcap.com/v1/ticker/tezos/","ok":false,"name":"HttpErrorResponse","message":"Http failure response for https://api.coinmarketcap.com/v1/ticker/tezos/: 0 ","error":{"isTrusted":false}}';
			service.getTzrate();
			const failedreq = httpMock.expectOne(apiUrl).error(new ErrorEvent('network error'));
		});
	
		it('should log error message if ticker is unavailable', () => {
			expect(console.log).toHaveBeenCalledWith(errResponse);
		});
	});
});
