import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticationFailed } from './authentication-failed';

describe('AuthenticationFailed', () => {
  let component: AuthenticationFailed;
  let fixture: ComponentFixture<AuthenticationFailed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthenticationFailed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthenticationFailed);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
