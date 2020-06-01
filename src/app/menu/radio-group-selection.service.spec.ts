import { TestBed } from '@angular/core/testing';

import { RadioGroupSelectionService } from './radio-group-selection.service';

describe('RadioGroupSelectionService', () => {
  let service: RadioGroupSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RadioGroupSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
