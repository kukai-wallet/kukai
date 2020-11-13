import { TestBed } from '@angular/core/testing';

import { IndexerService } from './indexer.service';

describe('IndexerAdapterService', () => {
  let service: IndexerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
