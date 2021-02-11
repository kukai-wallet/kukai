import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbeddedComponent } from './embedded.component';

describe('EmbeddedComponent', () => {
  let component: EmbeddedComponent;
  let fixture: ComponentFixture<EmbeddedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmbeddedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbeddedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
