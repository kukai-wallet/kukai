import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewImplicitComponent } from './new-implicit.component';

describe('NewImplicitComponent', () => {
  let component: NewImplicitComponent;
  let fixture: ComponentFixture<NewImplicitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewImplicitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewImplicitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
