import { Directive, ElementRef, Input, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MenuPanelDirective } from './menu-panel.directive';

/*
  TODO
  - on hover - if another button is open, close it and open this one (will
    backdrop get in the way?)

  ---------

  backdrop changes the background color (to focus on opened content) and it
  prevents mouse enter events from hitting the other buttons.

  approaches to 'click-out-to-close':
    - listen for document click events and filter out those which are in the
      given template. This should consider parent menus - requires passing
      events to close menus and keep others open
        (rxjs fromEvent, filter and takeOne)
    - listen for click events through out the parent chain with the menu bar
      listening to the dom. Passing up/down the events through the menu tree.
      (not ideal)
    - what does mat-menu do?
*/
@Directive({
  selector: '[appMenuButton]',
  exportAs: 'appMenuButton',
  host: {
    '(click)': 'onClick()',
  },
})
export class MenuButtonDirective {
  @Input('appMenuButton') templateRef: MenuPanelDirective;

  private _overlayRef: OverlayRef;

  constructor(
    private _overlay: Overlay,
    private _element: ElementRef,
    private _viewContainer: ViewContainerRef
  ) {}

  onClick() {
    !!this._overlayRef ? this._closeMenu() : this._openMenu();
  }

  private _openMenu() {
    this._overlayRef = this._overlay.create({
      positionStrategy: this._getOverlayPositionStrategy(),
      // backdrop has a default style applied to it!!!
      hasBackdrop: true,
    });
    const portal = new TemplatePortal(
      this.templateRef.template,
      this._viewContainer
    );
    this._overlayRef.attach(portal);

    this._setCloseHandlers();
  }

  private _closeMenu() {
    // TODO better clean up
    this._overlayRef.detach();
    this._overlayRef.dispose();
    this._overlayRef = null;
  }

  private _getOverlayPositionStrategy() {
    return this._overlay
      .position()
      .flexibleConnectedTo(this._element)
      .setOrigin(this._element)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
      ])
      .withLockedPosition();
  }

  private _setCloseHandlers() {
    this._overlayRef.backdropClick().subscribe(this._closeMenu.bind(this));
  }
}
