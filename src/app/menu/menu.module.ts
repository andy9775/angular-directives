import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MenuPanelDirective} from './menu-panel.directive';
import {MenuBarDirective} from './menu-bar.directive';
import {MenuButtonDirective} from './menu-button.directive';
import {MenuDirective} from './menu.directive';

@NgModule({
  declarations: [MenuPanelDirective, MenuBarDirective, MenuButtonDirective, MenuDirective],
  imports: [CommonModule],
  exports: [MenuPanelDirective, MenuBarDirective, MenuButtonDirective, MenuDirective],
})
export class MenuModule {}
