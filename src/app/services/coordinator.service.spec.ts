import { TestBed, inject } from '@angular/core/testing';

import { CoordinatorService } from './coordinator.service';

describe('UpdateCoordinatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoordinatorService]
    });
  });

  it('should be created', inject([CoordinatorService], (service: CoordinatorService) => {
    expect(service).toBeTruthy();
  }));
});
