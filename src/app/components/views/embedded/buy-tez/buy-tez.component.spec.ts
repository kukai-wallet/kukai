import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyTezComponent } from './buy-tez.component';

describe('BuyTezComponent', () => {
  let component: BuyTezComponent;
  let fixture: ComponentFixture<BuyTezComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuyTezComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BuyTezComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
