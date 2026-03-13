import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Productionlines } from './productionlines';

describe('Productionlines', () => {
  let component: Productionlines;
  let fixture: ComponentFixture<Productionlines>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Productionlines]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Productionlines);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
