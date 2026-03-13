import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Linespeeds } from './linespeeds';

describe('Linespeeds', () => {
  let component: Linespeeds;
  let fixture: ComponentFixture<Linespeeds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Linespeeds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Linespeeds);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
