import { TestBed, inject } from '@angular/core/testing';

import { UpdateCoordinatorService } from './update-coordinator.service';

describe('UpdateCoordinatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UpdateCoordinatorService]
    });
  });

  it('should be created', inject([UpdateCoordinatorService], (service: UpdateCoordinatorService) => {
    expect(service).toBeTruthy();
  }));
});
