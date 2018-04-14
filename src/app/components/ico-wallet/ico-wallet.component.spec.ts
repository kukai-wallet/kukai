import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcoWalletComponent } from './ico-wallet.component';

describe('IcoWalletComponent', () => {
  let component: IcoWalletComponent;
  let fixture: ComponentFixture<IcoWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcoWalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcoWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
