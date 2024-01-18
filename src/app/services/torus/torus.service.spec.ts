import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OperationService } from '../operation/operation.service';
import { TorusService } from './torus.service';
import { InputValidationService } from '../input-validation/input-validation.service';
import { http_imports, translate_imports, ErrorHandlingService } from '../../../../spec/helpers/service.helper';

describe('TorusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [http_imports, translate_imports, RouterTestingModule],
      providers: [TorusService, OperationService, ErrorHandlingService, InputValidationService]
    });
  });
  it('should be created', inject([TorusService], (service: TorusService) => {
    expect(service).toBeTruthy();
  }));
});
