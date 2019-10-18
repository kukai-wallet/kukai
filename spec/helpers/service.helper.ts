//----------Default Import------------
// import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader, TranslateService } from '@ngx-translate/core';

//-----------Service Imports-------------
import { ActivityService } from '../../src/app/services/activity.service';
import { BalanceService } from '../../src/app/services/balance.service';
import { CoordinatorService } from '../../src/app/services/coordinator.service';
import { DelegateService } from '../../src/app/services/delegate.service';
import { EncryptionService } from '../../src/app/services/encryption.service';
import { ImportService } from '../../src/app/services/import.service';
import { MessageService } from '../../src/app/services/message.service';
import { OperationService } from '../../src/app/services/operation.service';
import { TzrateService } from '../../src/app/services/tzrate.service';
import { WalletService } from '../../src/app/services/wallet.service';

//-----------Pipe Imports-------------
import { ErrorHandlingPipe } from '../../src/app/pipes/error-handling.pipe';

//-----------Mock Imports-------------
import { WalletServiceStub } from '../mocks/wallet.mock';

//-----------Interface Exports-------------
export { Account, Activity, Balance, KeyPair, Wallet, WalletType } from '../../spec/mocks/interfaces.mock';

//-----------Service Exports-------------
export { WalletService } from '../../src/app/services/wallet.service';
export { OperationService } from '../../src/app/services/operation.service';
export { BalanceService } from '../../src/app/services/balance.service';
export { TranslateService } from '@ngx-translate/core';
export { ErrorHandlingPipe } from '../../src/app/pipes/error-handling.pipe';


// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';

import { TzscanService } from '../../src/app/services/tzscan.service';

//export { of } from "rxjs/observable/of";

export const rx = Rx;

// imports
export const default_imports = [ ];
export const http_imports = [
	HttpClientModule,
	HttpClientTestingModule
];

export const translate_imports = [
	HttpClientModule,
	HttpClientTestingModule,
	TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }})
];

export const balancesrv_providers = [
	BalanceService,
	{provide: WalletService, useClass: WalletServiceStub},
	TranslateService,
	OperationService,
	ErrorHandlingPipe,
	MessageService,
	TzrateService
];

export const walletsrv_providers = [
	WalletService,
	ActivityService,
	BalanceService,
	CoordinatorService,
	EncryptionService,
	DelegateService,
	ErrorHandlingPipe,
	ImportService,
	MessageService,
	OperationService,
	TranslateService,
	TzrateService,
	TzscanService
];

