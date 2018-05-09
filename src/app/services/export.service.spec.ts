import { TestBed, inject } from '@angular/core/testing';

import { ExportService } from './export.service';

describe('ExportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExportService]
    });
  });

  it('should be created', inject([ExportService], (service: ExportService) => {
    expect(service).toBeTruthy();
  }));
});
