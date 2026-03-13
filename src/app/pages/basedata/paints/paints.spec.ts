import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paints } from './paints';

describe('Paints', () => {
  let component: Paints;
  let fixture: ComponentFixture<Paints>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paints]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Paints);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
