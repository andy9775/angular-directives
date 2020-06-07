import {Directive, TemplateRef, ContentChild, OnDestroy} from '@angular/core';
import {MenuDirective} from './menu.directive';
import {Menu} from './menu';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MenuButtonDirective} from './menu-button.directive';

@Directive({
  selector: '[appMenuPanel], [cdkMenuPanel]',
  exportAs: 'cdkMenuPanel',
})
export class MenuPanelDirective implements OnDestroy, Menu {
  _menu: Menu;
  _keyboardEventEmitter = new Subject<KeyboardEvent>();
  closeEventEmitter: Subject<void>;

  // get rid of this
  tabEventEmitter: Subject<void>;
  set lablledBy(val: string) {
    this._menu.lablledBy = val;
  }
  get lablledBy() {
    return this._menu.lablledBy;
  }

  private readonly _destroy = new Subject<void>();

  constructor(public template: TemplateRef<HTMLElement>) {}

  registerChildMenu(child: MenuDirective) {
    this._menu = child;
    child._keyboardEventEmitter.pipe(takeUntil(this._destroy)).subscribe((e) => {
      this._keyboardEventEmitter.next(e);
    });
    child.closeEventEmitter
      .pipe(takeUntil(this._destroy))
      .subscribe(() => this.closeEventEmitter.next());
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  getChildren(): Array<MenuButtonDirective> {
    return this._menu.getChildren();
  }
  hasOpenChild(): boolean {
    return this._menu.hasOpenChild();
  }
  contains(el) {
    return this._menu && this._menu.contains(el);
  }
  focusFirstChild() {
    this._menu.focusFirstChild();
  }
  focusLastChild() {
    this._menu.focusLastChild();
  }
}
