import { TestBed } from '@angular/core/testing';

import { CheckboxStateService } from './checkbox-state.service';

describe('CheckboxStateService', () => {
  let service: CheckboxStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckboxStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
