import { TestBed, inject } from '@angular/core/testing';
import { OperationService } from '../operation/operation.service';
import { TorusService } from './torus.service';
import { InputValidationService } from '../input-validation/input-validation.service';
import { http_imports, translate_imports, ErrorHandlingPipe } from '../../../../spec/helpers/service.helper';

describe('TorusService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
			imports: [http_imports, translate_imports],
			providers: [ TorusService, OperationService, ErrorHandlingPipe, InputValidationService ]
		});
  });
  it('should be created', inject([TorusService], (service: TorusService) => {
    expect(service).toBeTruthy();
  }));
});
