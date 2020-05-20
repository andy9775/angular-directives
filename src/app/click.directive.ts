import { Directive } from '@angular/core';

@Directive({
  selector: '[appClick]',
  host: {
    '(click)': 'onClick()',
  },
})
export class ClickDirective {
  onClick() {
    console.log('clicked from directive');
  }
  constructor() {}
}
