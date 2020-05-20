import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { MenuButtonDirective } from './menu-button.directive';
import { Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Directive({
  selector: '[appMenuPanel]',
  exportAs: 'appMenuPanel',
})
export class MenuPanelDirective {
  @Input('appMenuPanel') button: MenuButtonDirective;

  constructor(
    private overlay: Overlay,
    private _viewContainer: ViewContainerRef,
    private _template: TemplateRef<any>
  ) {}

  ngOnInit() {
    this.button.onClick.subscribe(this.onClick.bind(this));
  }

  onClick() {
    /*
      TODO:
        - open below the given button - now it opens left
        - close when clicking outside of opened panel
     */
    const strategy = this.overlay
      .position()
      .flexibleConnectedTo(this.button as any)
      .setOrigin(this.button as any)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
      ])
      .withLockedPosition();
    const overlay = this.overlay.create({
      positionStrategy: strategy,
    });

    const portal = new TemplatePortal(this._template, this._viewContainer);
    overlay.attach(portal);
  }
}
