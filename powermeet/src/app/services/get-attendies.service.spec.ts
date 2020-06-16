import { TestBed } from '@angular/core/testing';

import { GetAttendiesService } from './get-attendies.service';

describe('GetAttendiesService', () => {
  let service: GetAttendiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetAttendiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
