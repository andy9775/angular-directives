import {Directive, TemplateRef, ContentChild} from '@angular/core';
import {MenuDirective} from './menu.directive';

@Directive({
  selector: '[appMenuPanel], [cdkMenuPanel]',
  exportAs: 'cdkMenuPanel',
})
export class MenuPanelDirective {
  child: MenuDirective;

  /*
    TODO
      - how to get a reference to the child element

  */
  constructor(public template: TemplateRef<any>) {}

  registerChildMenu(child: MenuDirective) {
    this.child = child;
  }
}
