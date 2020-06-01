import {Injectable} from '@angular/core';
import {MenuButtonDirective} from './menu-button.directive';

@Injectable({
  providedIn: 'root',
})
export class CheckboxStateService {
  private _state = new Map<string, boolean>();
  isChecked(child: MenuButtonDirective) {
    return this._state.get(child._id) || false;
  }
  toggle(child: MenuButtonDirective) {
    this._state.set(child._id, !(this._state.get(child._id) || false));
  }
}
