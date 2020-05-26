import {Directive, TemplateRef, ViewChild} from '@angular/core';
import {MenuDirective} from './menu.directive';

@Directive({
  selector: '[appMenuPanel], [cdkMenuPanel]',
  exportAs: 'cdkMenuPanel',
})
export class MenuPanelDirective {
  /*
    TODO
      - how to get a reference to the child element

  */
  constructor(public template: TemplateRef<any>) {}
}
