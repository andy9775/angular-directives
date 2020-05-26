import {Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: '[appMenuPanel], [cdkMenuPanel]',
  exportAs: 'cdkMenuPanel',
})
export class MenuPanelDirective {
  /*
    TODO
    - menu panel allows for sub-elements to be lined up horizontally - are we ok

  */
  constructor(public template: TemplateRef<any>) {}
}
