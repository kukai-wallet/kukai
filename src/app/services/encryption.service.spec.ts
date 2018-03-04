import { TestBed, inject } from '@angular/core/testing';

import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EncryptionService]
    });
  });

  it('should be created', inject([EncryptionService], (service: EncryptionService) => {
    expect(service).toBeTruthy();
  }));
});
