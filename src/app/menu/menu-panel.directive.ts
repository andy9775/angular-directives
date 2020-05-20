import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appMenuPanel]',
  exportAs: 'appMenuPanel',
})
export class MenuPanelDirective {
  /*
    TODO
    - menu panel allows for sub-elements to be lined up horizontally - are we ok
      with this?
  */
  constructor(public template: TemplateRef<any>) {}
}
