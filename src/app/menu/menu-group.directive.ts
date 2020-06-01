import {Directive, TemplateRef, ContentChild, Input} from '@angular/core';
import {MenuDirective} from './menu.directive';
import {MenuButtonDirective} from './menu-button.directive';

/*

  TODO
    since the group disapears we need some sort of global state store which is shared and tracks
    which elements are selected. This can be as simple as a map[string]MenuButtonDirective
    where the string identifies a unique MenuGroup Directive element
      The issue is how, can't use random id since each instance gets it removed so we need
      the user to set the id

      A required name?
 */
@Directive({
  selector: '[appMenuGroup], [cdkMenuGroup]',
  exportAs: 'cdkMenuGroup',
  host: {
    // '(keydown)': 'keydown($event)',
  },
})
export class MenuGroupDirective {
  @Input('cdkMenuGroup') _id: string;

  private _activeChild: MenuButtonDirective;
  constructor(menu: MenuDirective) {}

  setActiveChild(c: MenuButtonDirective) {
    this._activeChild = c;
  }

  isActiveChild(c: MenuButtonDirective) {
    return c === this._activeChild;
  }
}
