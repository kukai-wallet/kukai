import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnemonicImportComponent } from './mnemonic-import.component';

describe('IcoWalletComponent', () => {
  let component: MnemonicImportComponent;
  let fixture: ComponentFixture<MnemonicImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnemonicImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnemonicImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
