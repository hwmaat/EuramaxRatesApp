import { Component, inject } from '@angular/core';

import { DxButtonModule } from 'devextreme-angular';
import { Globals } from '@app/services/globals.service';

@Component({
  selector: 'app-server-down-banner',
  standalone: true,
  imports: [DxButtonModule],
  templateUrl: './server-down-banner.component.html',
  styleUrls: ['./server-down-banner.component.scss']
})
export class ServerDownBannerComponent {
  readonly globals = inject(Globals);

  retry(): void {
    // simplest + reliable: forces the app to attempt calls again
    window.location.reload();
  }

  dismiss(): void {
    // optional: allows user to hide the banner (until next failing request)
    this.globals.setServerAvailable(true);
  }
}
