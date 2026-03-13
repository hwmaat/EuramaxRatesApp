import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MenuService } from '@app/services/menu.service';
import { DxMenuModule } from 'devextreme-angular';

@Component({
  selector: 'app-topmenu',
  imports: [CommonModule, DxMenuModule, RouterModule],
  templateUrl: './topmenu.html',
  styleUrl: './topmenu.scss',
})
export class Topmenu {
  @Output() menuItemClick = new EventEmitter<any>();
  private router = inject(Router);
  private menuService = inject(MenuService);
  
  items$ = this.menuService.filteredMenuItems$;

  onItemClick(e: any) {
    console.log('topmenu ==> e', e);
    if (e.itemData?.path) {
      this.router.navigateByUrl(e.itemData.path);
    }
  }
   
  onMenuItemClick(e: any) {
    console.log('topmenu ==> e', e);
    this.menuItemClick.emit(e);
  }
  
}
