import { TestBed, inject } from '@angular/core/testing';
import { InputValidationService } from './input-validation.service';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { OperationService } from '../operation/operation.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ErrorHandlingPipe } from '../../pipes/error-handling.pipe';

describe('[ InputValidationService ]', () => {
  let service: InputValidationService;
  beforeEach(() => {
    TestBed.configureTestingModule({
		imports: [ HttpClientModule, HttpClientTestingModule, TranslateModule.forRoot(
      { loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }})],
      providers: [InputValidationService, OperationService, ErrorHandlingPipe]
    });
    service = TestBed.inject(InputValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('> Amount', () => {
    it('should be true', () => {
      expect(service.amount('0')).toBeTruthy();
      expect(service.amount('')).toBeTruthy();
      expect(service.amount('1.234567')).toBeTruthy();
      expect(service.amount('1.23456789', 8)).toBeTruthy();
      expect(service.amount('1', 0)).toBeTruthy();
      expect(service.amount('2', 1)).toBeTruthy();
    });
    it('should be false', () => {
      expect(service.amount('1.23456789')).toBeFalsy();
      expect(service.amount('1..234')).toBeFalsy();
      expect(service.amount('1..')).toBeFalsy();
      expect(service.amount('1.234', 0)).toBeFalsy();
      expect(service.amount('1.23x4')).toBeFalsy();
    });
  });
  describe('> isMessageSigning', () => {
    it('should be true', () => {
      // Tezos Signed Message: mydapp.com 2021-01-14T15:16:04Z Hello world!
      const payload = '05010000004254657a6f73205369676e6564204d6573736167653a206d79646170702e636f6d20323032312d30312d31345431353a31363a30345a2048656c6c6f20776f726c6421';
      expect(service.isMessageSigning(payload)).toBeTruthy();
    });
    it('should be false', () => {
      // Permit
      const payload = '05070707070a00000004a83650210a0000001601cc71fa0ddd7113f936438158e407160675706ae800070700010a000000200f0db0ce6f057a8835adb6a2c617fd8a136b8028fac90aab7b4766def688ea0c';
      expect(service.isMessageSigning(payload)).toBeFalsy();
    });
  });
});
