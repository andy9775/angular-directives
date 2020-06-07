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
import {Subject} from 'rxjs';

/*
  TODO
    aria-label (provided by user)
*/
@Directive({
  selector: '[cdkMenu]',
  exportAs: 'cdkMenu',
  host: {
    '(keydown)': '_keyManager.handleEvent($event)',
    '(mouseenter)': 'mouseEnter($event)',
    // a11y
    role: 'menu',
    '[attr.aria-orientation]': 'orientation',
    '[attr.aria-lablledby]': 'lablledBy',
  },
})
export class MenuDirective extends RootMenu implements AfterContentInit, OnDestroy {
  @Input('cdkMenuOrientation') orientation: 'horizontal' | 'vertical' = 'vertical';
  // private _keyManager = new MenuKeyManager(this.getChildren());
  private _keyManager: MenuKeyboardManager;

  @ContentChildren(MenuButtonDirective, {descendants: true}) private readonly _allItems: QueryList<
    MenuButtonDirective
  >;

  // TODO clean these up
  get closeEventEmitter() {
    return new Subject<void>();
    // return this._keyManager.closeEventEmitter;
  }
  get keyboardEventEmitter() {
    return this._keyManager._keyboardEventEmitter;
  }
  get _keyboardEventEmitter() {
    return this._keyManager._keyboardEventEmitter;
  }
  // get tabEventEmitter() {
  // return this._keyManager.tabEventEmitter;
  // }

  lablledBy: string | null = null;

  constructor(private _parent: MenuPanelDirective, protected _element: ElementRef) {
    super();
  }

  ngAfterContentInit() {
    this._allItems.forEach((c) => {
      c.keyboardEventEmitter.subscribe((e) => this.keyboardEventEmitter.next(e));
    });
    this._keyManager = new MenuKeyboardManager(this._allItems, this.orientation);
    this._parent.registerChildMenu(this);
  }

  focusFirstChild() {
    this._keyManager.focusFirstItem();
  }
  focusLastChild() {
    this._keyManager.focusLastItem();
  }

  ngOnDestroy() {
    this._keyManager.onDestroy();
  }

  // registerChild(child: MenuButtonDirective) {
  //   super.registerChild(child);
  //   console.log('register');
  //   child.keyboardEventEmitter.subscribe((e) => this.keyboardEventEmitter.next(e));
  //   child.id = `cdk-menu-button-${this.getChildren().length}`;
  // }
}
