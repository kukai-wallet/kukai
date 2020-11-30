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
});
