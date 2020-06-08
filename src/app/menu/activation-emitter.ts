import {Injectable} from '@angular/core';
import {MenuButtonDirective} from './menu-button.directive';
import {Subject} from 'rxjs';

@Injectable()
export class ActivationEmitter {
  activate: Subject<MenuButtonDirective> = new Subject();
}
