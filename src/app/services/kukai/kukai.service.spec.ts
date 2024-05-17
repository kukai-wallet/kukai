import { TestBed } from '@angular/core/testing';
import { KukaiService } from './kukai.service';
import { SubjectService } from '../subject/subject.service';

describe('KukaiService', () => {
  let service: KukaiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [SubjectService]
    });
  });

  it('should be created', () => {
    expect(service).toBeFalsy();
  });
});
