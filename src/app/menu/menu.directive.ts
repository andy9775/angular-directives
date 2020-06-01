import {Directive, Input, AfterContentInit, ElementRef, AfterViewInit} from '@angular/core';
import {MenuPanelDirective} from './menu-panel.directive';
import {MenuButtonDirective} from './menu-button.directive';
import {FocusKeyManager, FocusMonitor} from '@angular/cdk/a11y';
import {SPACE, ESCAPE, TAB, LEFT_ARROW, RIGHT_ARROW} from '@angular/cdk/keycodes';
import {Subject} from 'rxjs';
import {RootMenu} from './menu';

/*
  TODO
    aria-label (provided by user)
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
    '[attr.aria-lablledby]': 'lablledBy',
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
  keyboardEventEmitter = new Subject<KeyboardEvent>();

  lablledBy: string | null = null;

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
    const {keyCode} = event; // TODO don't use keyCode
    switch (keyCode) {
      case ESCAPE:
        this.closeEventEmitter.next();
        break;
      case LEFT_ARROW:
        // TODO if top level menu, toggle to next
        this.keyboardEventEmitter.next(event);
        break;
      case RIGHT_ARROW:
        if (this._keyManager.activeItem.hasSubmenu()) {
          this._openSubMenu();
        } else {
          this.keyboardEventEmitter.next(event);
        }
        break;
      case SPACE:
        event.preventDefault();
        this._openSubMenu();
        break;
      case TAB:
        this.tabEventEmitter.next();
        break;
      default:
        this._keyManager.onKeydown(event);
    }
  }

  contains(el) {
    return (
      this._element.nativeElement.contains(el) ||
      this.children.map((c) => c.contains(el)).includes(true)
    );
  }

  private _openSubMenu() {
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
    child.keyboardEventEmitter.subscribe((e) => this.keyboardEventEmitter.next(e));
  }

  id(): string | null {
    // TODO generate a sequential internal id and use either that or the provided id?
    return this._element.nativeElement.getAttribute('id');
  }
}
