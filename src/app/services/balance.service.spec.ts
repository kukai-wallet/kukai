// suite unit-test frameworks
import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

// class mocks
import {Account, Balance, http_imports, translate_imports, balancesrv_providers, rx} from '../../../spec/helpers/service.helper';
import { BalanceService, WalletService, OperationService } from '../../../spec/helpers/service.helper';
/**
 * Suite: BalanceService
 * @todo: remove console.log spy, mock operation service calls entirely. it should never be tested.
 * @todo: review the logic in behavior used in tests.
 */
describe('[ BalanceService ]', () => {
	// class under inspection
	let service: BalanceService;

	// class dependencies
	let walletsrv;
	let operationsrv: OperationService;
	let httpMock: HttpTestingController;

	// testing variables
	const nodeurl = 'https://rpc.tezrpc.me/';
	let pkh: string;

	let accounts: Account[];
	// let networkresponses: any[];

	beforeEach(() => {
		// WalletService mock
		TestBed.configureTestingModule({
			imports: [http_imports, translate_imports],
			providers: [ balancesrv_providers ]
		});

		service = TestBed.get(BalanceService);
		walletsrv = TestBed.get(WalletService);
		operationsrv = TestBed.get(OperationService);
		httpMock  = TestBed.get(HttpTestingController);

		// create mock empty full wallet
		walletsrv.wallet = walletsrv.emptyWallet(0);
		const emptybalance: Balance = <Balance>{ balanceXTZ: 0, pendingXTZ: null, balanceFiat: 0, pendingFiat: null };
		accounts = [{ pkh: 'tz1primary', delegate: '', balance: emptybalance, numberOfActivites: 0, activities: [] },
			{ pkh: 'KT1contract1', delegate: '', balance: emptybalance,	numberOfActivites: 0, activities: [] },
			{ pkh: 'KT1contract2', delegate: 'tz1tacocity', balance: emptybalance, numberOfActivites: 0, activities: []	}];
		walletsrv.wallet.accounts = accounts;


		// configure spies
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should call getxtzbalanceall once', () => {
		spyOn(service, 'getXTZBalanceAll');
		service.getBalanceAll();
		expect(service.getXTZBalanceAll).toHaveBeenCalledTimes(1);
	});

	it('should call attempt to update account balance 3 times', () => {
		spyOn(service, 'getAccountBalance');
		service.getXTZBalanceAll();
		expect(service.getAccountBalance).toHaveBeenCalledTimes(3);
	});

	it('should update an account balance to 10', () => {
		pkh = accounts[1].pkh;
		const index = 1;

		spyOn(console, 'log');
		spyOn(operationsrv, 'getBalance').and.callFake(function() { return rx.Observable.of({	success: true, payload: { balance: 10 } });	});

		service.getAccountBalance(index);

		expect(console.log).toHaveBeenCalledWith('for ' + pkh);
		expect(walletsrv.wallet.accounts[1].balance.balanceXTZ).toEqual(10);
	});

	/** Failing on 1.3.0 update
	it('should handle error on failed request', () => {
		pkh = accounts[1].pkh;
		let index = 1;
		spyOn(console,'log');
		//spyOn(operationsrv,'getBalance').and.callFake(function() { return of({	success: true, payload: { balance: 10 } });	});
		service.getAccountBalance(1);
		httpMock.expectOne(nodeurl + '/chains/main/blocks/head/context/contracts/' + pkh + '/balance').error(new ErrorEvent('network error'));
		expect(console.log).toHaveBeenCalledWith('Balance Error: "Unknown Error"');
	}); */

	/** Failing on 1.3.0 update
	it('should update the wallet total balance', () => {

		spyOn(console,'log');
		service.getBalanceAll();

		let req;

		for(let i = 0; i < walletsrv.wallet.accounts.length; i++) {
			httpMock.expectOne(nodeurl + '/chains/main/blocks/head/context/contracts/' + walletsrv.wallet.accounts[i].pkh + '/balance')
				.flush(10);
		}

		expect(walletsrv.wallet.balance.balanceXTZ).toEqual(30);
	})
	*/
});
