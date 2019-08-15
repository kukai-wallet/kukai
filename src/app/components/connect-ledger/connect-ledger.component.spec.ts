import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectLedgerComponent } from './connect-ledger.component';

describe('ConnectLedgerComponent', () => {
  let component: ConnectLedgerComponent;
  let fixture: ComponentFixture<ConnectLedgerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectLedgerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
