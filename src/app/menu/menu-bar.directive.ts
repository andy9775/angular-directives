import {Directive, Input, AfterContentInit, ElementRef} from '@angular/core';
import {FocusKeyManager, FocusMonitor} from '@angular/cdk/a11y';
import {MenuButtonDirective} from './menu-button.directive';
import {SPACE, hasModifierKey} from '@angular/cdk/keycodes';
import {RootMenu} from './menu';

/*
  TODO
    aria-label/lablledby? - up to the user?
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
    // is this needed? or can we use roving tab index??
    // '[attr.aria-activedescendant]': '_ariaActivedescendant',
    '[attr.aria-expanded]': 'hasOpenChild()',
    '(document:click)': 'doClick($event)',
  },
})
export class MenuBarDirective extends RootMenu implements AfterContentInit {
  // according to the aria spec, menu bars have horizontal default orientation
  @Input('cdkMenuBarOrientation') orientation: 'horizontal' | 'vertical' = 'horizontal';

  private _ariaActivedescendant: string | null = null;

  // TODO key manager
  constructor(private _element: ElementRef, private fm: FocusMonitor) {
    super();
    fm.monitor(_element);
  }

  onFocus() {
    if (!this._keyManager.activeItem) {
      this._keyManager.setFirstItemActive();
    }
    this._keyManager.activeItem.focus();
  }

  ngAfterContentInit() {
    this._keyManager = new FocusKeyManager(this.children)
      .withWrap()
      // TODO use bidi to determine this
      .withHorizontalOrientation('ltr');
  }

  doClick(event: MouseEvent) {
    if (
      !this.children
        .map((child) => {
          if (child.contains(event.target)) {
            return true;
          }
        })
        .includes(true)
    ) {
      // TODO more performent way to do this? Perhaps have the children register for a close event
      // emitter from each parent? Or have a service which gets injected into the appropriate
      // listeners (children)?
      this.children.filter((c) => c.isOpen()).forEach((c) => c.closeMenu());
    }
  }

  registerChild(child: MenuButtonDirective) {
    super.registerChild(child);

    child.focusEventEmitter.subscribe((c) => {
      this._ariaActivedescendant = c.id();
    });
    child.keyboardEventEmitter.subscribe((e) => {
      this._keyManager.onKeydown(e);
      console.log('right wrrow');
      setTimeout(() => {
        // ERROR fix me - the order of focused events is off
        // without timeout it focuses incorrectly
        this._keyManager.activeItem.focus();
        this._keyManager.activeItem.onClick();
        console.log(this._keyManager.activeItem.templateRef);
        if (this._keyManager.activeItem.templateRef.child) {
          this._keyManager.activeItem.templateRef.child.focusFirstItem();
        }
      }, 0);
    });
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
