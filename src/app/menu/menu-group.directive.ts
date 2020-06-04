import {Directive, Input} from '@angular/core';
import {MenuButtonDirective} from './menu-button.directive';
import {RadioGroupSelectionService} from './radio-group-selection.service';

// this and menu should provide a Updater
@Directive({
  selector: '[appMenuGroup], [cdkMenuRadioGroup]',
  exportAs: 'cdkMenuRadioGroup',
  host: {
    role: 'group',
  },
})
export class MenuGroupDirective {
  @Input('cdkMenuRadioGroup') _id: string;

  constructor(private _selectionService: RadioGroupSelectionService) {}

  setActiveChild(c: MenuButtonDirective) {
    this._selectionService.setActiveChild(this._id, c.id);
  }

  isActiveChild(c: MenuButtonDirective) {
    return this._selectionService.isActiveChild(this._id, c.id);
  }
}
