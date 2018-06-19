import { TestBed, inject } from '@angular/core/testing';

import { TzscanService } from './tzscan.service';

describe('TzscanService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TzscanService]
    });
  });

  it('should be created', inject([TzscanService], (service: TzscanService) => {
    expect(service).toBeTruthy();
  }));
});
