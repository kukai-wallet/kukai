import { TestBed, inject } from '@angular/core/testing';

import { ActivityService } from './activity.service';

describe('TzscanService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActivityService]
    });
  });

  it('should be created', inject([ActivityService], (service: ActivityService) => {
    expect(service).toBeTruthy();
  }));
});
