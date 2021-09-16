import { TestBed } from '@angular/core/testing';

import { TeztoolsService } from './teztools.service';

describe('TeztoolsService', () => {
  let service: TeztoolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeztoolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
