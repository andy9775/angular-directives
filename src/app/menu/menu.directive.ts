import {Directive, Input} from '@angular/core';

/*
  TODO
    aria-label (based on the connected button)
*/
@Directive({
  selector: '[appMenuPanel], [cdkMenu]',
  exportAs: 'cdkMenu',
  host: {
    // a11y
    role: 'menu',
    tabindex: '-1',
    '[attr.aria-orientation]': 'orientation',
  },
})
export class MenuDirective {
  @Input('cdkMenuOrientation') orientation: 'horizontal' | 'vertical' = 'vertical';

  // TODO key manager
  constructor() {}
}
