import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QrScannerComponent } from './qr-scanner.component';

describe('QrScannerComponent', () => {
  let component: QrScannerComponent;
  let fixture: ComponentFixture<QrScannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QrScannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
