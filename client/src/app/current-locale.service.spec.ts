import { TestBed } from '@angular/core/testing';

import { CurrentLocaleService } from './current-locale.service';

describe('CurrentLocaleService', () => {
  let service: CurrentLocaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentLocaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
