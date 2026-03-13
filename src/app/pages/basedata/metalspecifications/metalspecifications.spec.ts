import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Metalspecifications } from './metalspecifications';

describe('Metalspecifications', () => {
  let component: Metalspecifications;
  let fixture: ComponentFixture<Metalspecifications>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Metalspecifications]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Metalspecifications);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
