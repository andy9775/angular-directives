import {
  Directive,
  Input,
  AfterContentInit,
  ElementRef,
  ContentChildren,
  QueryList,
} from '@angular/core';
import {MenuButtonDirective} from './menu-button.directive';
import {RootMenu} from './menu';
import {MenuKeyboardManager} from './keymanager';
import {Subject} from 'rxjs';

/*
  TODO
    aria-label/lablledby? - up to the user?
*/
@Directive({
  selector: '[appMenuBar], [cdkMenuBar]',
  exportAs: 'cdkMenuBar',
  host: {
    '(focus)': 'focusFirstChild()',
    '(keydown)': 'handleKeyEvent($event)',
    role: 'menubar',
    '[tabindex]': '0',
    '[attr.aria-orientation]': 'orientation',
    '[attr.aria-expanded]': 'hasOpenChild()',
    '(document:click)': '_closeHandler.doClick($event)',
  },
})
export class MenuBarDirective extends RootMenu implements AfterContentInit {
  // according to the aria spec, menu bars have horizontal default orientation
  @Input('cdkMenuBarOrientation') orientation: 'horizontal' | 'vertical' = 'horizontal';
  // todo should this emit all close events or just closing out of the menu bar?
  closeEventEmitter = new Subject<void>();

  private _keyManager: MenuKeyboardManager;
  private _closeHandler = new CloseoutHandler(this.getChildren());

  @ContentChildren(MenuButtonDirective, {descendants: true})
  private readonly _allItems: QueryList<MenuButtonDirective>;

  // we can use a single Menu directive to match both a MenuBar and Menu
  // based on the direction.
  readonly _isMenuBar = false;

  constructor(protected _element: ElementRef) {
    super();
    this._isMenuBar = _element.nativeElement.matches('[cdkmenubar]');
  }

  handleKeyEvent(event) {
    this._keyManager.handleEvent(event);
  }
  ngAfterContentInit() {
    console.log('is menu bar: ', this._isMenuBar);
    // we can set the orientation here based on whether it's a menu bar
    // and if the orientation is set or not
    console.log(this.orientation);
    this._keyManager = new MenuKeyboardManager(this._allItems, this.orientation);
    // need this to grab the child events -- once the new keyboard handler is put in place
    // this._allItems.forEach(child => {
    // child._menu._keyboardEventEmitter.subscribe((e) => this._keyManager.keydown(e));
    // });

    // temporary -- GET RID OF THIS
    // we don't need a mouseEnterEmitter
    // we should listen for submenu events
    this._allItems.forEach((c) => {
      c.mouseEnterEmitter.subscribe((element: MenuButtonDirective) => {
        this._allItems.forEach((child) => {
          if (child !== element) {
            child.closeMenu();
          }
        });
      });
      // c.keyboardEventEmitter.subscribe((e) => {
      // do we need to register this here?
      // can we move this logic into the _keyManager?
      // TODO determine when this fires? Only in open children?
      // this._keyManager.handleEvent(e);
      // });
      // if (c._menuPanel) {
      // c._menuPanel._menu.closeEventEmitter.subscribe(() => this.closeEventEmitter.next());
      // }
    });
  }

  focusFirstChild() {
    this._keyManager.focusFirstItem();
  }

  focusLastChild() {
    this._keyManager.focusLastItem();
  }
}

class CloseoutHandler {
  constructor(private children: Array<MenuButtonDirective>) {}
  doClick(event: MouseEvent) {
    if (!this._clickedInChild(event)) {
      // TODO more performent way to do this? Perhaps have the children register for a close event
      // emitter from each parent? Or have a service which gets injected into the appropriate
      // listeners (children)?
      this.children.filter((c) => c.isMenuOpen()).forEach((c) => c.closeMenu());
    }
  }

  private _clickedInChild(event: MouseEvent) {
    return this.children
      .map((child) => {
        if (child.contains(event.target)) {
          return true;
        }
      })
      .includes(true);
  }
}
