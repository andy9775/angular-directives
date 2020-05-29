import {
  Directive,
  ElementRef,
  Input,
  ViewContainerRef,
  Optional,
  ViewChildren,
  QueryList,
  Renderer2,
} from '@angular/core';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {MenuPanelDirective} from './menu-panel.directive';
import {MenuDirective} from './menu.directive';
import {Subject} from 'rxjs';
import {MenuBarDirective} from './menu-bar.directive';
import {FocusableOption, FocusMonitor} from '@angular/cdk/a11y';

/*
        TODO
          aria-controls

          id??
      */
@Directive({
  selector: '[appMenuButton],[cdkMenuItem]',
  exportAs: 'cdkMenuItem',
  host: {
    '(focus)': 'focusEventEmitter.next(this)',
    '(blur)': 'isFocused = false',
    '(mouseenter)': 'mouseEnter()',
    '(click)': 'onClick()',
    // a11y
    role: 'menuitem',
    type: 'button', // necessary ??
    '[tabindex]': 'isFocused ? "0" : "-1"', // check if disabled
    '[attr.aria-haspopup]': '!!templateRef ? "menu" : "false"', // only if it has a ref??
    '[attr.aria-expanded]': '!!_overlayRef',
  },
})
export class MenuButtonDirective implements FocusableOption {
  @Input('cdkMenuItem') templateRef: MenuPanelDirective;
  private _overlayRef: OverlayRef;
  mouseEnterEmitter = new Subject();
  closeEventEmitter = new Subject();
  focusEventEmitter = new Subject<MenuButtonDirective>();

  isFocused = false;

  constructor(
    private _overlay: Overlay,
    private _element: ElementRef,
    private _viewContainer: ViewContainerRef,
    private fm: FocusMonitor,
    // if not null this button is within a sub-menu (hacky)
    @Optional() private _parentMenu?: MenuDirective,
    @Optional() private _parentMenuBar?: MenuBarDirective
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
  }

  onClick() {
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
      }

      // get focus event from the sub-menu
      this.templateRef.child.focusEventEmitter.subscribe((c) => {
        this.focusEventEmitter.next(c);
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
