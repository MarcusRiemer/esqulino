import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { MayPerformRequestDescription } from "../shared/authorisation/may-perform.description";

/**
 * Used to subscribe to click events.
 */
export type ClickHandler = Observable<void>;

/**
 * Represents a button on the toolbar. These items may be "native",
 * which means they are defined by the toolbar itself and not removed
 * upon resetting the toolbar.
 */
export class ToolbarItem {
  private _inProgress: boolean = false;

  private _onClick: Subject<void>;

  /**
   * @param caption The text to display on the button
   * @param icon    The icon to show on the button
   * @param key     The key this item should be bound to
   * @param native  True, if this is a native item of the toolbar
   */
  constructor(
    private _id: string,
    private _caption: string,
    private _icon: string,
    private _key: string | undefined,
    private _native: boolean,
    private _mayPerform: MayPerformRequestDescription = undefined
  ) {
    if (_key) {
      this._key = _key.toLowerCase();
    }

    this._onClick = new Subject<void>();
  }

  /**
   * @return True, if this is a native item.
   */
  get isNative() {
    return this._native;
  }

  /**
   * @return The keyboard shortcut this item listens to
   */
  get key() {
    return this._key;
  }

  /**
   * @return The ID that is associated with this item
   */
  get id() {
    return this._id;
  }

  /**
   * @return The name of the icon that should be used
   */
  get icon() {
    return this._icon;
  }

  get caption() {
    return this._caption;
  }

  set caption(value: string) {
    this._caption = value;
  }

  /**
   * @param inProgress True, if a reaction to this is in progress
   */
  set isInProgress(inProgress: boolean) {
    this._inProgress = inProgress;
  }

  set performDesc(desc: MayPerformRequestDescription) {
    this._mayPerform = desc;
  }

  /**
   * @return True, if a reaction to this is in progress
   */
  get isInProgress() {
    return this._inProgress;
  }

  get performDesc() {
    return this._mayPerform;
  }

  /**
   * Emits the click event.
   */
  fire() {
    this._onClick.next();
  }

  /**
   * Allows reacting to clicks.
   */
  get onClick(): ClickHandler {
    return this._onClick;
  }
}

/**
 * Allows to adress the toolbar from any component.
 */
@Injectable()
export class EditorToolbarService {
  // All items on the toolbar
  private _items: ToolbarItem[] = [];

  // Shortcut to the well known "Save" items which may be used
  // by multiple components.
  private _saveItem: ToolbarItem;

  constructor() {
    // Globally registering keypresses
    if (window) {
      window.addEventListener("keydown", (evt) => {
        // Possibly intercept control keys
        if (evt.ctrlKey) {
          let item = this._items.find((i) => i.key == evt.key);
          if (item) {
            evt.preventDefault();
            item.fire();
          }
        }
      });
    }
  }

  /**
   * Other components may add new special purpose buttons.
   *
   * @param caption The text to display on the button
   * @param icon    The icon to show on the button
   * @param key     The keyboard shortcut character
   *
   * @return The click handler for the new button
   */
  addButton(
    id: string,
    caption: string,
    icon: string,
    key?: string,
    performDesc: MayPerformRequestDescription = undefined
  ): ToolbarItem {
    // Create a new non-native icon
    let item = new ToolbarItem(id, caption, icon, key, false, performDesc);

    // Show the item on the toolbar
    this._items.push(item);

    return item;
  }

  /**
   * Removes something that has been added before.
   */
  removeItem(id: string): boolean {
    const index = this._items.findIndex((item) => item.id == id);
    if (index >= 0) {
      this._items.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Removes any non-native items from the toolbar and resets
   * the state of any known button.
   */
  resetItems() {
    this._saveItem = new ToolbarItem(
      "save",
      "Speichern",
      "floppy-o",
      "s",
      true
    );
    this._items = [this._saveItem];
  }

  /**
   * @return True, if the saving button is currently enabled.
   */
  get savingEnabled() {
    return this._items.indexOf(this._saveItem) >= 0;
  }

  /**
   * @param enabled Allow or disallow saving
   */
  set savingEnabled(enabled: boolean) {
    // Cache result of computation
    const savingEnabled = this.savingEnabled;

    if (enabled && !savingEnabled) {
      // Enabling saving while it is not currently enabled
      this._items.push(this._saveItem);
    } else if (!enabled && savingEnabled) {
      // Disabling saving while it is currently enabled
      this._items.splice(this._items.indexOf(this._saveItem), 1);
    }
  }

  /**
   * @return All items that should be displayed on the toolbar.
   */
  get items() {
    return this._items;
  }

  /**
   * @return The save item, that may always be present on the toolbar.
   */
  get saveItem(): ToolbarItem {
    return this._saveItem;
  }
}
