// suite unit-test frameworks
import { TestBed } from "@angular/core/testing";
import { HttpTestingController, HttpClientTestingModule } from "@angular/common/http/testing";
import { http_imports } from '../../../spec/helpers/service.helper'

// class under inspection
import { TzscanService } from "./tzscan.service";

/**
 * Suite: TzscanService
 */
describe('[ TzscanService ]', () => {
  
	// class under inspection
	let service:TzscanService;
	let httpMock:HttpTestingController;
	
	//testing data
	let apiUrl:string;
	const pkh:string = 'tz3RDC3Jdn4j15J7bBHZd29EUee9gVB1CxD9';
  	

	beforeEach(() => {
    	TestBed.configureTestingModule({
      		imports: [http_imports],
      		providers: [TzscanService]
    	});

   	 	service = TestBed.get(TzscanService);
		httpMock  = TestBed.get(HttpTestingController);
		apiUrl = service.CONSTANTS.NET.API_URL;
	});	

	it('should be created', () => {
		expect(service).toBeTruthy();   
	  });

	describe('> Return Number of Operations', () => {
		
		const numops = [193869];
		const numorgops = [0];

		beforeEach(() => {
			spyOn(service, 'numberOperations').and.callThrough();
		});

		afterEach(() => {
			httpMock.verify();
		});

		it('should return total number ops', () => {
			//subscribe to observable
			service.numberOperations(pkh)
				.subscribe( (res: any ) => { 
					expect(res).toEqual(numops); 
				});

			// mock and flush the api call
			httpMock.expectOne(apiUrl + 'v1/number_operations/' + pkh)
				.flush(numops);

		});

		it('should return total number ops, type origination', () => {
			// subscribe to observable
			service.numberOperationsOrigination(pkh)
				.subscribe( (res: any) => {
					expect(res).toEqual(numorgops);
			});
			
			// mock and flush the api call
			httpMock.expectOne(apiUrl + 'v1/number_operations/' + pkh + '?type=Origination')
				.flush(numorgops);
		});
	});

	describe('> Return One-to-Many Operations', () => {
		const transaction = [{"hash":"opVQfAyyKDb827m9CDanAtCNBS6FUEAJvqWNDbPa9WoqGLLrmsn","block_hash":"BKuWSaSUmK693FjsiWSkwgAgcmKWbLcpxThPQmHsRLd9FWLWM3E","network_hash":"NetXdQprcVkpaWU","type":{"kind":"manager","source":{"tz":"tz1W6dVQvpeAsnjfwKvoPBJViRKaa7P9HJ99"},"operations":[{"kind":"transaction","src":{"tz":"tz1W6dVQvpeAsnjfwKvoPBJViRKaa7P9HJ99"},"amount":10000,"destination":{"tz":"tz3RDC3Jdn4j15J7bBHZd29EUee9gVB1CxD9","alias":"Foundation Baker 1"},"failed":false,"internal":false,"burn":0,"counter":225736,"fee":1420,"gas_limit":"10300","storage_limit":"300","op_level":244814,"timestamp":"2018-12-27T10:15:03Z"}]}}];
		const delegation = [{"hash":"ontXQ6GhatPzPTXCFXmR7dAsaocPeZDzg5BsSVX8SMuYvfyPd6b","block_hash":"BLGxAwqttAHMe3dtL5G94AXAXCmLHyjLbMT32D2Aim2z1EsFsoH","network_hash":"NetXdQprcVkpaWU","type":{"kind":"manager","source":{"tz":"KT1DgtZe1cEitiTPv5HSbYCd33E7n8GUq3kM"},"operations":[{"kind":"delegation","src":{"tz":"KT1DgtZe1cEitiTPv5HSbYCd33E7n8GUq3kM"},"delegate":{"tz":"tz3RDC3Jdn4j15J7bBHZd29EUee9gVB1CxD9","alias":"Foundation Baker 1"},"counter":2,"fee":0,"gas_limit":"0","storage_limit":"0","failed":false,"internal":false,"op_level":7055,"timestamp":"2018-07-05T15:38:57Z"}]}}];
		const origination_op = [];
		const activation = [];
		const part = [transaction, delegation, origination_op, activation];

		beforeEach(() => {
			let n, number = 1;
			let p, page_offset = 0;

			spyOn(service, 'operations').and.callThrough();
		});

		/** TODO
		it('@TODO should return all operations', () => {
			//@todo probably need Sinon to accomplish this
		});

		it('@TODO should \"format\" or \"serialize\" get an op', () => {
			let data: any;
			//service.getOp(data, pkh);
		});

		it('@TODO get operations[0] counter?', () => {

		});
		*/

		it('should return one operation, type origination', () => {
			let n, number = 1;
			
			// subscribe to observable
			let x = service.operationsOrigination(pkh, n)
				.subscribe((res: any) => {
					expect(res).toEqual(origination_op);
				});

			// mock and flush the api call
			httpMock.expectOne(apiUrl + 'v1/operations/' + pkh + '?type=Origination&number=' + n + '&p=0')
				.flush(origination_op);
		});

	});

	describe('> Return Timestamp', () => {
		beforeEach(() => {
			spyOn(service, 'timestamp').and.callThrough();
		});
	
    	it('should return [\'timestamp 2018-07-18T23:05:42Z\']', () => {
			const block = 'BMCnp6cXEFAZZjQvZ2f7L4hxH4u4T4FYEnMVXt3SS96UyMC72dh'  
    		const mtimestamp = [{string: '2018-07-18T23:05:42Z'}];

			// we give it a block hash and it returns timestamp
    		service.timestamp(block).subscribe(result => {
        		expect(result).toEqual(mtimestamp);
      		});

			httpMock.expectOne(apiUrl + 'v1/timestamp/' + block)
		  		.flush(mtimestamp);
    	});
	});
});