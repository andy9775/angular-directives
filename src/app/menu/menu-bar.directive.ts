import {Directive, Input, AfterContentInit, ElementRef} from '@angular/core';
import {FocusMonitor} from '@angular/cdk/a11y';
import {MenuButtonDirective} from './menu-button.directive';
import {RootMenu} from './menu';
import {MenuKeyManager, MenuBarKeyManager} from './keymanager';

/*
  TODO
    aria-label/lablledby? - up to the user?
*/
@Directive({
  selector: '[appMenuBar], [cdkMenuBar]',
  exportAs: 'cdkMenuBar',
  host: {
    '(focus)': '_keyManager.focusFirstItem()',
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

  private _keyManager: MenuBarKeyManager;
  private _closeHandler = new CloseoutHandler(this);

  // TODO key manager
  constructor(protected _element: ElementRef, private fm: FocusMonitor) {
    super();
    fm.monitor(this._element);
    this._keyManager = new MenuBarKeyManager(this);
  }

  registerChild(child: MenuButtonDirective) {
    super.registerChild(child);

    child.keyboardEventEmitter.subscribe((e) => {
      this._keyManager.keydown(e);
    });
  }
}

class CloseoutHandler {
  constructor(private _menu: RootMenu) {}
  doClick(event: MouseEvent) {
    if (
      !this._menu
        .getChildren()
        .map((child) => {
          if (child.contains(event.target)) {
            return true;
          }
        })
        .includes(true)
    ) {
      // TODO more performent way to do this? Perhaps have the children register for a close event
      // emitter from each parent? Or have a service which gets injected into the appropriate
      // listeners (children)?
      this._menu
        .getChildren()
        .filter((c) => c.isOpen())
        .forEach((c) => c.closeMenu());
    }
  }
}
