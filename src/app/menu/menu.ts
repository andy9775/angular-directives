import {MenuButtonDirective} from './menu-button.directive';

export abstract class RootMenu {
  private _children: Array<MenuButtonDirective> = new Array<MenuButtonDirective>();

  focusFirstChild?(): void;
  focusLastChild?(): void;

  getChildren() {
    return this._children;
  }

  hasOpenChild() {
    return this._children.map((c) => c.isOpen()).includes(true);
  }

  protected registerChild(child: MenuButtonDirective) {
    child.mouseEnterEmitter.subscribe((element: MenuButtonDirective) => {
      this._children.forEach((child) => {
        if (child !== element) {
          child.closeMenu();
        }
      });
    });
    this._children.push(child);
  }
}
