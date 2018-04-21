import { TestBed, inject } from '@angular/core/testing';

import { OperationService } from './operation.service';

describe('OperationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OperationService]
    });
  });

  it('should be created', inject([OperationService], (service: OperationService) => {
    expect(service).toBeTruthy();
  }));
});
