import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MymeetingComponent } from './mymeeting.component';

describe('MymeetingComponent', () => {
  let component: MymeetingComponent;
  let fixture: ComponentFixture<MymeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MymeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MymeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
