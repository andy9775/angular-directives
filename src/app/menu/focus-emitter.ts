import {Injectable} from '@angular/core';
import {MenuButtonDirective} from './menu-button.directive';
import {Subject} from 'rxjs';

@Injectable()
export class FocusEmitter {
  focus: Subject<MenuButtonDirective> = new Subject();
}
