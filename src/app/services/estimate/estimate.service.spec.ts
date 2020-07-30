import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { EstimateService } from './estimate.service';
import { http_imports, rx, translate_imports, ErrorHandlingPipe } from '../../../../spec/helpers/service.helper';
import { OperationService } from '../operation/operation.service';
import { of, Observable } from 'rxjs';


import { TranslateService, TranslateLoader, TranslateFakeLoader, TranslateModule } from '@ngx-translate/core';

describe('EstimateService', () => {
  // class to inspect & dependencies
  let service: EstimateService;
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        http_imports,
        translate_imports],
      providers: [
        EstimateService,
        OperationService,
        TranslateService,
        ErrorHandlingPipe
      ]
    });

    // service dependencies
    service = TestBed.inject(EstimateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should be defined', function () {
    expect(service).toBeDefined();
  });
  describe('> Estimate limits/cost for transactions ', () => {
    it('Should estimate batch transaction', async function () {
      spyOn(service, 'simulate').and.returnValue(of(JSON.parse('{"contents":[{"kind":"transaction","source":"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb","fee":"0","counter":"468258","gas_limit":"800000","storage_limit":"60000","amount":"1","destination":"tz1LcuQHNVQEWP2fZjk1QYZGNrfLDwrT3SyZ","metadata":{"balance_updates":[],"operation_result":{"status":"applied","balance_updates":[{"kind":"contract","contract":"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb","change":"-1"},{"kind":"contract","contract":"tz1LcuQHNVQEWP2fZjk1QYZGNrfLDwrT3SyZ","change":"1"}],"consumed_gas":"10207"}}},{"kind":"transaction","source":"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb","fee":"0","counter":"468259","gas_limit":"800000","storage_limit":"60000","amount":"1","destination":"KT1NXwhVgf7Ge7iS9bCUzMNVJeeB1Eni5kVS","metadata":{"balance_updates":[],"operation_result":{"status":"applied","storage":{"bytes":"00a2d2f0526e018e5c555383c21e213d317db559dc"},"balance_updates":[{"kind":"contract","contract":"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb","change":"-1"},{"kind":"contract","contract":"KT1NXwhVgf7Ge7iS9bCUzMNVJeeB1Eni5kVS","change":"1"}],"consumed_gas":"15285","storage_size":"232"}}},{"kind":"transaction","source":"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb","fee":"1000000","counter":"468260","gas_limit":"800000","storage_limit":"60000","amount":"1","destination":"tz1TwVimQy3BywXoSszdFXjT9bSTQrsZYo2u","metadata":{"balance_updates":[{"kind":"contract","contract":"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb","change":"-1000000"},{"kind":"freezer","category":"fees","delegate":"tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU","cycle":151,"change":"1000000"}],"operation_result":{"status":"applied","balance_updates":[{"kind":"contract","contract":"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb","change":"-1"},{"kind":"contract","contract":"tz1TwVimQy3BywXoSszdFXjT9bSTQrsZYo2u","change":"1"},{"kind":"contract","contract":"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb","change":"-257000"}],"consumed_gas":"10207","allocated_destination_contract":true}}}]}')));
      await service.init('BLU5JYNPCDVhm6pgJsrDp1qQ8abxu9MgFnWWHVyrhRHD3UeKLhp', 'NetXUdfLh6Gm88t', 468257, 'edpkuHo1zj3e9fVky1iq94LQY6tKfMNwkaoBEe3JFiPXxT3i4XkUxU', 'edpkuHo1zj3e9fVky1iq94LQY6tKfMNwkaoBEe3JFiPXxT3i4XkUxU', 'tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb');
      const ans = await service.estimate(JSON.parse('[{"to":"tz1LcuQHNVQEWP2fZjk1QYZGNrfLDwrT3SyZ","amount":3,"gasLimit":0,"storageLimit":0},{"to":"KT1NXwhVgf7Ge7iS9bCUzMNVJeeB1Eni5kVS","amount":5,"gasLimit":0,"storageLimit":0},{"to":"tz1TwVimQy3BywXoSszdFXjT9bSTQrsZYo2u","amount":7,"gasLimit":0,"storageLimit":0}]'), 'tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb');
      const ref = {
        customLimits: [{
          gasLimit: 10287,
          storageLimit: 0
        }, {
          gasLimit: 15365,
          storageLimit: 0
        }, {
          gasLimit: 10287,
          storageLimit: 257
        }],
        fee: 0.003988,
        burn: 0.257,
        gas: 11980,
        storage: 86,
        reveal: false
      };
      expect(ans).toEqual(ref);
    });
    /*
    it('Should estimate contract invocation', async function () {
      spyOn(service, 'simulate').and.returnValue(of(JSON.parse('{"contents":[{"kind":"transaction","source":"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb","fee":"1000000","counter":"468258","gas_limit":"800000","storage_limit":"60000","amount":"1500000","destination":"KT1NVzGBXKiD4QoxomkBf3Dphu5RPWtkL9eR","parameters":{"entrypoint":"default","value":{"prim":"Left","args":[{"prim":"Pair","args":[{"string":"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb"},{"prim":"Pair","args":[{"prim":"Some","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"bytes":"426c6162"},{"prim":"True"}]},{"bytes":""}]},{"prim":"Pair","args":[{"prim":"Pair","args":[{"int":"9000"},[]]},{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"int":"0"},{"prim":"True"}]},{"prim":"Pair","args":[{"int":"6"},{"prim":"Pair","args":[{"int":"1"},{"int":"0"}]}]}]},{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"True"},{"int":"16383"}]},{"prim":"Pair","args":[{"int":"100"},{"prim":"True"}]}]}]}]}]}]},{"prim":"None"}]}]}]}},"metadata":{"balance_updates":[{"kind":"contract","contract":"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb","change":"-1000000"},{"kind":"freezer","category":"fees","delegate":"tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU","cycle":155,"change":"1000000"}],"operation_result":{"status":"applied","storage":{"prim":"Pair","args":[{"int":"538"},{"prim":"Pair","args":[{"bytes":"000051bc0c385a7324d420517f711d7b84f7fe01f2e7"},{"prim":"Pair","args":[{"int":"1500000"},{"int":"500000"}]}]}]},"big_map_diff":[{"action":"update","big_map":"538","key_hash":"exprvH7yBvk23mUdmAGDfw1ymEa2yVpFWkfyybdMhypf73w8Kmbm5D","key":{"bytes":"00a2d2f0526e018e5c555383c21e213d317db559dc"},"value":{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Some","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"bytes":"426c6162"},{"prim":"True"}]},{"bytes":""}]},{"prim":"Pair","args":[{"prim":"Pair","args":[{"int":"9000"},[]]},{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"Pair","args":[{"int":"0"},{"prim":"True"}]},{"prim":"Pair","args":[{"int":"6"},{"prim":"Pair","args":[{"int":"1"},{"int":"0"}]}]}]},{"prim":"Pair","args":[{"prim":"Pair","args":[{"prim":"True"},{"int":"16383"}]},{"prim":"Pair","args":[{"int":"100"},{"prim":"True"}]}]}]}]}]}]},{"prim":"None"}]},{"int":"1582620786"}]}}],"balance_updates":[{"kind":"contract","contract":"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb","change":"-151000"},{"kind":"contract","contract":"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb","change":"-1500000"},{"kind":"contract","contract":"KT1NVzGBXKiD4QoxomkBf3Dphu5RPWtkL9eR","change":"1500000"}],"consumed_gas":"50808","storage_size":"18636","paid_storage_size_diff":"151"}}}]}')));
      await service.init('BKsYq2nm7vFWggRW3G9u3sWNydH1emZAgFJmEtYjEdNAN2v4hYd', 'NetXUdfLh6Gm88t', 468257, 'edpkuHo1zj3e9fVky1iq94LQY6tKfMNwkaoBEe3JFiPXxT3i4XkUxU', 'edpkuHo1zj3e9fVky1iq94LQY6tKfMNwkaoBEe3JFiPXxT3i4XkUxU', 'tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb');
      const ans = await service.estimate(
        JSON.parse('[{"to":"KT1NVzGBXKiD4QoxomkBf3Dphu5RPWtkL9eR","amount":1.5,"gasLimit":0,"storageLimit":0,"entrypoint":"","params":"(Left (Pair \\\"tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb\\\" (Pair (Some (Pair (Pair (Pair 0x426c6162 True) 0x) (Pair (Pair 9000 {}) (Pair (Pair (Pair 0 True) (Pair 6 (Pair 1 0))) (Pair (Pair True 16383) (Pair 100 True)))))) None)))"}]'),
        'tz1aUxrUek1tSCP4pTPLrSNhYGSMdwyzuYTb',
        true);
      const ref = {
        customLimits: [{
          gasLimit: 50908,
          storageLimit: 151
        }],
        fee: 0.005483,
        burn: 0.151,
        gas: 50908,
        storage: 151
      };
      expect(ans).toEqual(ref);
    });*/
  });
});
