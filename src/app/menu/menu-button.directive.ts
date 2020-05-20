import { Directive, ElementRef, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appMenuButton]',
  exportAs: 'appMenuButton',
  host: {
    '(click)': 'onClick.emit()',
  },
})
export class MenuButtonDirective {
  @Output() onClick = new EventEmitter();

  constructor(public element: ElementRef<HTMLElement>) {}
}
