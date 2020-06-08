import {Directive, TemplateRef, Input} from '@angular/core';
import {MenuDirective} from './menu-bar.directive';

let _uniqueId = 0;
@Directive({
  selector: '[appMenuPanel], [cdkMenuPanel]',
  exportAs: 'cdkMenuPanel',
})
export class MenuPanelDirective {
  _menu: MenuDirective;
  @Input() id = `menu-panel-${_uniqueId++}`;
  constructor(public template: TemplateRef<HTMLElement>) {}

  registerMenu(child: MenuDirective) {
    this._menu = child;
  }
}
