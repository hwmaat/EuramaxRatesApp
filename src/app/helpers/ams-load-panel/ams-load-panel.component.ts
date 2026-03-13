import { Component, Input } from '@angular/core';

import { DxLoadPanelModule } from 'devextreme-angular';

@Component({
  selector: 'ams-load-panel',
  standalone: true,
  imports: [DxLoadPanelModule],
  templateUrl: './ams-load-panel.component.html',
  styleUrl: './ams-load-panel.component.scss'
})
export class AmsLoadPanelComponent {
  @Input() visible: boolean = false;
  @Input() message: string = 'Loading...';
  @Input() showIndicator: boolean = true;
  @Input() showPane: boolean = true;
  @Input() shading: boolean = true;
  @Input() shadingColor: string = 'rgba(0,0,0,0.4)';
  @Input() position: any = 'center';
  @Input() width: number = 300;
  @Input() height: number = 120;
}
