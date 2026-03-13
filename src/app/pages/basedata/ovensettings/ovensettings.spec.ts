import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ovensettings } from './ovensettings';

describe('Ovensettings', () => {
  let component: Ovensettings;
  let fixture: ComponentFixture<Ovensettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ovensettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ovensettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
