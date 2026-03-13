import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Finishes } from './finishes';

describe('Finishes', () => {
  let component: Finishes;
  let fixture: ComponentFixture<Finishes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Finishes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Finishes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
