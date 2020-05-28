import {Directive, Input, AfterContentInit, ElementRef, AfterViewInit} from '@angular/core';
import {MenuPanelDirective} from './menu-panel.directive';
import {MenuButtonDirective} from './menu-button.directive';
import {FocusKeyManager} from '@angular/cdk/a11y';
import {SPACE} from '@angular/cdk/keycodes';

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
    '[tabindex]': '0',
    '[attr.aria-orientation]': 'orientation',
  },
})
export class MenuDirective implements AfterContentInit {
  @Input('cdkMenuOrientation') orientation: 'horizontal' | 'vertical' = 'vertical';
  /*
    Can't do:
      @ViewChildren(MenuButtonDirective) _children: QueryList<MenuButtonDirective>;
    throws "Uncaught reference error"

    We register child buttons with their menu
   */
  children: Array<MenuButtonDirective> = new Array<MenuButtonDirective>();

  private _keyManager: FocusKeyManager<MenuButtonDirective>;

  // TODO key manager
  constructor(private _parent: MenuPanelDirective, private _element: ElementRef) {
    _parent.registerChildMenu(this);
  }

  keydown(event: KeyboardEvent) {
    const {keyCode} = event;
    switch (keyCode) {
      case SPACE:
        event.preventDefault();
        this._keyManager.activeItem.onClick();
        if (this._keyManager.activeItem.templateRef.child) {
          this._keyManager.activeItem.templateRef.child.focusFirstItem();
        }
        break;
      default:
        this._keyManager.onKeydown(event);
    }
  }

  ngAfterContentInit() {
    this._keyManager = new FocusKeyManager(this.children).withWrap().withVerticalOrientation();
  }

  focusFirstItem() {
    this._element.nativeElement.focus();
    console.log(this._element.nativeElement);
  }

  registerChild(child: MenuButtonDirective) {
    child.mouseEnterEmitter.subscribe((element: MenuButtonDirective) => {
      this.children.forEach((child) => {
        if (child !== element) {
          child.closeMenu();
        }
      });
    });
    this.children.push(child);
  }
}
