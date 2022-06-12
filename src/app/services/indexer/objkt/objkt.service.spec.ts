import { TestBed } from '@angular/core/testing';

import { ObjktService } from './objkt.service';

describe('ObjktService', () => {
  let service: ObjktService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjktService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
