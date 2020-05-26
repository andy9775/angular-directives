import {Directive} from '@angular/core';

@Directive({
  selector: '[appMenuBar], [cdkMenuBar]',
  exportAs: 'cdkMenuBar',
})
export class MenuBarDirective {
  constructor() {}
}
