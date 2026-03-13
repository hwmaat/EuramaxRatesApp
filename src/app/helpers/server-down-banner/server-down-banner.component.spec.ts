import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerDownBannerComponent } from './server-down-banner.component';

describe('ServerDownBannerComponent', () => {
  let component: ServerDownBannerComponent;
  let fixture: ComponentFixture<ServerDownBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerDownBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerDownBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
