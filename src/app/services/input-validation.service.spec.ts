import { TestBed, inject } from '@angular/core/testing';
import { InputValidationService } from './input-validation.service';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { OperationService } from './operation.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ErrorHandlingPipe } from '../pipes/error-handling.pipe';

describe('[ InputValidationService ]', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
		imports: [ HttpClientModule, HttpClientTestingModule, TranslateModule.forRoot(
      { loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }})],
      providers: [InputValidationService, OperationService, ErrorHandlingPipe]
    });
  });

  it('should be created', inject([InputValidationService], (service: InputValidationService) => {
    expect(service).toBeTruthy();
  }));
});
