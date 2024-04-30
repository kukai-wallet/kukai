// unit-testing framework
import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

// class under inspection
import { OperationService } from './operation.service';

// provider sub-dependencies
import { KeyPair, http_imports, translate_imports, TranslateService, ErrorHandlingService, rx } from '../../../../spec/helpers/service.helper';
// import { Observable } from 'rxjs';
import { timeout, catchError, flatMap, mergeMap } from 'rxjs/operators';
import 'rxjs/add/operator/mergeMap';
import { of } from 'rxjs/observable/of';
import Big from 'big.js';

/**
 * Suite: OperationService
 */
describe('[ OperationService ]', () => {
  // class to inspect & dependencies
  let service: OperationService;
  let httpMock: HttpTestingController;
  // let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [http_imports, translate_imports, RouterTestingModule],
      providers: [OperationService, TranslateService, ErrorHandlingService]
    });

    // service dependencies
    service = TestBed.inject(OperationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  //todo: operation, broadcast, opcheck
  /**
   * Originate Operation
   */
  describe('> Originate Operation ', () => {
    /*let pkh: string;
		let amount: number;
		let fee: number;
		let keys: KeyPair;*/
    const microtez = new Big(1000000);

    beforeEach(() => {
      //spyOn(service, 'originate').and.callThrough();
    });

    it('is defined', function () {
      expect(service.originate).toBeDefined();
    });
  });

  describe('> Activate Operation', () => {
    it('should activate an account', () => {
      //Parameter Variables
      const pkh = 'mypkh';
      const secret = 'mysecret';

      // FlatMap Variables
      const hash = 'BM8YtoAcJxAV65U3URf6xHp9zecV8EYo3zy8pWiVb6oSyEAc5rP';
      const actions = '10';
      const manager = {
        manager: 'tz1NhJPtvaewKoRAzZWwMxydApkeDEVP1qyu',
        key: 'edpkua4en655MXF3TU4trKwzZnphm2ywjv5VBN2B177n4rnG9KtLGz'
      };
      const nodeUrl = 'https://rpc.tezrpc.me/';

      // Network Responses
      const headblockhash = 'BKnPqHFNHM6E2hXfYAagyP2xCrfsnEvpjeRbrMHFLVFVsciB61G';

      //spies
      spyOn(service, 'activate').and.callThrough();

      //call method
      service.activate(pkh, secret).subscribe((res: any) => {
        expect(res).toEqual('asdf');
      });
    });

    it('should set account transfer', () => {});

    it('should set account originate', () => {});
  });
  describe('> pk to pkh', () => {
    it('should return correct pkh', function () {
      const pkh = service.spPointsToPkh(
        '3905f9de2b7c0f62ce7604036538e81f366976135171013896a74154f24b16ec',
        'f0ab34c783bdfb6e9e7a578846f8dbf3fe26861fe14fc6483eff06352d4c0c7'
      );
      expect(pkh).toBeDefined();
      expect(pkh).toEqual('tz2Wid7AJyjT9Y2L6L8MLEtuEdUBDeAUrJ94');
    });
    it('should work with or without zero padding', function () {
      const pkh = service.spPointsToPkh(
        '905f9de2b7c0f62ce7604036538e81f366976135171013896a74154f24b16ec',
        'f0ab34c783bdfb6e9e7a578846f8dbf3fe26861fe14fc6483eff06352d4c0c7'
      );
      const pkh2 = service.spPointsToPkh(
        '0905f9de2b7c0f62ce7604036538e81f366976135171013896a74154f24b16ec',
        'f0ab34c783bdfb6e9e7a578846f8dbf3fe26861fe14fc6483eff06352d4c0c7'
      );
      expect(pkh).toBeDefined();
      expect(pkh).toEqual('tz2FTZsTCoq1KVk1C5pGsgjhq2rkbWCeSXty');
      expect(pkh2).toEqual('tz2FTZsTCoq1KVk1C5pGsgjhq2rkbWCeSXty');
    });
  });
  describe('> Operation Check', () => {
    // initialize parameters
    let final: string; //ophash
    let pkh: string;

    beforeEach(() => {
      pkh = 'newpkh';
      final = 'l2ZRw0p8RjN7SoDsFe8fqHKufDftLw81isUq6qM7Snx1tblxkOx'; // final ophash
      spyOn(service, 'opCheck').and.callThrough();
    });

    it('is defined', function () {
      expect(service.opCheck).not.toBeUndefined();
    });

    it('takes (2) strings', function () {
      service.opCheck(final, pkh);
      expect(service.opCheck).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String));
    });

    it('returns instanceof Object', function () {
      const data = service.opCheck(final, pkh);
      expect(data instanceof Object).toBeTruthy();
    });

    it('return type is not ScalarObservable', function () {
      const data = service.opCheck(final, pkh);
      expect(data._isScalar).toBeFalsy();
    });

    it('return operation success for final type string and length 51', () => {
      service
        .opCheck(final, pkh)
        //.do(data => console.log(data))
        .subscribe((data) => {
          // matching payload
          expect(data).toEqual({
            success: true,
            payload: { opHash: final, newPkh: pkh }
          });
          //  operation success true
          expect(data.success).toBeTruthy();
          // defined properties
          expect(data.success).toBeDefined();
          expect(data.payload.opHash).toBeDefined();
          expect(data.payload.newPkh).toBeDefined();
          // undefined properties
          expect(data.payload.msg).toBeUndefined();
        });
      expect(service.opCheck).toHaveBeenCalledWith(final, pkh);
      expect(service.opCheck).toHaveBeenCalledTimes(1);
    });

    it('return operation failed for final type null', () => {
      final = null;

      service
        .opCheck(final, pkh)
        //.do(data => console.log(data))
        .subscribe((data) => {
          // matching payload
          expect(data).toEqual({
            success: false,
            payload: { opHash: null, msg: final }
          });
          // operation success false
          expect(data.success).not.toBeTruthy();
          // defined
          expect(data.success).toBeDefined();
          expect(data.payload.opHash).toBeDefined();
          expect(data.payload.msg).toBeDefined();
          // undefined
          expect(data.payload.newPkh).toBeUndefined();
        });
      expect(service.opCheck).toHaveBeenCalledWith(final, pkh);
      expect(service.opCheck).toHaveBeenCalledTimes(1);
    });

    it('return operation failed for final length 0', () => {
      final = '';

      service
        .opCheck(final, pkh)
        //.do(data => console.log(data))
        .subscribe((data) => {
          // matching payload
          expect(data).toEqual({
            success: false,
            payload: { opHash: null, msg: final }
          });
          // operation success false
          expect(data.success).not.toBeTruthy();
          // defined
          expect(data.success).toBeDefined();
          expect(data.payload.opHash).toBeDefined();
          expect(data.payload.msg).toBeDefined();
          // undefined
          expect(data.payload.newPkh).toBeUndefined();
        });
      expect(service.opCheck).toHaveBeenCalledWith(final, pkh);
      expect(service.opCheck).toHaveBeenCalledTimes(1);
    });
    it('should parse token transfers', () => {
      const fa12 =
        '{"kind":"transaction","source":"tz1arY7HNDq17nrZJ7f3sikxuHZgeopsU9xq","amount":"0","destination":"KT1REPEBMQS3Be8ZybkQQfSwAv3g4pHJViuK","parameters":{"entrypoint":"transfer","value":{"args":[{"string":"tz1arY7HNDq17nrZJ7f3sikxuHZgeopsU9xq"},{"args":[{"string":"tz1UeT3VS8LuAkvB66tjQTTDP1LFf3DEC4uA"},{"int":"20"}],"prim":"Pair"}],"prim":"Pair"}}}';
      const faNone =
        '{"kind":"transaction","source":"tz1arY7HNDq17nrZJ7f3sikxuHZgeopsU9xq","amount":"0","destination":"KT1REPEBMQS3Be8ZybkQQfSwAv3g4pHJViuK","parameters":{"entrypoint":"transfer","value":{"args":[{"args":[{"string":"tz1UeT3VS8LuAkvB66tjQTTDP1LFf3DEC4uA"},{"int":"20"}],"prim":"Pair"}],"prim":"Pair"}}}';
      const fa2 =
        '{"kind":"transaction","source":"tz1arY7HNDq17nrZJ7f3sikxuHZgeopsU9xq","amount":"0","destination":"KT1T6uCxdWcvUhKZfeg83QU2wrormgy63Upd","parameters":{"entrypoint":"transfer","value":[{"prim":"Pair","args":[{"string":"tz1arY7HNDq17nrZJ7f3sikxuHZgeopsU9xq"},[{"prim":"Pair","args":[{"string":"tz1UeT3VS8LuAkvB66tjQTTDP1LFf3DEC4uA"},{"prim":"Pair","args":[{"int":"12"},{"int":"1"}]}]}]]}]}}';
      expect(service.parseTokenTransfer(JSON.parse(fa12))).toEqual({
        tokenId: `KT1REPEBMQS3Be8ZybkQQfSwAv3g4pHJViuK:0`,
        to: `tz1UeT3VS8LuAkvB66tjQTTDP1LFf3DEC4uA`,
        amount: `20`
      });
      expect(service.parseTokenTransfer(JSON.parse(fa2))).toEqual({
        tokenId: `KT1T6uCxdWcvUhKZfeg83QU2wrormgy63Upd:12`,
        to: `tz1UeT3VS8LuAkvB66tjQTTDP1LFf3DEC4uA`,
        amount: `1`
      });
      expect(service.parseTokenTransfer(JSON.parse(faNone))).toBeFalsy();
    });
  });

  describe('> Secp256k1', () => {
    it('Correct signs', function () {
      const skHex = '59e0ed31a00eabaada1cc39fa6ac06e625f8b5b1cd5b1505116842c02a0e7962';
      const kpWrong = {
        sk: 'spsk279WYFPULj35YkjRhmQEamiAsCYkvFGx74udMQ5fdikbfF3PEa',
        pk: 'sppk7atwvx9ecvaTwA7SBBrwHL5Jf4mYMeLSDuDFsSTnfKyJMstkaAG',
        pkh: 'tz2VouZdAQfwLPS2RuDisRXqpkKpWP44kVw3'
      };
      const kpCorrect = {
        sk: 'spsk279WYFPULj35YkjRhmQEamiAsCYkvFGx74udMQ5fdikbfF3PEa',
        pk: 'sppk7cqh7BbgUMFh4yh95mUwEeg5aBPG1MBK1YHN7b9geyygrUMZByr',
        pkh: 'tz2UYG1doNM6AaXhVRyJXpEELmn8vo7pVZj5'
      };
      let kp = service.spPrivKeyToKeyPair(skHex);
      expect(kp).not.toEqual(kpWrong);
      kp = service.spPrivKeyToKeyPair(skHex);
      expect(kp).toEqual(kpCorrect);
    });
    it('derive keypair', () => {
      const hexSk = '5a557ccd5893a316f4729f48e3cf7cc80cb7aaa0f180773b46edb910d76f8952';
      const kp = service.spPrivKeyToKeyPair(hexSk);
      const keypair = {
        sk: 'spsk27M974UiZToCo5xrqnSGFbRAYCKcMbV8d5DZSG1UXHhhD9KAHZ',
        pk: 'sppk7cBjVH9SKnUvLoB37pypfvS3HneSrjN1zQ1jHDySkdgSKCRfdks',
        pkh: 'tz2JyFwMxKTuimkiH2x8XUns4qBVZAvCWL6Z'
      };
      const pubKey = {
        X: '7b6a196a3f2c6a11b230bec5ffde0daa56ba6f18e7a05f1134f2b4b238890acf',
        Y: '962957f376c1f30da1589c75b895d7edb922e193f8b36bcf5a4f3da684d6a503'
      };
      expect(kp).toEqual(keypair);
      expect(service.spPointsToPkh(pubKey.X, pubKey.Y)).toEqual(keypair.pkh);
    });
  });
  /*
	describe('> Contract invocations', () => {
		it('convert string expression to mic', () => {
		const sexp = '(Left (Pair "tz1RsgqzQpc4xLu1vqGPomnYNaXjKwGhhP4w" (Pair (Some (Pair (Pair (Pair 0x6b6c6173 True) 0x) (Pair (Pair 9000 {}) (Pair (Pair (Pair 0 True) (Pair 6 (Pair 1 0))) (Pair (Pair True 16383) (Pair 100 True)))))) None)))';
		const paramJson = '{"entrypoint":"default","value":{"prim":"Left","args":[{"prim":"Pair","args":[{"string":"tz1RsgqzQpc4xLu1vqGPomnYNaXjKwGhhP4w"},{"prim":"Pair","args":[{"prim":"Some","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"bytes":"6b6c6173"},{"prim":"True"}]},{"bytes":""}]},{"prim":"Pair","args":[{"prim":"Pair","args":[{"int":"9000"},[]]},{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"int":"0"},{"prim":"True"}]},{"prim":"Pair","args":[{"int":"6"},{"prim":"Pair","args":[{"int":"1"},{"int":"0"}]}]}]},{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"True"},{"int":"16383"}]},{"prim":"Pair","args":[{"int":"100"},{"prim":"True"}]}]}]}]}]}]},{"prim":"None"}]}]}]}}';
		const mic = service.exp2obj(sexp, null);
		expect(mic).toBeDefined();
		expect(JSON.stringify(mic)).toEqual(paramJson);
		});
	});
	*/
});

/**
 * Description: [Also Applies to: Delegate, Transfer, Originate]
 * 			 - Delegate makes three calls to node RPCs for current block hash, actions counter & manager/key.
 *			 - The data is formatted into the fop Object[] and if the manager key is undefined it appends a reveal operation.
 *
 *			 State(s):
 * 						1: Parameter 'to' is empty. It doesn't set the fop.contents[0].delegate property? Does this nullify delegate?
 *						2: Parameter to is valid & manager.key is undefined. Appends a reveal operation which changes fop object expected.
 *						3: Parameter to is valid & manager.key is defined. "Passes" returns operation(fop,keys)
 *			 Testing:
 *						- Perform for each state(3)
 *						- CALLTHROUGH EXPECT return of Observable<any> object if we are not mocking/stubbing operation.
 *						- MOCK EXPECT operation to have been called with (fop,keys). Compare to prebuilt data for expectations.
 *
 *			 @Parameters: ( from: string, to: string, fee: number = 0, keys: KeyPair )
 *			 @Returns: Observable<any>
 */

/**Example (1):
	+ ------------------------------------------- +
	// EXAMPLE FOUND ONLINE

	it('description', inject([HttpClient], (httpClient: HttpClient) => {
		spyOn(httpClient.get).and.returnValue(Observable.of([])); // Some array with builds objects?
		component.index().subscribe(builds => {
		expect(builds).toEqual([]); // Your expected builds array previously set in spy
	});

	+ ------------------------------------------- +

	// SUBSCRIBE DATA TYPE I

		//let stream$ = rx.Observable
		let expectedResponse = of({success: false, payload: {opHash: null, msg: 'myfinalophash'}});
		let payload;

		spyOn(service, 'opCheck').and.callThrough();

		payload = service.opCheck(final, newpkh)
					.do(data => console.log(data))
					.subscribe((data) => {
							expect(data).toEqual({success: false, payload: {opHash: null, msg: 'myfinalophash'}});
						})

		expect(payload.closed).toBeTruthy();

	+ ------------------------------------------- +

	// STORE DATA TYPE II

		let result = service.opCheck(final, newpkh)
		let data =  of({success: false, payload: {opHash: null, msg: 'myfinalophash'}});

		console.log('Result',result);
		console.log('Test Data',data);
		expect(result).toEqual(data);
	+ ------------------------------------------- +
 */
