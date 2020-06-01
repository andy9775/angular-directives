import {Injectable} from '@angular/core';
import {MenuButtonDirective} from './menu-button.directive';

@Injectable({
  providedIn: 'root',
})
export class RadioGroupSelectionService {
  private static _groups: Map<string, string> = new Map();

  registerGroup(id: string) {
    if (!RadioGroupSelectionService._groups.has(id)) {
      RadioGroupSelectionService._groups.set(id, null);
    }
  }

  setActiveChild(id: string, childID: string) {
    RadioGroupSelectionService._groups.set(id, childID);
  }

  isActiveChild(groupId: string, childID: string) {
    return RadioGroupSelectionService._groups.get(groupId) === childID;
  }
}
