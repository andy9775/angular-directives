import {
  Directive,
  Input,
  ElementRef,
  ContentChildren,
  QueryList,
  AfterContentInit,
  OnDestroy,
} from '@angular/core';
import {MenuPanelDirective} from './menu-panel.directive';
import {MenuButtonDirective} from './menu-button.directive';
import {RootMenu} from './menu';
import {MenuKeyboardManager} from './keymanager';
import {MenuMouseManager} from './mouse-manager';

/*
  TODO
    aria-label (provided by user)
*/
@Directive({
  selector: '[cdkMenu]',
  exportAs: 'cdkMenu',
  host: {
    '(keydown)': '_keyManager.handleEvent($event)',
    // a11y
    role: 'menu',
    '[attr.aria-orientation]': 'orientation',
    '[attr.aria-lablledby]': 'lablledBy',
  },
})
export class MenuDirective extends RootMenu implements AfterContentInit, OnDestroy {
  @Input('cdkMenuOrientation') orientation: 'horizontal' | 'vertical' = 'vertical';

  _keyManager: MenuKeyboardManager;
  _mouseManager: MenuMouseManager;

  @ContentChildren(MenuButtonDirective, {descendants: true}) private readonly _allItems: QueryList<
    MenuButtonDirective
  >;

  get _keyboardEventEmitter() {
    return this._keyManager._keyboardEventEmitter;
  }

  // get _activationEventEmitter() {
  //   return this._mouseManager._activationEventEmitter;
  // }

  lablledBy: string | null = null;

  constructor(private _parent: MenuPanelDirective, protected _element: ElementRef) {
    super();
  }

  ngAfterContentInit() {
    this._keyManager = new MenuKeyboardManager(this._allItems, this.orientation);
    this._mouseManager = new MenuMouseManager(this._keyManager, this._allItems, true);
    this._parent.registerMenu(this);
  }

  focusFirstChild() {
    this._keyManager.focusFirstItem();
  }
  focusLastChild() {
    this._keyManager.focusLastItem();
  }

  ngOnDestroy() {
    this._keyManager.onDestroy();
    this._mouseManager.onDestroy();
    // close any open child menu items when this menu gets destroyed
    this._allItems.filter((c) => c.hasSubmenu() && c.isMenuOpen()).forEach((c) => c.onClick());
  }

  getChildren() {
    return this._allItems;
  }

  // registerChild(child: MenuButtonDirective) {
  //   super.registerChild(child);
  //   console.log('register');
  //   child.keyboardEventEmitter.subscribe((e) => this.keyboardEventEmitter.next(e));
  //   child.id = `cdk-menu-button-${this.getChildren().length}`;
  // }
}
