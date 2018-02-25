import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastComponent } from './broadcast.component';

describe('BroadcastComponent', () => {
  let component: BroadcastComponent;
  let fixture: ComponentFixture<BroadcastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BroadcastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BroadcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
