import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UriHandlerComponent } from './uri-handler.component';

describe('UriHandlerComponent', () => {
  let component: UriHandlerComponent;
  let fixture: ComponentFixture<UriHandlerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UriHandlerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UriHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
