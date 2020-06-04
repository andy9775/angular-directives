import {Directive, ElementRef, Input, ViewContainerRef, Optional} from '@angular/core';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {MenuPanelDirective} from './menu-panel.directive';
import {MenuDirective} from './menu.directive';
import {Subject} from 'rxjs';
import {MenuBarDirective} from './menu-bar.directive';
import {FocusableOption, ListKeyManagerOption} from '@angular/cdk/a11y';
import {RIGHT_ARROW, LEFT_ARROW, ESCAPE} from '@angular/cdk/keycodes';
import {MenuGroupDirective} from './menu-group.directive';
import {CheckboxStateService} from './checkbox-state.service';
import {RootMenu} from './menu';

@Directive()
/** @docs-private */
abstract class MenuButton {
  abstract get id(): string;
  abstract set id(val: string);
  protected _id: string;

  abstract templateRef: MenuPanelDirective;
  protected abstract _overlay: Overlay;
  protected abstract _element: ElementRef<HTMLElement>;
  protected abstract _viewContainer: ViewContainerRef;
  protected abstract _parentMenu?: MenuDirective;
  protected abstract _parentMenuBar?: MenuBarDirective;

  protected _overlayRef: OverlayRef;

  tabEventEmitter = new Subject();

  keyboardEventEmitter = new Subject<KeyboardEvent>();
  closeEventEmitter = new Subject<void>();

  abstract focus(): void;

  isMenuOpen() {
    return !!this._overlayRef;
  }

  hasSubmenu() {
    return !!this.templateRef;
  }

  closeMenu() {
    if (this.templateRef && this.templateRef.child) {
      // close out any potentially open children
      this.templateRef.child
        .getChildren()
        .filter((c) => c.isMenuOpen())
        .forEach((child) => child.closeMenu());
      this.templateRef.child.closeEventEmitter.unsubscribe();
    }
    // TODO better clean up
    if (this._overlayRef) {
      this._overlayRef.detach();

      this._overlayRef.dispose();

      this._overlayRef = null;
    }
  }

  protected _openMenu() {
    if (!!this.templateRef) {
      this._overlayRef = this._overlay.create({
        positionStrategy: this._getOverlayPositionStrategy(),
        hasBackdrop: !!this._parentMenuBar,
        backdropClass: '',
      });
      const portal = new TemplatePortal(this.templateRef.template, this._viewContainer);
      this._overlayRef.attach(portal);

      this._setCloseHandlers();

      this.templateRef.child.closeEventEmitter.subscribe(() => {
        this.closeMenu();
        this.focus();
      });
      this.templateRef.child.tabEventEmitter.subscribe(() => {
        this.closeMenu();
        this.tabEventEmitter.next();
      });

      this.templateRef.child.lablledBy = this.id;

      // TODO have parent subscribe to these events and close out all sibling components
      // Try to generalize the logic into a single keyboard handler but setting up the events
      // correctly
      this._overlayRef.backdropClick().subscribe(() => this.closeEventEmitter.next());
      this.templateRef.child.keyboardEventEmitter.subscribe((e: KeyboardEvent) => {
        const {keyCode} = e;
        switch (keyCode) {
          case LEFT_ARROW:
            if (!!this._parentMenuBar) {
              this.keyboardEventEmitter.next(e);
            } else {
              this.focus();
            }
            this.closeMenu();

            break;
          case RIGHT_ARROW:
            this.keyboardEventEmitter.next(e);
            this.closeMenu();
            break;
        }
      });
    }
  }

  private _getOverlayPositionStrategy() {
    return this._overlay
      .position()
      .flexibleConnectedTo(this._element)
      .setOrigin(this._element)
      .withPositions([
        !!this._parentMenu
          ? {
              originX: 'end',
              originY: 'top',
              overlayX: 'start',
              overlayY: 'top',
            }
          : {
              originX: 'start',
              originY: 'bottom',
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
    '(mouseenter)': 'mouseEnter()',
    '(click)': 'onClick()',
    // a11y
    '[attr.role]': 'role',
    type: 'button', // necessary ??
    // only has 0 tab index if focused and is a button inside the menuBar
    '[tabindex]': '(_isFocused && !!_parentMenu) ? "0" : "-1"', // check if disabled
    '[attr.aria-haspopup]': '!!templateRef ? "menu" : "false"', // only if it has a ref??
    '[attr.aria-expanded]': '!!templateRef ? !!_overlayRef : null',
    '[attr.aria-checked]': '_checked()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-controls]': '!!templateRef && !!templateRef.child ? templateRef.child.id : null',
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

  @Input('cdkTriggerFor') templateRef: MenuPanelDirective;
  mouseEnterEmitter = new Subject();

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
    @Optional() protected _parentMenu?: MenuDirective,
    @Optional() protected _parentMenuBar?: MenuBarDirective,
    @Optional() private _group?: MenuGroupDirective
  ) {
    super();
    if (_parentMenu) {
      _parentMenu.registerChild(this);
    }
    if (_parentMenuBar) {
      _parentMenuBar.registerChild(this);
    }
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
  }

  mouseEnter() {
    this.focus();
    if ((!!this._parentMenuBar && this._parentMenuBar.hasOpenChild()) || !this._parentMenuBar) {
      // only open on mouse enter if nothing else is open
      !this._overlayRef && this._openMenu();
      this.mouseEnterEmitter.next(this);
    }
  }

  contains(el) {
    return (
      this._element.nativeElement.contains(el) ||
      (this.templateRef && this.templateRef.child ? this.templateRef.child.contains(el) : false)
    );
  }

  focus() {
    // debug to determine which element has focus
    this._element.nativeElement.focus();
    this._isFocused = true;
  }

  getLabel() {
    // TODO better way to get the label
    return this._element.nativeElement.innerText;
  }
}
