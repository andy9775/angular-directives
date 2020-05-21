import { Directive, ElementRef, Input, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MenuPanelDirective } from './menu-panel.directive';

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
