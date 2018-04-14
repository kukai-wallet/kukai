import { TestBed, inject } from '@angular/core/testing';

import { TzrateService } from './tzrate.service';

describe('TzrateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TzrateService]
    });
  });

  it('should be created', inject([TzrateService], (service: TzrateService) => {
    expect(service).toBeTruthy();
  }));
});
