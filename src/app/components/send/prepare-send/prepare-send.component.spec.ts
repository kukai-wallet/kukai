import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepareSendComponent } from './prepare-send.component';

describe('PrepareSendComponent', () => {
  let component: PrepareSendComponent;
  let fixture: ComponentFixture<PrepareSendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrepareSendComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrepareSendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
