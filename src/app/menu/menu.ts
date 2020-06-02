import {MenuButtonDirective} from './menu-button.directive';
import {ElementRef, Input} from '@angular/core';

export abstract class RootMenu {
  private _children: Array<MenuButtonDirective> = new Array<MenuButtonDirective>();

  @Input('id')
  set id(val: string) {
    if (!this._id) {
      this._id = val;
    }
  }
  get id() {
    return this._id || this._element.nativeElement.getAttribute('id');
  }
  private _id: string;

  constructor(protected _element: ElementRef) {}

  abstract focusFirstChild(): void;
  abstract focusLastChild(): void;

  contains(el: MenuButtonDirective) {
    return (
      this._element.nativeElement.contains(el) ||
      this.getChildren()
        .map((c) => c.contains(el))
        .includes(true)
    );
  }

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
