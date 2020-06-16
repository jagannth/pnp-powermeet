import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PowermeetWebPartComponent } from './powermeet-web-part.component';

describe('PowermeetWebPartComponent', () => {
  let component: PowermeetWebPartComponent;
  let fixture: ComponentFixture<PowermeetWebPartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PowermeetWebPartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PowermeetWebPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
