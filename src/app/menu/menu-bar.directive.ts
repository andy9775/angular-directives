import {Directive, Input} from '@angular/core';

/*
  TODO
    aria-haspopup?
    aria-expanded?
*/
@Directive({
  selector: '[appMenuBar], [cdkMenuBar]',
  exportAs: 'cdkMenuBar',
  host: {
    role: 'menubar',
    tabindex: '0',
    '[attr.aria-orientation]': 'orientation',
  },
})
export class MenuBarDirective {
  // according to the aria spec, menu bars have horizontal default orientation
  @Input('cdkMenuBarOrientation') orientation: 'horizontal' | 'vertical' = 'horizontal';

  // TODO key manager
  constructor() {}
}
