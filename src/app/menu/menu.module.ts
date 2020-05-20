import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuPanelDirective } from './menu-panel.directive';
import { MenuBarDirective } from './menu-bar.directive';
import { MenuButtonDirective } from './menu-button.directive';

@NgModule({
  declarations: [MenuPanelDirective, MenuBarDirective, MenuButtonDirective],
  imports: [CommonModule],
  exports: [MenuPanelDirective, MenuBarDirective, MenuButtonDirective],
})
export class MenuModule {}
