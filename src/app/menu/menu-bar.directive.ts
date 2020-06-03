import {Directive, Input, AfterContentInit, ElementRef} from '@angular/core';
import {FocusMonitor} from '@angular/cdk/a11y';
import {MenuButtonDirective} from './menu-button.directive';
import {RootMenu} from './menu';
import {MenuKeyManager, MenuBarKeyManager} from './keymanager';
import {Subject} from 'rxjs';

/*
  TODO
    aria-label/lablledby? - up to the user?
*/
@Directive({
  selector: '[appMenuBar], [cdkMenuBar]',
  exportAs: 'cdkMenuBar',
  host: {
    '(focus)': 'focusFirstChild()',
    '(keydown)': '_keyManager.keydown($event)',
    role: 'menubar',
    '[tabindex]': '0',
    '[attr.aria-orientation]': 'orientation',
    '[attr.aria-expanded]': 'hasOpenChild()',
    '(document:click)': '_closeHandler.doClick($event)',
  },
})
export class MenuBarDirective extends RootMenu {
  // according to the aria spec, menu bars have horizontal default orientation
  @Input('cdkMenuBarOrientation') orientation: 'horizontal' | 'vertical' = 'horizontal';
  // todo should this emit all close events or just closing out of the menu bar?
  closeEventEmitter = new Subject<void>();

  private _keyManager = new MenuBarKeyManager(this.getChildren());
  private _closeHandler = new CloseoutHandler(this);

  constructor(protected _element: ElementRef) {
    super();
  }

  registerChild(child: MenuButtonDirective) {
    super.registerChild(child);

    child.keyboardEventEmitter.subscribe((e) => {
      // do we need to register this here?
      // can we move this logic into the _keyManager?
      // TODO determine when this fires? Only in open children?
      this._keyManager.keydown(e);
    });
    if (child.templateRef) {
      child.templateRef.child.closeEventEmitter.subscribe(() => this.closeEventEmitter.next());
    }
  }

  focusFirstChild() {
    this._keyManager.focusFirstItem();
  }

  focusLastChild() {
    this._keyManager.focusLastItem();
  }
}

class CloseoutHandler {
  constructor(private _menu: RootMenu) {}
  doClick(event: MouseEvent) {
    if (!this._clickedInChild(event)) {
      // TODO more performent way to do this? Perhaps have the children register for a close event
      // emitter from each parent? Or have a service which gets injected into the appropriate
      // listeners (children)?
      this._menu
        .getChildren()
        .filter((c) => c.isMenuOpen())
        .forEach((c) => c.closeMenu());
    }
  }

  private _clickedInChild(event: MouseEvent) {
    return this._menu
      .getChildren()
      .map((child) => {
        if (child.contains(event.target)) {
          return true;
        }
      })
      .includes(true);
  }
}
