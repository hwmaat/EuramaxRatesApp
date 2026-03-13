import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishDetails } from './finish-details';

describe('FinishDetails', () => {
  let component: FinishDetails;
  let fixture: ComponentFixture<FinishDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinishDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinishDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
