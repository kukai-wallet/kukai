import { TestBed } from '@angular/core/testing';
import { OperationService } from '../operation/operation.service';
import { BeaconService } from './beacon.service';
import { MessageService } from '../message/message.service';

describe('BeaconService', () => {
  let service: BeaconService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OperationService, MessageService]
    });
    service = TestBed.inject(BeaconService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
