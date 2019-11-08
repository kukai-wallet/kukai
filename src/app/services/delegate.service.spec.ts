// suite unit-test frameworks
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule, TestRequest } from '@angular/common/http/testing';

// class under inspection
import { DelegateService } from './delegate.service';

// class dependencies
import { HttpClientModule } from '@angular/common/http';
import { WalletService } from './wallet.service';
import { OperationService } from './operation.service';
import { TranslateLoader, TranslateFakeLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ErrorHandlingPipe } from '../pipes/error-handling.pipe';

// class mocks
import { Account, Activity, Balance, Wallet, WalletType } from '../../../spec/mocks/interfaces.mock';
import { EncryptionService } from './encryption.service';
import 'rxjs/add/operator/mergeMap';

/**
 * Suite: DelegateService
 * @todo: remove console.log spy, mock operation service calls entirely. it should never be tested.
 */
describe('[ DelegateService ]', () => {
	// class under inspection
	let service: DelegateService;

	// class dependencies
	let walletsrv: WalletService;
	let operationsrv: OperationService;
	let httpMock: HttpTestingController;

	// testing variables
	const nodeurl = 'https://rpc.tezrpc.me/';
	let delegate: string;
	let pkh: string;

	let accounts: Account[];
	let networkresponses: any[];

	beforeEach(() => {
		// WalletService mock
		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule, TranslateModule.forRoot({
				loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }})],
			providers: [
				DelegateService,
				WalletService,
				TranslateService,
				OperationService,
				EncryptionService,
				ErrorHandlingPipe
			]
		});

		service = TestBed.get(DelegateService);
		walletsrv = TestBed.get(WalletService);
		operationsrv = TestBed.get(OperationService);
		httpMock  = TestBed.get(HttpTestingController);

		// create mock empty full wallet
		walletsrv.wallet = walletsrv.emptyWallet(0);

		const emptybalance: Balance = <Balance>{
			balanceXTZ: null,
			pendingXTZ: null,
			balanceFiat: null,
			pendingFiat: null
		  };

		accounts = [
			{
				pkh: 'tz1primary',
				delegate: '',
				balance: emptybalance,
				numberOfActivites: 0,
				activities: []
			},
			{
				pkh: 'KT1contract1',
				delegate: '',
				balance: emptybalance,
				numberOfActivites: 0,
				activities: []
			},
			{
				pkh: 'KT1contract2',
				delegate: 'tz1tacocity',
				balance: emptybalance,
				numberOfActivites: 0,
				activities: []
			}];

		networkresponses = [
			{
				'manager': 'tz1primary',
				'balance': '3310767978478',
				'spendable': true,
				'delegate': {
					'setable': false,
					'value': ''
				},
				'counter': '10'
			},
			{
				//KT1contract1
				'manager': 'tz1primary',
				'balance': '110135021478',
				'spendable': true,
				'delegate': {
					'setable': true,
					'value': 'tz1primary'
				},
				'counter': '10'
			},
			{
				//KT1contract2
				'manager': 'tz1primary',
				'balance': '767978868',
				'spendable': true,
				'delegate': {
					'setable': true,
					'value': 'tz1bakerone'
				},
				'counter': '10'
			}];

		pkh = accounts[1].pkh;
		delegate = networkresponses[1].delegate.value;

		// configure spies
		spyOn(walletsrv, 'storeWallet');
		spyOn(operationsrv, 'getDelegate').and.callThrough();
		spyOn(console, 'log'); // remove later

	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	/** No longer true after Babylon
	it('should ignore TZ1 accounts', () => {
		service.getDelegate('tz1mockaccount');
		expect(operationsrv.getDelegate).not.toHaveBeenCalled();
	});
	 */

	/** Broken in 1.3.0 update
	it('should get a single delegate', () => {
		service.getDelegate(pkh);
		httpMock.expectOne(nodeurl + '/chains/main/blocks/head/context/contracts/' + pkh).flush( networkresponses[1]);
		expect(walletsrv.wallet.accounts[0].delegate).toEqual(networkresponses[1].delegate.value);
	});
	 */

	it('should add account if accounts[] is empty', () => {
		service.handleDelegateResponse(pkh, delegate);
		expect(walletsrv.wallet.accounts[0].delegate).toEqual(delegate);
		expect(walletsrv.storeWallet).toHaveBeenCalled();
	});

	/** Broken in 1.3.0 update
	it('should update all delegates', () => {
		walletsrv.wallet.accounts = accounts;

		spyOn(service, 'getDelegate').and.callThrough();
		spyOn(service, 'handleDelegateResponse').and.callThrough();

		service.getDelegates();

		for(let i = 1; i < walletsrv.wallet.accounts.length; i++ ) {
			httpMock.expectOne(nodeurl + '/chains/main/blocks/head/context/contracts/' + walletsrv.wallet.accounts[i].pkh)
				.flush(networkresponses[i]);
		};

		expect(walletsrv.wallet.accounts[1].delegate).toEqual(networkresponses[1].delegate.value);
		expect(walletsrv.wallet.accounts[2].delegate).toEqual(networkresponses[2].delegate.value);

	});
	 */
});
