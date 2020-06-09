import {
  Directive,
  Input,
  AfterContentInit,
  ElementRef,
  ContentChildren,
  QueryList,
  Optional,
  Self,
} from '@angular/core';
import {MenuButtonDirective} from './menu-button.directive';
import {MenuKeyboardManager} from './keymanager';
import {Subject} from 'rxjs';
import {MenuMouseManager} from './mouse-manager';
import {MenuPanelDirective} from './menu-panel.directive';
import {FocusEmitter} from './focus-emitter';
import {ActivationEmitter} from './activation-emitter';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';

export class MenuEvent {}
/*
  TODO
    aria-label/lablledby? - up to the user?
*/
@Directive({
  selector: '[appMenuBar], [cdkMenuBar], [cdkMenu]',
  exportAs: 'cdkMenu',
  host: {
    '(focus)': 'focusFirstChild()',
    '(keydown)': 'handleKeyEvent($event)',
    '[attr.role]': '_role',
    '[attr.tabindex]': '_tabindex',
    '[attr.aria-orientation]': '_orientation',
    '[attr.aria-expanded]': '_hasOpenChild()',
    '[attr.aria-lablledby]': 'lablledBy',
    // '(document:click)': '_closeHandler.doClick($event)',
  },
  providers: [FocusEmitter, ActivationEmitter, UniqueSelectionDispatcher],
})
export class MenuDirective implements AfterContentInit {
  // according to the aria spec, menu bars have horizontal default orientation
  @Input('cdkMenuBarOrientation') _orientation: 'horizontal' | 'vertical' | null = null;
  @Input() lablledBy: string | null = null;
  // todo should this emit all close events or just closing out of the menu bar?
  closeEventEmitter = new Subject<void>();

  _role = 'menu';
  private _tabindex: 0 | null = null;

  _keyManager: MenuKeyboardManager;
  _mouseManager: MenuMouseManager;

  // private _closeHandler = new CloseoutHandler(this._getChildren());

  @ContentChildren(MenuButtonDirective, {descendants: true})
  private readonly _allItems: QueryList<MenuButtonDirective>;

  // we can use a single Menu directive to match both a MenuBar and Menu
  // based on the direction.
  readonly _isMenuBar = false;

  _promises: Array<Promise<() => void>> = [];

  constructor(
    protected _element: ElementRef,
    @Self() private _focusEmitter: FocusEmitter,
    @Self() private _activationEmitter: ActivationEmitter,
    @Optional() private _parent: MenuPanelDirective
  ) {
    this._isMenuBar = _element.nativeElement.matches('[cdkmenubar]');
    if (_parent) {
      _parent.registerMenu(this);
    }
  }

  handleKeyEvent(event) {
    this._keyManager.handleEvent(event);
  }

  ngAfterContentInit() {
    if (this._isMenuBar) {
      this._role = 'menubar';
      this._tabindex = 0;
      this._orientation = this._orientation || 'horizontal';
      if (this._allItems.first) {
        this._allItems.first._tabIndex = 0;
      }
      this._allItems.forEach((c) => (c._openDirection = 'bottom'));
    } else {
      this._orientation = this._orientation || 'vertical';
    }

    this._keyManager = new MenuKeyboardManager(this._allItems, this._orientation);
    this._mouseManager = new MenuMouseManager(
      this._keyManager,
      this._allItems,
      this._focusEmitter,
      this._activationEmitter,
      this._role === 'menu'
    );

    Promise.resolve(this._promises);
  }
  onOpen(f: () => void) {
    const r = new Promise<() => void>(f);
    this._promises.push(r);
    return r;
  }

  focusFirstChild() {
    this._keyManager.focusFirstItem();
  }

  focusLastChild() {
    this._keyManager.focusLastItem();
  }

  getChildren() {
    return this._allItems;
  }

  _hasOpenChild() {
    return this._allItems.map((c) => c.isMenuOpen()).includes(true);
  }
}

// class CloseoutHandler {
//   constructor(private children: Array<MenuButtonDirective>) {}
//   doClick(event: MouseEvent) {
//     if (!this._clickedInChild(event)) {
//       // TODO more performent way to do this? Perhaps have the children register for a close event
//       // emitter from each parent? Or have a service which gets injected into the appropriate
//       // listeners (children)?
//       this.children.filter((c) => c.isMenuOpen()).forEach((c) => c.closeMenu());
//     }
//   }

//   private _clickedInChild(event: MouseEvent) {
//     return this.children
//       .map((child) => {
//         if (child.contains(event.target)) {
//           return true;
//         }
//       })
//       .includes(true);
//   }
// }
