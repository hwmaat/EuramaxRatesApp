import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Peakmetaltemp } from './peakmetaltemp';

describe('Peakmetaltemp', () => {
  let component: Peakmetaltemp;
  let fixture: ComponentFixture<Peakmetaltemp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Peakmetaltemp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Peakmetaltemp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
