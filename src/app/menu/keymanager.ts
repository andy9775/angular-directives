import {
  SPACE,
  ESCAPE,
  TAB,
  LEFT_ARROW,
  RIGHT_ARROW,
  ENTER,
  DOWN_ARROW,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {MenuButtonDirective} from './menu-button.directive';
import {FocusKeyManager} from '@angular/cdk/a11y';
import {Subject} from 'rxjs';
import {RootMenu} from './menu';

export class MenuKeyManager {
  protected _keyManager: FocusKeyManager<MenuButtonDirective>;

  closeEventEmitter = new Subject<void>();
  tabEventEmitter = new Subject<void>();
  keyboardEventEmitter = new Subject<KeyboardEvent>();

  constructor(children: Array<MenuButtonDirective>) {
    this._keyManager = new FocusKeyManager(children)
      .withWrap()
      .withVerticalOrientation()
      .withTypeAhead(100);
  }

  focusFirstItem() {
    this._keyManager.setFirstItemActive();
  }
  focusLastItem() {
    this._keyManager.setLastItemActive();
  }

  keydown(event: KeyboardEvent) {
    const {keyCode} = event; // TODO don't use keyCode
    switch (keyCode) {
      case SPACE:
      case ENTER:
        event.preventDefault();
        if (this._keyManager.activeItem.hasSubmenu()) {
          this._openSubMenu();
        } else {
          this._keyManager.activeItem.onClick();
          if (this._keyManager.activeItem.role === 'menuitem') {
            this.tabEventEmitter.next();
          }
        }
        break;
      case LEFT_ARROW:
        // TODO if top level menu, toggle to next
        this.keyboardEventEmitter.next(event);
        break;
      case RIGHT_ARROW:
        if (this._keyManager.activeItem.hasSubmenu()) {
          this._openSubMenu();
        } else {
          this.keyboardEventEmitter.next(event);
        }
        break;
      case ESCAPE:
        this.closeEventEmitter.next();
        break;
      case TAB:
        this.tabEventEmitter.next();
        break;
      default:
        this._keyManager.onKeydown(event);
    }
  }

  private _openSubMenu() {
    this._keyManager.activeItem.onClick();

    this._keyManager.activeItem.tabEventEmitter.subscribe(() => {
      this.tabEventEmitter.next();
    });

    if (this._keyManager.activeItem.templateRef.child) {
      this._keyManager.activeItem.templateRef.child.focusFirstChild();
    }
  }
}

export class MenuBarKeyManager extends MenuKeyManager {
  constructor(children: Array<MenuButtonDirective>) {
    super(children);
    this._keyManager = this._keyManager.withHorizontalOrientation('ltr');
  }

  keydown(event: KeyboardEvent) {
    const {keyCode} = event;

    switch (keyCode) {
      case DOWN_ARROW:
      case UP_ARROW:
        event.preventDefault();
        if (this._keyManager.activeItem.isMenuOpen()) {
          if (this._keyManager.activeItem.templateRef.child) {
            keyCode === DOWN_ARROW
              ? this._keyManager.activeItem.templateRef.child.focusFirstChild()
              : this._keyManager.activeItem.templateRef.child.focusLastChild();
          }
        } else {
          this._keyManager.activeItem.onClick();
          keyCode === DOWN_ARROW
            ? this._keyManager.activeItem.templateRef.child.focusFirstChild()
            : this._keyManager.activeItem.templateRef.child.focusLastChild();
        }
        break;
      case ENTER:
      case SPACE:
        event.preventDefault();
        this._keyManager.activeItem.onClick();
        if (this._keyManager.activeItem.templateRef.child) {
          this._keyManager.activeItem.templateRef.child.focusFirstChild();
        }
        break;

      case LEFT_ARROW:
      case RIGHT_ARROW:
        const prev = this._keyManager.activeItem;
        this._keyManager.onKeydown(event);
        if (prev.isMenuOpen()) {
          prev.closeMenu();
          this._keyManager.activeItem.onClick();
        }

        break;
      case ESCAPE:
        if (this._keyManager.activeItem.isMenuOpen()) {
          this._keyManager.activeItem.closeMenu();
        }
        break;

      default:
        this._keyManager.onKeydown(event);
    }
  }
}
