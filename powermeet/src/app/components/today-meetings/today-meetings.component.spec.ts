import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayMeetingsComponent } from './today-meetings.component';

describe('TodayMeetingsComponent', () => {
  let component: TodayMeetingsComponent;
  let fixture: ComponentFixture<TodayMeetingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodayMeetingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodayMeetingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
