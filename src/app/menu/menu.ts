import {MenuButtonDirective} from './menu-button.directive';
import {FocusKeyManager} from '@angular/cdk/a11y';

export class RootMenu {
  private _children: Array<MenuButtonDirective> = new Array<MenuButtonDirective>();
  protected _keyManager: FocusKeyManager<MenuButtonDirective>;

  get children() {
    return this._children;
  }

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
