// suite unit-test frameworks
import { TestBed } from "@angular/core/testing";
import { HttpTestingController, HttpClientTestingModule, TestRequest } from "@angular/common/http/testing";

// class under inspection
import { CoordinatorService } from "./coordinator.service";

// class dependencies
import { HttpClientModule } from "@angular/common/http";
import { WalletService } from "./wallet.service";
import { OperationService } from "./operation.service";
import { TranslateLoader, TranslateFakeLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { ErrorHandlingPipe } from "../pipes/error-handling.pipe";

// class mocks
import { EncryptionService } from "./encryption.service";
import 'rxjs/add/operator/mergeMap';

import { MessageService } from "./message.service";
import { TzrateService } from "./tzrate.service";
import { of } from "rxjs/observable/of";
import { AppModule } from "../app.module";
import { AppComponent } from "../app.component";
import { ActivityService } from "./activity.service";
import { TzscanService } from "./tzscan.service";
import { BalanceService } from "./balance.service";
import { DelegateService } from "./delegate.service";


/**
 * Suite: CoordinatorService 
 */
describe('[ Coordinator ]', () => {
	// class under inspection
	let service: CoordinatorService;

	// class dependencies
	let walletsrv:WalletService;
	let operationsrv:OperationService;
	let httpMock: HttpTestingController;

	// testing variables
	const nodeurl: string = 'https://rpc.tezrpc.me/'
	let pkh: string;

	let accounts:Account[];
	let networkresponses:any[];
	
	beforeEach(() => {
		// WalletService mock	
		TestBed.configureTestingModule({
			imports: [HttpClientModule, HttpClientTestingModule, TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }})],
			providers: [ ActivityService, WalletService, EncryptionService, ErrorHandlingPipe, BalanceService, DelegateService, TzscanService, TzrateService, MessageService, OperationService, CoordinatorService, AppModule, AppComponent ]
		});

		service = TestBed.get(CoordinatorService);
		
		httpMock  = TestBed.get(HttpTestingController);	
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	})
});
