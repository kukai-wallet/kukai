import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewWalletComponent } from './new-wallet.component';

describe('NewWalletComponent', () => {
  let component: NewWalletComponent;
  let fixture: ComponentFixture<NewWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewWalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
