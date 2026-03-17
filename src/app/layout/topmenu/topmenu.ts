import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MenuService } from '@app/services/menu.service';
import { DxMenuModule } from 'devextreme-angular';
import { MenuClickEvent } from '@app/models/menu-events.model';

@Component({
  selector: 'app-topmenu',
  imports: [CommonModule, DxMenuModule, RouterModule],
  templateUrl: './topmenu.html',
  styleUrl: './topmenu.scss',
})
export class Topmenu {
  @Output() menuItemClick = new EventEmitter<MenuClickEvent>();
  private router = inject(Router);
  private menuService = inject(MenuService);
  
  items$ = this.menuService.filteredMenuItems$;

  onItemClick(e: MenuClickEvent) {
    if (e.itemData?.path) {
      this.router.navigateByUrl(e.itemData.path);
    }
  }
   
  onMenuItemClick(e: MenuClickEvent) {
    this.menuItemClick.emit(e);
  }
  
}
