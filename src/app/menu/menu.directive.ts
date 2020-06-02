import {Directive, Input, ElementRef} from '@angular/core';
import {MenuPanelDirective} from './menu-panel.directive';
import {MenuButtonDirective} from './menu-button.directive';
import {FocusMonitor} from '@angular/cdk/a11y';
import {RootMenu, Menu} from './menu';
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
export class MenuDirective extends RootMenu implements Menu {
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

  // TODO key manager
  constructor(
    private _parent: MenuPanelDirective,
    private _element: ElementRef,
    private fm: FocusMonitor
  ) {
    super();
    fm.monitor(_element);
    _parent.registerChildMenu(this);
    this._keyManager = new MenuKeyManager(this);
  }

  contains(el) {
    return (
      this._element.nativeElement.contains(el) ||
      this.getChildren()
        .map((c) => c.contains(el))
        .includes(true)
    );
  }

  focusFirstItem() {
    this._keyManager.focusFirstItem();
  }

  focusLastItem() {
    this._keyManager.focusLastItem();
  }

  registerChild(child: MenuButtonDirective) {
    super.registerChild(child);
    child.keyboardEventEmitter.subscribe((e) => this.keyboardEventEmitter.next(e));
    child._id = `cdk-menu-button-${this.getChildren().length}`;
  }

  id(): string | null {
    // TODO generate a sequential internal id and use either that or the provided id?
    return this._element.nativeElement.getAttribute('id');
  }
}
