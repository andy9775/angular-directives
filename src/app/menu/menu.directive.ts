import {Directive, Input, ElementRef} from '@angular/core';
import {MenuPanelDirective} from './menu-panel.directive';
import {MenuButtonDirective} from './menu-button.directive';
import {FocusMonitor} from '@angular/cdk/a11y';
import {RootMenu} from './menu';
import {MenuKeyManager} from './keymanager';

/*
  TODO
    aria-label (provided by user)
*/
@Directive({
  selector: '[cdkMenu]',
  exportAs: 'cdkMenu',
  host: {
    '(keydown)': '_keyManager.keydown($event)',
    // a11y
    role: 'menu',
    '[attr.aria-orientation]': 'orientation',
    '[attr.aria-lablledby]': 'lablledBy',
  },
})
export class MenuDirective extends RootMenu {
  @Input('cdkMenuOrientation') orientation: 'horizontal' | 'vertical' = 'vertical';
  private _keyManager: MenuKeyManager;

  // TODO clean these up
  get closeEventEmitter() {
    return this._keyManager.closeEventEmitter;
  }
  get keyboardEventEmitter() {
    return this._keyManager.keyboardEventEmitter;
  }
  get tabEventEmitter() {
    return this._keyManager.tabEventEmitter;
  }

  lablledBy: string | null = null;

  constructor(
    private _parent: MenuPanelDirective,
    protected _element: ElementRef,
    private fm: FocusMonitor
  ) {
    super();
    fm.monitor(this._element);
    _parent.registerChildMenu(this);
    this._keyManager = new MenuKeyManager(this);
  }

  focusFirstChild() {
    this._keyManager.focusFirstItem();
  }
  focusLastChild() {
    this._keyManager.focusLastItem();
  }

  registerChild(child: MenuButtonDirective) {
    super.registerChild(child);
    child.keyboardEventEmitter.subscribe((e) => this.keyboardEventEmitter.next(e));
    child.id = `cdk-menu-button-${this.getChildren().length}`;
  }
}
