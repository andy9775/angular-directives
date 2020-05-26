import {Directive, TemplateRef} from '@angular/core';

@Directive({
  selector: '[appMenuPanel], [cdkMenu]',
  exportAs: 'cdkMenu',
})
export class MenuDirective {
  constructor() {}
}
