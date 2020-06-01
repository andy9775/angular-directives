import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MenuPanelDirective} from './menu-panel.directive';
import {MenuBarDirective} from './menu-bar.directive';
import {MenuButtonDirective} from './menu-button.directive';
import {MenuDirective} from './menu.directive';
import {MenuGroupDirective} from './menu-group.directive';

@NgModule({
  declarations: [
    MenuPanelDirective,
    MenuBarDirective,
    MenuButtonDirective,
    MenuDirective,
    MenuGroupDirective,
  ],
  imports: [CommonModule],
  exports: [
    MenuPanelDirective,
    MenuBarDirective,
    MenuButtonDirective,
    MenuDirective,
    MenuGroupDirective,
  ],
})
export class MenuModule {}
