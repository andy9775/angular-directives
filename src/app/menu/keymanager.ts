import {
  SPACE,
  ESCAPE,
  TAB,
  LEFT_ARROW,
  RIGHT_ARROW,
  ENTER,
  DOWN_ARROW,
  UP_ARROW,
  HOME,
  END,
} from '@angular/cdk/keycodes';
import {MenuButtonDirective} from './menu-button.directive';
import {FocusKeyManager} from '@angular/cdk/a11y';
import {Subject, Subscription} from 'rxjs';
import {QueryList} from '@angular/core';
import {takeUntil, take, first} from 'rxjs/operators';

/*
  NOTES:
    Button should be responsible for handling click events (openinging menu)
    for both keyboard clicks and mouse events (onMouseClose)

    It should be up to the parent menu to handle button close events.
    When a button emits a close event

    We need to pass skipped _keyboardEvents from one menu to the other.
*/

export class MenuKeyboardManager {
  private readonly _keyManager: FocusKeyManager<MenuButtonDirective>;
  readonly _keyboardEventEmitter = new Subject<KeyboardEvent>();

  private readonly _destroyKeyboardSubscription: Subject<void> = new Subject();

  constructor(
    private _children: QueryList<MenuButtonDirective>,
    private _orientation: 'horizontal' | 'vertical'
  ) {
    this._keyManager = new FocusKeyManager(_children).withWrap().withTypeAhead(100);
    if (_orientation === 'horizontal') {
      // TODO get layout direction
      this._keyManager = this._keyManager.withHorizontalOrientation('ltr');
    } else {
      this._keyManager = this._keyManager.withVerticalOrientation();
    }

    this._keyManager.change.subscribe(this._handleOnChange.bind(this));
  }

  private _handleOnChange() {
    // cancel previous subscriptions
    this._destroyKeyboardSubscription.next();

    const active = this._keyManager.activeItem;
    const stopCondition = takeUntil(this._destroyKeyboardSubscription);

    active.open.pipe(stopCondition).subscribe(() => {
      if (active.hasSubmenu()) {
        active._menuPanel._menu._keyManager._keyboardEventEmitter
          .pipe(stopCondition)
          .subscribe((e: KeyboardEvent) => {
            this.handleEvent(e, true);
          });
      }
    });
  }

  focusFirstItem() {
    this._keyManager.setFirstItemActive();
  }

  focusLastItem() {
    this._keyManager.setLastItemActive();
  }

  focusItem(el: MenuButtonDirective) {
    this._keyManager.setActiveItem(el);
  }

  getFocusedItem() {
    return this._keyManager.activeItem;
  }

  onDestroy() {
    this._destroyKeyboardSubscription.next();
    this._destroyKeyboardSubscription.complete();
    this._keyboardEventEmitter.complete();
  }

  handleEvent(event: KeyboardEvent, bubbled = false) {
    let activeItem = this._keyManager.activeItem;
    switch (event.keyCode) {
      case ENTER:
      case SPACE:
        if (activeItem && !bubbled) {
          event.preventDefault();
          activeItem.onClick();
          if (activeItem.isMenuOpen()) {
            activeItem._menuPanel._menu.focusFirstChild();
          }
        }
        if (bubbled && activeItem.isMenuOpen()) {
          activeItem.onClick();
          this._keyboardEventEmitter.next(event);
        } else if (!activeItem.hasSubmenu() && activeItem._isItem()) {
          activeItem.onClick();
          this._keyboardEventEmitter.next(event);
        }
        break;
      case LEFT_ARROW:
        if (this._isHorizontal()) {
          const prev = this._keyManager.activeItem;
          this._keyManager.onKeydown(event);
          activeItem = this._keyManager.activeItem;
          if (prev.isMenuOpen() && activeItem.hasSubmenu()) {
            activeItem.onClick();
          }
          if (prev.isMenuOpen()) {
            prev.onClick();
          }
        } else {
          if (activeItem && activeItem.isMenuOpen()) {
            activeItem.onClick();
            activeItem.focus();
            this._keyManager.setActiveItem(this._keyManager.activeItemIndex);
          } else {
            this._keyboardEventEmitter.next(event);
          }
        }
        break;
      case RIGHT_ARROW:
        if (this._isHorizontal()) {
          const prev = this._keyManager.activeItem;
          this._keyManager.onKeydown(event);
          activeItem = this._keyManager.activeItem;
          if (prev.isMenuOpen() && activeItem.hasSubmenu()) {
            console.log('handle: ', prev.id, activeItem.id);
            activeItem.onClick();
            prev.onClick();
          }
        } else {
          if (activeItem && activeItem.hasSubmenu() && !bubbled) {
            activeItem.onClick();
            activeItem._menuPanel._menu.focusFirstChild();
          } else {
            if (activeItem.isMenuOpen()) {
              activeItem.onClick();
            }
            this._keyboardEventEmitter.next(event);
          }
        }
        break;
      case UP_ARROW:
      case DOWN_ARROW:
        if (this._isHorizontal()) {
          event.preventDefault();
          if (activeItem.hasSubmenu()) {
            if (!activeItem.isMenuOpen()) {
              activeItem.onClick();
            }

            event.keyCode === DOWN_ARROW
              ? activeItem._menuPanel._menu.focusFirstChild()
              : activeItem._menuPanel._menu.focusLastChild();
          }
        } else {
          this._keyManager.onKeydown(event);
        }
        break;
      case HOME:
      case END:
        event.keyCode === HOME
          ? activeItem._menuPanel._menu.focusFirstChild()
          : activeItem._menuPanel._menu.focusLastChild();
        break;
      case ESCAPE:
        if (activeItem && activeItem.isMenuOpen()) {
          activeItem.onClick();
          this._keyManager.setActiveItem(this._keyManager.activeItemIndex);
        } else {
          this._keyboardEventEmitter.next(event);
        }
        break;
      case TAB:
        if (activeItem && activeItem.isMenuOpen()) {
          activeItem.onClick();
        }
        this._keyboardEventEmitter.next(event);
        break;
      default:
        this._keyManager.onKeydown(event);
    }
  }

  private _isHorizontal() {
    return this._orientation === 'horizontal';
  }
}
