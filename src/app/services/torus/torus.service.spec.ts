import { TestBed } from '@angular/core/testing';
import { OperationService } from '../operation/operation.service';
import { TorusService } from './torus.service';
import { http_imports, translate_imports, ErrorHandlingPipe } from '../../../../spec/helpers/service.helper';

describe('TorusService', () => {
  let service: TorusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
			imports: [http_imports, translate_imports],
			providers: [OperationService, ErrorHandlingPipe ]
		});
    service = TestBed.inject(TorusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
