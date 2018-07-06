import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineSigningComponent } from './offline-signing.component';

describe('OfflineSigningComponent', () => {
  let component: OfflineSigningComponent;
  let fixture: ComponentFixture<OfflineSigningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfflineSigningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineSigningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
