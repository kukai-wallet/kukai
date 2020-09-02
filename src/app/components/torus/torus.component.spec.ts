import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TorusComponent } from './torus.component';

describe('TorusComponent', () => {
  let component: TorusComponent;
  let fixture: ComponentFixture<TorusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TorusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TorusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
