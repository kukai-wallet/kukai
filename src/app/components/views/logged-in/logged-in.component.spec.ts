import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoggedInComponent } from './logged-in.component';

describe('LoggedInComponent', () => {
  let component: LoggedInComponent;
  let fixture: ComponentFixture<LoggedInComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LoggedInComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoggedInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
