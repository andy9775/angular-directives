import {
  SPACE,
  ESCAPE,
  TAB,
  LEFT_ARROW,
  RIGHT_ARROW,
  ENTER,
  DOWN_ARROW,
  UP_ARROW,
  HOME,
  END,
} from '@angular/cdk/keycodes';
import {MenuButtonDirective} from './menu-button.directive';
import {FocusKeyManager} from '@angular/cdk/a11y';
import {Subject, Subscription} from 'rxjs';
import {QueryList} from '@angular/core';
import {takeUntil} from 'rxjs/operators';

/*
  NOTES:
    Button should be responsible for handling click events (openinging menu)
    for both keyboard clicks and mouse events (onMouseClose)

    It should be up to the parent menu to handle button close events.
    When a button emits a close event

    We need to pass skipped _keyboardEvents from one menu to the other.
*/

export class MenuKeyboardManager {
  private readonly _keyManager: FocusKeyManager<MenuButtonDirective>;
  // instead of the close evevnt emitter should we just pass the events up?
  // when we get an escape event that means that the current menu should
  // be closed and the parent button should focus.
  // if the higher level menu gets the event, it can call onclick on the
  // active child if the active child has an open element
  // readonly _closeEventEmitter = new Subject<void>();
  // emits unhandled keyboard events
  readonly _keyboardEventEmitter = new Subject<KeyboardEvent>();

  private _destroyKeyboardSubscription = new Subject<void>();

  constructor(
    private _children: QueryList<MenuButtonDirective>,
    private _orientation: 'horizontal' | 'vertical'
  ) {
    this._keyManager = new FocusKeyManager(_children).withWrap().withTypeAhead(100);
    if (_orientation === 'horizontal') {
      // TODO get layout direction
      this._keyManager = this._keyManager.withHorizontalOrientation('ltr');
    } else {
      this._keyManager = this._keyManager.withVerticalOrientation();
    }
    this._keyManager.change.subscribe(() => {
      this._destroyKeyboardSubscription.next();
      // bubble up keyboard events which aren't handled in the child
      // and handle them here.
      if (this._keyManager.activeItem.hasSubmenu()) {
        this._keyManager.activeItem._menu._keyboardEventEmitter
          .pipe(takeUntil(this._destroyKeyboardSubscription))
          .subscribe((e) => {
            this.handleEvent(e, true);
          });
      }
    });
  }

  focusFirstItem() {
    this._keyManager.setFirstItemActive();
  }

  focusLastItem() {
    this._keyManager.setLastItemActive();
  }

  focusItem(el: MenuButtonDirective) {
    // this can be used to set focus on mouse events
    // the parent can have a mouse event listener
    // and the mouse event listener/handler can set focus
    // to the given element in the _keyManager
    // so that if we continue with
    // keyboard after mousing, we can continue
    // on from the correct element
    //
    // NOTE: it is up to the menu to set focus to the item
    // it can do so by having a mouse handler class
    this._children.forEach((child, i) => {
      if (child === el) {
        this._keyManager.setActiveItem(i);
      }
    });
  }

  onDestroy() {
    this._destroyKeyboardSubscription.next();
    this._destroyKeyboardSubscription.complete();
    this._keyboardEventEmitter.complete();
  }

  handleEvent(event: KeyboardEvent, bubbled = false) {
    let activeItem = this._keyManager.activeItem;
    switch (event.keyCode) {
      case ENTER:
      case SPACE:
        if (activeItem && !bubbled) {
          event.preventDefault();
          activeItem.onClick();
          if (activeItem.isMenuOpen()) {
            activeItem._menu.focusFirstChild();
          }
        }
        if (bubbled && activeItem.isMenuOpen()) {
          activeItem.onClick();
          this._keyboardEventEmitter.next(event);
        } else if (!activeItem.hasSubmenu() && activeItem._isItem()) {
          activeItem.onClick();
          this._keyboardEventEmitter.next(event);
        }
        break;
      case LEFT_ARROW:
        if (this._isHorizontal()) {
          const prev = this._keyManager.activeItem;
          this._keyManager.onKeydown(event);
          activeItem = this._keyManager.activeItem;
          if (prev.isMenuOpen() && activeItem.hasSubmenu()) {
            activeItem.onClick();
          }
          if (prev.isMenuOpen()) {
            prev.onClick();
          }
        } else {
          if (activeItem && activeItem.isMenuOpen()) {
            activeItem.onClick();
            activeItem.focus();
            this._keyManager.setActiveItem(this._keyManager.activeItemIndex);
          } else {
            this._keyboardEventEmitter.next(event);
          }
        }
        break;
      case RIGHT_ARROW:
        if (this._isHorizontal()) {
          const prev = this._keyManager.activeItem;
          this._keyManager.onKeydown(event);
          activeItem = this._keyManager.activeItem;
          if (prev.isMenuOpen() && activeItem.hasSubmenu()) {
            console.log('handle: ', prev.id, activeItem.id);
            activeItem.onClick();
            prev.onClick();
          }
        } else {
          if (activeItem && activeItem.hasSubmenu() && !bubbled) {
            activeItem.onClick();
            activeItem._menu.focusFirstChild();
          } else {
            if (activeItem.isMenuOpen()) {
              activeItem.onClick();
            }
            this._keyboardEventEmitter.next(event);
          }
        }
        break;
      case UP_ARROW:
      case DOWN_ARROW:
        if (this._isHorizontal()) {
          event.preventDefault();
          if (activeItem.hasSubmenu()) {
            if (!activeItem.isMenuOpen()) {
              activeItem.onClick();
            }
            event.keyCode === DOWN_ARROW
              ? activeItem._menu.focusFirstChild()
              : activeItem._menu.focusLastChild();
          }
        } else {
          this._keyManager.onKeydown(event);
        }
        break;
      case HOME:
      case END:
        event.keyCode === HOME
          ? activeItem._menu.focusFirstChild()
          : activeItem._menu.focusLastChild();
        break;
      case ESCAPE:
        if (activeItem && activeItem.isMenuOpen()) {
          activeItem.onClick();
          this._keyManager.setActiveItem(this._keyManager.activeItemIndex);
        } else {
          this._keyboardEventEmitter.next(event);
        }
        break;
      case TAB:
        if (activeItem && activeItem.isMenuOpen()) {
          activeItem.onClick();
        }
        this._keyboardEventEmitter.next(event);
        break;
      default:
        this._keyManager.onKeydown(event);
    }
  }

  private _openSubmenu() {
    if (this._keyManager.activeItem._menuPanel._menu) {
      this._keyManager.activeItem._menuPanel._menu.focusFirstChild();
    }
  }

  private _isHorizontal() {
    return this._orientation === 'horizontal';
  }
}

// export class MenuKeyManager {
//   protected _keyManager: FocusKeyManager<MenuButtonDirective>;
//   // perhaps we should not emit these events
//   // individually either.
//   // Perhaps we should just emit on the keyboardEventEmitter
//   // and then handle escape events individually?
//   // Or should we assume that an escape is a
//   // close event and therefore
//   closeEventEmitter = new Subject<void>();
//   // TODO keyboardEventEmitter will emit the tab event
//   // and it'll be up to the parent to decide to handle it.
//   tabEventEmitter = new Subject<void>();

//   // this should not be here. handleEvent should return boolean
//   // and it should be up to the parent to decide what to do?
//   // yes, because when an event comes in we want to know if
//   // that specific one was handled and then we want to make a
//   // decision whether to pass it up or not.
//   // or should we emit here? That way the synchronous
//   // source is the event handler and we emit async for
//   // anything which isn't handled.
//   //
//   // ============== underscore ==============
//   keyboardEventEmitter = new Subject<KeyboardEvent>();

//   constructor(children: QueryList<MenuButtonDirective>) {
//     this._keyManager = new FocusKeyManager(children)
//       .withWrap()
//       .withVerticalOrientation()
//       .withTypeAhead(100);

//     // this._keyManager.change.subscribe((i) => console.log(`changed active item: ${i}`));
//   }

//   focusFirstItem() {
//     this._keyManager.setFirstItemActive();
//   }
//   focusLastItem() {
//     this._keyManager.setLastItemActive();
//   }

//   /*
//     Refactor:
//       Each MenuItem can also handle it's own keyboard signals - namely left and right
//       for opening up the submenu as well as space and enter to handle logic. Otherwise
//       skip and it'll propogate up to the parent.
//           menu item should handle keyboard events for opening it.
//           should have a keyboard handler for it as well.

//           on open it should emit an event to siblings

//           Don't prevent default on left/right arrow - allow parent to listen for it

//       Here we should handle
//         escape
//         left/right arrow (by emitting a closed event)
//         up/down by allowing the manager to handle the logic

//         in actuallity we should handle all types of events since we have to consider
//         horizontal and veritcal layout. Therefore the keymanager is responsbile for
//         opening and closing menu items based on their layout direction.
//         This means that the menu items don't need to share a signal between them to
//         handle open/close signals - only click events.

//       Focus on what's the difference between the menu and menuitem and how does that relate
//       to the events that it should capture.

//       Should be able to get rid of the keyboard event emitter and have the parent handle it?
//         What about root menu?
//         Perhaps the handler should listen to child close events and pass them
//         up the chain?
//         What about nested menu items and clicking right in a submenu?

//       The other issue is handlnig tab events - an item losing focus should pass info up to it's
//       parent? The existing implementation doesn't have a specific tab handler.

//       Note that the default mat-menu does not go to the next grouped menu item - therefore
//       we may need to pass up the keyboard event to the parent in order to achieve this.

//       By sharing the open/closed signals between the siblings, we can close them out.
//       Another approach is to listen to events on the parent menu and subscrbe to them
//       in the button and close when things happen in the parent.

//       Make _keyboardEventEmitter package private. Need it in order to pass a right/left
//       mouse move to the root menu bar

//       We need the following functions:
//         _leftRight
//         _upDown
//         _activate
//         _homeEnd ?

//         Everything else should be passed up.
//         Then based on the layout we either open/close
//         or pass up the event (return false)
//    */
//   keydown(event: KeyboardEvent) {
//     const {keyCode} = event; // TODO don't use keyCode
//     switch (keyCode) {
//       case SPACE:
//       case ENTER:
//         event.preventDefault();
//         if (this._keyManager.activeItem.hasSubmenu()) {
//           this._openSubMenu();
//         } else {
//           if (this._keyManager.activeItem.role === 'menuitem') {
//             this.tabEventEmitter.next();
//           }
//         }
//         break;
//       case LEFT_ARROW:
//         // TODO if top level menu, toggle to next
//         this.keyboardEventEmitter.next(event);
//         break;
//       case RIGHT_ARROW:
//         if (this._keyManager.activeItem.hasSubmenu()) {
//           this._openSubMenu();
//         } else {
//           this.keyboardEventEmitter.next(event);
//         }
//         break;
//       case ESCAPE:
//         this.closeEventEmitter.next();
//         break;
//       case TAB:
//         // closed event emitter using 'tab' as the event type
//         // or say we can't handle it, pass up to the root menu bar
//         // and have the menu bar send a close signal to all children.
//         // skip TAB case
//         this.tabEventEmitter.next();
//         break;
//       default:
//         this._keyManager.onKeydown(event);
//     }
//   }

//   private _openSubMenu() {
//     this._keyManager.activeItem.onClick();

//     this._keyManager.activeItem.tabEventEmitter.subscribe(() => {
//       this.tabEventEmitter.next();
//     });

//     if (this._keyManager.activeItem._menuPanel._menu) {
//       this._keyManager.activeItem._menuPanel._menu.focusFirstChild();
//     }
//   }
// }

// export class MenuBarKeyManager extends MenuKeyManager {
//   constructor(children: QueryList<MenuButtonDirective>) {
//     super(children);
//     this._keyManager = this._keyManager.withHorizontalOrientation('ltr');
//   }

//   keydown(event: KeyboardEvent) {
//     const {keyCode} = event;

//     switch (keyCode) {
//       case DOWN_ARROW:
//       case UP_ARROW:
//         event.preventDefault();
//         if (this._keyManager.activeItem.isMenuOpen()) {
//           if (this._keyManager.activeItem._menuPanel) {
//             keyCode === DOWN_ARROW
//               ? this._keyManager.activeItem._menuPanel._menu.focusFirstChild()
//               : this._keyManager.activeItem._menuPanel._menu.focusLastChild();
//           }
//         } else {
//           this._keyManager.activeItem.onClick();
//           keyCode === DOWN_ARROW
//             ? this._keyManager.activeItem._menuPanel._menu.focusFirstChild()
//             : this._keyManager.activeItem._menuPanel._menu.focusLastChild();
//         }
//         break;
//       case ENTER:
//       case SPACE:
//         event.preventDefault();
//         this._keyManager.activeItem.onClick();
//         if (this._keyManager.activeItem._menuPanel) {
//           this._keyManager.activeItem._menuPanel.focusFirstChild();
//         }
//         break;

//       case LEFT_ARROW:
//       case RIGHT_ARROW:
//         const prev = this._keyManager.activeItem;
//         this._keyManager.onKeydown(event);
//         if (prev.isMenuOpen()) {
//           prev.closeMenu();
//           this._keyManager.activeItem.onClick();
//         }

//         break;
//       case ESCAPE:
//         if (this._keyManager.activeItem.isMenuOpen()) {
//           this._keyManager.activeItem.closeMenu();
//         }
//         break;

//       default:
//         this._keyManager.onKeydown(event);
//     }
//   }
// }
