import { TestBed } from '@angular/core/testing';

import { ConseilService } from './conseil.service';

describe('ConseilService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConseilService = TestBed.inject(ConseilService);
    expect(service).toBeTruthy();
  });
});
