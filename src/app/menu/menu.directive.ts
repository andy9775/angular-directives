import {
  Directive,
  Input,
  ContentChildren,
  QueryList,
  AfterContentInit,
  ViewChildren,
} from '@angular/core';
import {MenuPanelDirective} from './menu-panel.directive';
import {MenuButtonDirective} from './menu-button.directive';

/*
  TODO
    aria-label (based on the connected button)
*/
@Directive({
  selector: '[cdkMenu]',
  exportAs: 'cdkMenu',
  host: {
    // a11y
    role: 'menu',
    tabindex: '-1',
    '[attr.aria-orientation]': 'orientation',
  },
})
export class MenuDirective {
  @Input('cdkMenuOrientation') orientation: 'horizontal' | 'vertical' = 'vertical';
  /*
    Can't do:
      @ViewChildren(MenuButtonDirective) _children: QueryList<MenuButtonDirective>;
    throws "Uncaught reference error"

    We register child buttons with their menu
   */
  children: Array<MenuButtonDirective> = new Array<MenuButtonDirective>();
  // TODO key manager
  constructor(private _parent: MenuPanelDirective) {
    _parent.registerChildMenu(this);
  }

  registerChild(child: MenuButtonDirective) {
    child.mouseEnterEmitter.subscribe((element: MenuButtonDirective) => {
      this.children.forEach((child) => {
        if (child !== element) {
          child.closeMenu();
        }
      });
    });
    this.children.push(child);
  }
}
