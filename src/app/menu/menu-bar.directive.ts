import {Directive, Input} from '@angular/core';
import {MenuButtonDirective} from './menu-button.directive';

/*
  TODO
    aria-haspopup?
    aria-expanded?
*/
@Directive({
  selector: '[appMenuBar], [cdkMenuBar]',
  exportAs: 'cdkMenuBar',
  host: {
    role: 'menubar',
    tabindex: '0',
    '[attr.aria-orientation]': 'orientation',
  },
})
export class MenuBarDirective {
  // according to the aria spec, menu bars have horizontal default orientation
  @Input('cdkMenuBarOrientation') orientation: 'horizontal' | 'vertical' = 'horizontal';

  private _children: Array<MenuButtonDirective> = new Array<MenuButtonDirective>();

  // TODO key manager
  constructor() {}

  registerChild(child: MenuButtonDirective) {
    child.mouseEnterEmitter.subscribe((element: MenuButtonDirective) => {
      this._children.forEach((child) => {
        if (child !== element) {
          child.closeMenu();
        }
      });
    });
    this._children.push(child);
  }

  hasOpenChild() {
    return this._children.map((c) => c.isOpen()).includes(true);
  }
}
