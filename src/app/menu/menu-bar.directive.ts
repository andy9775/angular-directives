import {Directive, Input, AfterContentInit, QueryList, Renderer2, ElementRef} from '@angular/core';
import {FocusKeyManager, FocusMonitor} from '@angular/cdk/a11y';
import {MenuButtonDirective} from './menu-button.directive';
import {SPACE, hasModifierKey} from '@angular/cdk/keycodes';

/*
  TODO
    aria-haspopup?
    aria-expanded?
*/
@Directive({
  selector: '[appMenuBar], [cdkMenuBar]',
  exportAs: 'cdkMenuBar',
  host: {
    '(focus)': 'onFocus()',
    '(keydown)': 'keydown($event)',
    role: 'menubar',
    // '[tabindex]': 'hasOpenChild() ? -1 : 0',
    '[tabindex]': '0',
    '[attr.aria-orientation]': 'orientation',
    // should aria-activedescendant be un-set at some point?
    '[attr.aria-activedescendant]': '_ariaActivedescendant',
    '[attr.aria-expanded]': 'hasOpenChild()',
  },
})
export class MenuBarDirective implements AfterContentInit {
  // according to the aria spec, menu bars have horizontal default orientation
  @Input('cdkMenuBarOrientation') orientation: 'horizontal' | 'vertical' = 'horizontal';

  private _children: Array<MenuButtonDirective> = new Array<MenuButtonDirective>();
  private _keyManager: FocusKeyManager<MenuButtonDirective>;
  private _ariaActivedescendant: string | null = null;
  previousFocused: MenuButtonDirective = null;

  // TODO key manager
  constructor(private _element: ElementRef, private fm: FocusMonitor) {
    fm.monitor(_element);
  }

  onFocus() {
    if (!this._keyManager.activeItem) {
      this._keyManager.setFirstItemActive();
    }
    this._keyManager.activeItem.focus();
  }

  ngAfterContentInit() {
    this._keyManager = new FocusKeyManager(this._children)
      .withWrap()
      // TODO use bidi to determine this
      .withHorizontalOrientation('ltr');
  }

  registerChild(child: MenuButtonDirective) {
    child.mouseEnterEmitter.subscribe((element: MenuButtonDirective) => {
      this._children.forEach((child) => {
        if (child !== element) {
          child.closeMenu();
        }
      });
    });
    this._children.push(child);

    child.focusEventEmitter.subscribe((c) => {
      this._ariaActivedescendant = c.id();
    });
  }

  hasOpenChild() {
    return this._children.map((c) => c.isOpen()).includes(true);
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
}
