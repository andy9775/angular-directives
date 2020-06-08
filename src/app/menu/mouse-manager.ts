import {MenuKeyboardManager} from './keymanager';
import {QueryList} from '@angular/core';
import {MenuButtonDirective} from './menu-button.directive';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';

/*

  When we mouse over an element we want to specify that it is focused.
 */
export class MenuMouseManager {
  private readonly _destroyMouseSubscription: Subject<void> = new Subject();
  private _focused: MenuButtonDirective;
  readonly _activationEventEmitter = new Subject<MenuButtonDirective>();

  constructor(
    private readonly _keyManager: MenuKeyboardManager,
    private readonly _children: QueryList<MenuButtonDirective>,
    private readonly _openOnHover: boolean = false // whether to open a button's submenu on hover
  ) {
    _children.forEach((button) => {
      // when mouse places focus on a MenuButton we change
      // the focus in the MenuKeyboardManager which
      // allows a user to continue keyboard events from
      // where the mouse left off
      button.focusEventEmitter
        .pipe(
          filter((_button) => !!_button),
          takeUntil(this._destroyMouseSubscription)
        )
        .subscribe(this._handleFocusChange.bind(this));

      button.activateEventEmitter
        .pipe(takeUntil(this._destroyMouseSubscription))
        .subscribe(this._handleActivatedButton.bind(this));
    });

    this._activationEventEmitter
      .pipe(takeUntil(this._destroyMouseSubscription))
      .subscribe(this._handleBubbledEvents.bind(this));
  }

  private _handleFocusChange(_button: MenuButtonDirective) {
    const prev = this._keyManager.getFocusedItem();
    this._keyManager.focusItem(_button);
    this._focused = this._keyManager.getFocusedItem();
    if (prev === this._focused) {
      return;
    }
    if (this._openOnHover && this._focused.hasSubmenu()) {
      this._focused.onClick();
    }
    if (!prev) {
      return;
    }
    if (!this._openOnHover && this._focused.hasSubmenu() && prev.isMenuOpen()) {
      this._focused.onClick();
    }
    if (prev.isMenuOpen()) {
      prev.onClick();
    }
  }

  private _handleActivatedButton(_button: MenuButtonDirective) {
    if (_button.hasSubmenu() && _button.isMenuOpen()) {
      _button._menuPanel._menu._mouseManager._activationEventEmitter
        .pipe(takeUntil(this._destroyMouseSubscription))
        .subscribe((b) => {
          this._activationEventEmitter.next(b);
        });
    } else if (!_button.hasSubmenu()) {
      this._activationEventEmitter.next(_button);
    }
  }

  private _handleBubbledEvents(_button: MenuButtonDirective) {
    if (_button._isItem() && this._keyManager.getFocusedItem().isMenuOpen()) {
      this._keyManager.getFocusedItem().onClick();
    }
  }

  onDestroy() {
    this._destroyMouseSubscription.next();
    this._destroyMouseSubscription.complete();
  }
}
