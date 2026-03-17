import { Component, Input } from '@angular/core';

import { DxLoadPanelModule } from 'devextreme-angular';

@Component({
  selector: 'app-ams-load-panel',
  standalone: true,
  imports: [DxLoadPanelModule],
  templateUrl: './ams-load-panel.component.html',
  styleUrl: './ams-load-panel.component.scss'
})
export class AmsLoadPanelComponent {
  @Input() visible = false;
  @Input() message = 'Loading...';
  @Input() showIndicator = true;
  @Input() showPane = true;
  @Input() shading = true;
  @Input() shadingColor = 'rgba(0,0,0,0.4)';
  @Input() position: unknown = 'center';
  @Input() width = 300;
  @Input() height = 120;
}
