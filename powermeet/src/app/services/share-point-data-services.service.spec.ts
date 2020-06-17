import { TestBed } from '@angular/core/testing';

import { SharePointDataServicesService } from './share-point-data-services.service';

describe('SharePointDataServicesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SharePointDataServicesService = TestBed.get(SharePointDataServicesService);
    expect(service).toBeTruthy();
  });
});
