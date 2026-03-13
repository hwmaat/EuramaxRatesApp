import { Component, Output, EventEmitter, inject } from '@angular/core';
import { DxTreeViewModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { MenuService } from '@app/services/menu.service';


@Component({
  selector: 'side-menu',
  standalone: true,
  imports: [CommonModule, DxTreeViewModule],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})

export class SideMenuComponent {
  @Output() menuItemClick = new EventEmitter<any>();
  private menu = inject(MenuService);

  // Observable of the filtered tree
  menuItems$ = this.menu.filteredMenuItems$;

  onMenuItemClick(e: any) {
    this.menuItemClick.emit(e);
  }
}
