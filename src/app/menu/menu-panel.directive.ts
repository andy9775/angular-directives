import {Directive, TemplateRef, ContentChild, OnDestroy, QueryList, Input} from '@angular/core';
import {MenuDirective} from './menu.directive';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MenuButtonDirective} from './menu-button.directive';
import {MenuMouseManager} from './mouse-manager';

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
