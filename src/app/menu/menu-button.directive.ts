import {Directive, ElementRef, Input, ViewContainerRef, Optional} from '@angular/core';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {MenuPanelDirective} from './menu-panel.directive';
import {MenuDirective} from './menu.directive';
import {Subject} from 'rxjs';
import {MenuBarDirective} from './menu-bar.directive';
import {FocusableOption, FocusMonitor} from '@angular/cdk/a11y';
import {RIGHT_ARROW, LEFT_ARROW} from '@angular/cdk/keycodes';
import {MenuGroupDirective} from './menu-group.directive';

/*
        TODO
          aria-label - up to the user?

          id??
      */
@Directive({
  selector: '[appMenuButton],[cdkMenuItem], [cdkTriggerFor]',
  exportAs: 'cdkMenuItem',
  host: {
    '(focus)': 'focusEventEmitter.next(this)',
    '(blur)': 'isFocused = false',
    '(mouseenter)': 'mouseEnter()',
    '(click)': 'onClick()',
    // a11y
    '[attr.role]': 'role',
    type: 'button', // necessary ??
    // only has 0 tab index if focused and is a button inside the menuBar
    '[tabindex]': '(isFocused && !!_parentMenu) ? "0" : "-1"', // check if disabled
    '[attr.aria-haspopup]': '!!templateRef ? "menu" : "false"', // only if it has a ref??
    '[attr.aria-expanded]': '!!templateRef ? !!_overlayRef : null',
    '[attr.aria-checked]': '_checked()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-controls]': '!!templateRef && !!templateRef.child ? templateRef.child.id() : null',
  },
})
export class MenuButtonDirective implements FocusableOption {
  // TODO upon clicking a button, the menu should track the last clicked
  // which can track radio/checkbox logic - it should also set aria-checked
  // which can be set in the parent menu
  // implementation can be to get the currently checked button from the parent
  // and see if that is this button (or parentMenu.isChecked(menButton) )
  @Input() role: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox' = 'menuitem';

  @Input('cdkTriggerFor') templateRef: MenuPanelDirective;
  private _overlayRef: OverlayRef;
  mouseEnterEmitter = new Subject();
  closeEventEmitter = new Subject();
  tabEventEmitter = new Subject();
  focusEventEmitter = new Subject<MenuButtonDirective>();

  keyboardEventEmitter = new Subject<KeyboardEvent>();

  isFocused = false;

  _id: string;

  private _isChecked = false;

  get disabled() {
    return this._element.nativeElement.getAttribute('disabled') || false;
  }

  constructor(
    private _overlay: Overlay,
    private _element: ElementRef,
    private _viewContainer: ViewContainerRef,
    private fm: FocusMonitor,
    // TODO use interface and not specific type. Interface should have register and isChecked
    // methods and listen to clicked events (or extend from base class)
    // if not null this button is within a sub-menu (hacky)
    @Optional() private _parentMenu?: MenuDirective,
    @Optional() private _parentMenuBar?: MenuBarDirective,
    @Optional() private _group?: MenuGroupDirective
  ) {
    if (_parentMenu) {
      _parentMenu.registerChild(this);
    }
    if (_parentMenuBar) {
      _parentMenuBar.registerChild(this);
    }
    fm.monitor(_element);
  }

  focus() {
    // debug to determine which element has focus
    // console.log('focus: ', this._element.nativeElement.innerText);
    this._element.nativeElement.focus();
    this.isFocused = true;
    // this.focusEventEmitter.next(this);
    // console.log('focused: ', this.id());
  }

  private _checked() {
    if (!!this._group && this.role === 'menuitemradio') {
      return this._group.isActiveChild(this);
    } else if (this.role === 'menuitemcheckbox') {
      return this._isChecked;
    }

    return null;
  }

  onClick() {
    if (!!this._group) {
      this._group.setActiveChild(this);
    }
    this._isChecked = !this._isChecked;
    // check - do nothing if there is a child menu?
    this.isOpen() ? this.closeMenu() : this._openMenu();
  }

  mouseEnter() {
    this.focus();
    if ((!!this._parentMenuBar && this._parentMenuBar.hasOpenChild()) || !this._parentMenuBar) {
      // only open on mouse enter if nothing else is open
      !this._overlayRef && this._openMenu();
      this.mouseEnterEmitter.next(this);
    }
  }

  isOpen() {
    return !!this._overlayRef;
  }

  hasSubmenu() {
    return !!this.templateRef;
  }

  contains(el) {
    return (
      this._element.nativeElement.contains(el) ||
      (this.templateRef && this.templateRef.child ? this.templateRef.child.contains(el) : false)
    );
  }

  private _openMenu() {
    if (!!this.templateRef) {
      this._overlayRef = this._overlay.create({
        positionStrategy: this._getOverlayPositionStrategy(),
      });
      const portal = new TemplatePortal(this.templateRef.template, this._viewContainer);
      this._overlayRef.attach(portal);

      this._setCloseHandlers();
      if (this.templateRef.child) {
        this.templateRef.child.closeEventEmitter.subscribe(() => {
          this.closeMenu();
        });
        this.templateRef.child.tabEventEmitter.subscribe(() => {
          this.closeMenu();
          this.tabEventEmitter.next();
        });
      }

      // get focus event from the sub-menu
      this.templateRef.child.focusEventEmitter.subscribe((c) => {
        this.focusEventEmitter.next(c);
      });

      this.templateRef.child.lablledBy = this.id();

      this.templateRef.child.keyboardEventEmitter.subscribe((e: KeyboardEvent) => {
        const {keyCode} = e;
        switch (keyCode) {
          case LEFT_ARROW:
            if (!!this._parentMenuBar) {
              this.keyboardEventEmitter.next(e);
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

  closeMenu() {
    if (this.templateRef && this.templateRef.child) {
      this.templateRef.child.children.forEach((child) => child.closeMenu());
      this.templateRef.child.closeEventEmitter.unsubscribe();
    }
    // TODO better clean up
    if (this._overlayRef) {
      this._overlayRef.detach();

      this._overlayRef.dispose();

      this._overlayRef = null;
    }
    this.closeEventEmitter.next();

    this.focus();
  }

  id(): string | null {
    return this._element.nativeElement.getAttribute('id');
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

// for the cdk overlay example, what should the style be?

// One example using the default directives
// Another example using a custom directive (say a timeout warning)
