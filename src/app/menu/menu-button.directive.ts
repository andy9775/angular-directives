import {Directive, ElementRef, Input, ViewContainerRef, Optional} from '@angular/core';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {MenuPanelDirective} from './menu-panel.directive';
// import {MenuDirective} from './menu.directive';
import {Subject, Subscription} from 'rxjs';
import {FocusableOption, ListKeyManagerOption} from '@angular/cdk/a11y';
import {RIGHT_ARROW, LEFT_ARROW, ESCAPE, SPACE, ENTER} from '@angular/cdk/keycodes';
import {MenuGroupDirective} from './menu-group.directive';
import {CheckboxStateService} from './checkbox-state.service';
import {MenuDirective} from './menu-bar.directive';

@Directive()
/** @docs-private */
abstract class MenuButton {
  abstract get id(): string;
  abstract set id(val: string);
  protected _id: string;

  abstract _menuPanel: MenuPanelDirective;
  protected abstract _overlay: Overlay;
  protected abstract _element: ElementRef<HTMLElement>;
  protected abstract _viewContainer: ViewContainerRef;
  // protected abstract _parentMenu?: MenuDirective;
  protected abstract _parent?: MenuDirective;

  protected _overlayRef: OverlayRef;

  tabEventEmitter = new Subject();

  keyboardEventEmitter = new Subject<KeyboardEvent>();
  closeEventEmitter = new Subject<void>();

  abstract focus(): void;

  isMenuOpen() {
    return !!this._overlayRef;
  }

  hasSubmenu() {
    return !!this._menuPanel;
  }

  closeMenu() {
    // TODO better clean up
    if (this._overlayRef) {
      this._overlayRef.detach();
      this._overlayRef.dispose();
      this._menuPanel._menu
        .getChildren()
        .filter((c) => c.isMenuOpen())
        .forEach((c) => c.onClick());
    }
    this._overlayRef = null;
  }

  protected _openMenu() {
    if (!!this._menuPanel) {
      this._overlayRef = this._overlay.create({
        positionStrategy: this._getOverlayPositionStrategy(),
        // hasBackdrop: this._parent._role === 'menubar',
      });
      const portal = new TemplatePortal(this._menuPanel.template, this._viewContainer);
      this._overlayRef.attach(portal);

      this._setCloseHandlers();
      // this._menuPanel._menu.lablledBy = this.id;
    }
  }

  private _getOverlayPositionStrategy() {
    return this._overlay
      .position()
      .flexibleConnectedTo(this._element)
      .setOrigin(this._element)
      .withPositions([
        this._parent._orientation === 'horizontal'
          ? {
              originX: 'start',
              originY: 'bottom',
              overlayX: 'start',
              overlayY: 'top',
            }
          : {
              originX: 'end',
              originY: 'top',
              overlayX: 'start',
              overlayY: 'top',
            },
      ])
      .withLockedPosition();
  }

  private _setCloseHandlers() {
    this._overlayRef.backdropClick().subscribe(this.closeMenu.bind(this));
  }
}

/*
        TODO
          aria-label - up to the user?

          id??
      */
@Directive({
  selector: '[appMenuButton],[cdkMenuItem], [cdkTriggerFor]',
  exportAs: 'cdkMenuItem',
  host: {
    '(blur)': '_isFocused = false',
    '(mouseenter)': '_emitMouseFocus()',
    // '(keydown)': '_handleKeyDown($event)',
    '(click)': 'onClick()',
    // a11y
    '[attr.role]': 'role',
    type: 'button', // necessary ??
    // only has 0 tab index if focused and is a button inside the menuBar
    '[tabindex]': '_tabIndex', // check if disabledj
    // '[tabindex]': '(_isFocused && !!_parentMenu) ? "0" : "-1"', // check if disabled
    '[attr.aria-haspopup]': '!!_menuPanel ? "menu" : "false"', // only if it has a ref??
    '[attr.aria-expanded]': '!!_menuPanel ? !!_overlayRef : null',
    '[attr.aria-checked]': '_checked()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-controls]': '!!_menuPanel  ? _menuPanel.id : null',
  },
})
export class MenuButtonDirective extends MenuButton
  implements FocusableOption, ListKeyManagerOption {
  // TODO upon clicking a button, the menu should track the last clicked
  // which can track radio/checkbox logic - it should also set aria-checked
  // which can be set in the parent menu
  // implementation can be to get the currently checked button from the parent
  // and see if that is this button (or parentMenu.isChecked(menButton) )
  @Input() role: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox' = 'menuitem';

  _tabIndex: 0 | -1 = -1;

  @Input('cdkTriggerFor') _menuPanel: MenuPanelDirective;

  mouseEnterEmitter = new Subject();

  focusEventEmitter: Subject<MenuButtonDirective | void> = new Subject();
  activateEventEmitter: Subject<MenuButtonDirective> = new Subject();

  private _isFocused = false;

  @Input('id')
  set id(val: string) {
    if (!this._id) {
      this._id = val;
    }
  }
  get id() {
    return this._id || this._element.nativeElement.getAttribute('id');
  }

  get disabled() {
    return this._element.nativeElement.getAttribute('disabled') || false;
  }

  constructor(
    protected _overlay: Overlay,
    protected _element: ElementRef,
    protected _viewContainer: ViewContainerRef,
    // need someway to set the initial state of the checkbox
    // also need to emit events to update external components of changed state
    private state: CheckboxStateService,
    // @Optional() protected _parentMenu?: MenuDirective,
    @Optional() protected _parent?: MenuDirective,
    @Optional() private _group?: MenuGroupDirective
  ) {
    super();
  }

  _isItem() {
    return this.role === 'menuitem';
  }

  private _emitMouseFocus() {
    this.focusEventEmitter.next(this);
  }

  private _checked() {
    if (!!this._group && this.role === 'menuitemradio') {
      return this._group.isActiveChild(this).toString();
    } else if (this.role === 'menuitemcheckbox') {
      return this.state.isChecked(this).toString();
    }

    return null;
  }

  onClick() {
    if (!!this._group) {
      this._group.setActiveChild(this);
    }
    this.state.toggle(this);
    // check - do nothing if there is a child menu?
    // TODO should this emit an event?
    this.isMenuOpen() ? this.closeMenu() : this._openMenu();
    this.activateEventEmitter.next(this);
  }

  focus() {
    // debug to determine which element has focus
    this._element.nativeElement.focus();
    this._isFocused = true;
    this.focusEventEmitter.next();
  }

  getLabel() {
    // TODO better way to get the label
    return this._element.nativeElement.innerText;
  }
}
