import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Specmetrics } from './specmetrics';

describe('Specmetrics', () => {
  let component: Specmetrics;
  let fixture: ComponentFixture<Specmetrics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Specmetrics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Specmetrics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
