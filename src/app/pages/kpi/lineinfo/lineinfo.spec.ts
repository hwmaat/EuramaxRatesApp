import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lineinfo } from './lineinfo';

describe('Lineinfo', () => {
  let component: Lineinfo;
  let fixture: ComponentFixture<Lineinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lineinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lineinfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
