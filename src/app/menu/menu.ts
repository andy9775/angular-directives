import {MenuButtonDirective} from './menu-button.directive';
import {ElementRef, Input, Directive, Injectable, QueryList} from '@angular/core';
import {Subject} from 'rxjs';
import {MenuMouseManager} from './mouse-manager';

// TODO can we place the keymanager here?

// TODO need menu interface which implements menu specific
// methods and the MenuPanel should implement it

export interface Menu {
  // closeEventEmitter: Subject<void>;
  _keyboardEventEmitter: Subject<KeyboardEvent>;
  // _activationEventEmitter: Subject<MenuButtonDirective>;
  // get rid of this
  // tabEventEmitter: Subject<void>;
  _mouseManager: MenuMouseManager;
  lablledBy: string;

  getChildren(): QueryList<MenuButtonDirective>;
  hasOpenChild(): boolean;
  contains(el): any;

  focusFirstChild(): void;
  focusLastChild(): void;
}

@Injectable()
@Directive()
/** @docs-private */
export abstract class RootMenu {
  private _children: Array<MenuButtonDirective> = new Array<MenuButtonDirective>();

  protected abstract _element: ElementRef;

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

  abstract focusFirstChild(): void;
  abstract focusLastChild(): void;

  // TODO do we need to check the sub-children or the nativeElement?
  // Or is there another way?
  contains(el: MenuButtonDirective) {
    return (
      this._element.nativeElement.contains(el) ||
      this._getChildren()
        .map((c) => c.contains(el))
        .includes(true)
    );
  }

  _getChildren() {
    return this._children;
  }

  hasOpenChild() {
    return this._children.map((c) => c.isMenuOpen()).includes(true);
  }
}
