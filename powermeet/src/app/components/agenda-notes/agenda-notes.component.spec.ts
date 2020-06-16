import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaNotesComponent } from './agenda-notes.component';

describe('AgendaNotesComponent', () => {
  let component: AgendaNotesComponent;
  let fixture: ComponentFixture<AgendaNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgendaNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendaNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
