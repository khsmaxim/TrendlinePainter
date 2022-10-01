import { TestBed } from '@angular/core/testing';

import { BoorkmarksService } from './bookmark.service';

describe('BoorkmarksService', () => {
  let service: BoorkmarksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoorkmarksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
