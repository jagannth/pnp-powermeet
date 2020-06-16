import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PastMeetingsComponent } from './past-meetings.component';

describe('PastMeetingsComponent', () => {
  let component: PastMeetingsComponent;
  let fixture: ComponentFixture<PastMeetingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PastMeetingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PastMeetingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
