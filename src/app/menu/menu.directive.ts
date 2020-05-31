import {Directive, Input, AfterContentInit, ElementRef, AfterViewInit} from '@angular/core';
import {MenuPanelDirective} from './menu-panel.directive';
import {MenuButtonDirective} from './menu-button.directive';
import {FocusKeyManager, FocusMonitor} from '@angular/cdk/a11y';
import {SPACE, LEFT_ARROW, ESCAPE, RIGHT_ARROW, TAB} from '@angular/cdk/keycodes';
import {Subject} from 'rxjs';
import {RootMenu} from './menu';

/*
  TODO
    aria-label (based on the connected button)
*/
@Directive({
  selector: '[cdkMenu]',
  exportAs: 'cdkMenu',
  host: {
    '(keydown)': 'keydown($event)',
    // '(keydown)': 'test()',
    // a11y
    role: 'menu',
    '[attr.aria-orientation]': 'orientation',
  },
})
export class MenuDirective extends RootMenu implements AfterContentInit {
  @Input('cdkMenuOrientation') orientation: 'horizontal' | 'vertical' = 'vertical';
  /*
    Can't do:
      @ViewChildren(MenuButtonDirective) _children: QueryList<MenuButtonDirective>;
    throws "Uncaught reference error"

    We register child buttons with their menu
   */

  closeEventEmitter = new Subject<void>();
  tabEventEmitter = new Subject<void>();
  focusEventEmitter = new Subject<MenuButtonDirective>();

  // TODO key manager
  constructor(
    private _parent: MenuPanelDirective,
    private _element: ElementRef,
    private fm: FocusMonitor
  ) {
    super();
    fm.monitor(_element);
    _parent.registerChildMenu(this);
  }

  keydown(event: KeyboardEvent) {
    const {keyCode} = event;
    switch (keyCode) {
      case SPACE:
        event.preventDefault();
        this._keyManager.activeItem.onClick();

        this._keyManager.activeItem.closeEventEmitter.subscribe(() => {
          // this._element.nativeElement.focus();
          this._keyManager.activeItem.focus();
        });
        this._keyManager.activeItem.tabEventEmitter.subscribe(() => {
          // this._element.nativeElement.focus();
          this.tabEventEmitter.next();
        });

        if (this._keyManager.activeItem.templateRef.child) {
          this._keyManager.activeItem.templateRef.child.focusFirstItem();
        }
        break;
      case ESCAPE:
        this.closeEventEmitter.next();
        break;
      /*
          TODO
            right arrow:
              if has sub-menu, open it
              otherwise fall through
            left arrow:
              close this menu and go back to parent

            if the top most (part of menu bar) allow left arrow (or right without sub) to toggle
            to next/previous sub-menu
         */
      case TAB:
        this.tabEventEmitter.next();
        break;
      default:
        this._keyManager.onKeydown(event);
    }
  }

  ngAfterContentInit() {
    this._keyManager = new FocusKeyManager(this.children).withWrap().withVerticalOrientation();
    this._keyManager.change.subscribe((i) => console.log(i));
  }

  focusFirstItem() {
    // this._element.nativeElement.focus();
    this._keyManager.setActiveItem(0);
  }

  registerChild(child: MenuButtonDirective) {
    super.registerChild(child);
    child.focusEventEmitter.subscribe((c) => this.focusEventEmitter.next(c));
  }
}
