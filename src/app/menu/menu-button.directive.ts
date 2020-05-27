import {Directive, ElementRef, Input, ViewContainerRef, Optional} from '@angular/core';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {MenuPanelDirective} from './menu-panel.directive';
import {MenuDirective} from './menu.directive';
import {EventEmitter} from 'protractor';
import {Observable, Subject} from 'rxjs';
import {MenuBarDirective} from './menu-bar.directive';

/*
        TODO
          aria-controls

          id??
      */
@Directive({
  selector: '[appMenuButton],[cdkMenuItem]',
  exportAs: 'cdkMenuItem',
  host: {
    '(mouseenter)': 'mouseEnter()',
    '(click)': 'onClick()',
    // a11y
    role: 'menuitem',
    type: 'button', // necessary ??
    tabindex: '-1',
    '[attr.aria-haspopup]': '!!templateRef ? "menu" : "false"', // only if it has a ref??
    '[attr.aria-expanded]': '!!_overlayRef',
  },
})
export class MenuButtonDirective {
  @Input('cdkMenuItem') templateRef: MenuPanelDirective;
  private _overlayRef: OverlayRef;

  mouseEnterEmitter = new Subject();

  constructor(
    private _overlay: Overlay,
    private _element: ElementRef,
    private _viewContainer: ViewContainerRef,
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
  }

  onClick() {
    // check - do nothing if there is a child menu?
    !!this._overlayRef ? this.closeMenu() : this._openMenu();
  }

  mouseEnter() {
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
    }
  }

  closeMenu() {
    if (this.templateRef.child) {
      this.templateRef.child.children.forEach((child) => child.closeMenu());
    }
    // TODO better clean up
    if (this._overlayRef) {
      console.log(this._overlayRef.detach());

      this._overlayRef.dispose();

      this._overlayRef = null;
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

// for the cdk overlay example, what should the style be?

// One example using the default directives
// Another example using a custom directive (say a timeout warning)
