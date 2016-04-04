import 'rxjs/Rx'

import {Injectable}             from 'angular2/core'

import {Observable}             from 'rxjs/Observable'
import {Subject}                from 'rxjs/Subject'

/**
 * Used to subscribe to click events.
 */
export type ClickHandler = Observable<string>;

/**
 * Represents a button on the toolbar. These items may be "native",
 * which means they are defined by the toolbar itself and not removed
 * upon resetting the toolbar.
 */
export class ToolbarItem {
    private _caption : string;
    private _icon : string;
    private _native : boolean;
    private _inProgress : boolean = false;
    
    private _onClick : Subject<string>;

    /**
     * @param caption The text to display on the button
     * @param icon    The icon to show on the button
     * @param native  True, if this is a native item of the toolbar
     */
    constructor(caption : string, icon : string, native : boolean) {
        this._caption = caption;
        this._icon = icon;
        this._native = native;

        this._onClick = new Subject();
    }

    /**
     * @return True, if this is a native item.
     */  
    get isNative() {
        return (this._native);
    }

    /**
     * @param inProgress True, if a reaction to this is in progress
     */
    set isInProgress(inProgress : boolean) {
        this._inProgress = inProgress;
    }

    /**
     * @return True, if a reaction to this is in progress
     */
    get isInProgress() {
        return (this._inProgress);
    }

    /**
     * Emits the click event.
     */
    fire() {
        this._onClick.next("");
    }

    /**
     * Allows reacting to clicks.
     */
    get onClick() : ClickHandler {
        return (this._onClick);
    }
}

/**
 * Allows to adress the toolbar from any component.
 */
@Injectable()
export class ToolbarService {
    // All items on the toolbar
    private _items : ToolbarItem[] = [];

    // Shortcut to the well known "Save" items which may be used
    // by multiple components.
    private _saveItem = new ToolbarItem("Speichern", "floppy-o", true);

    /**
     * Other components may add new special purpose buttons.
     *
     * @param caption The text to display on the button
     * @param icon    The icon to show on the button
     *
     * @return The click handler for the new button
     */
    addButton(caption : string, icon : string) : ToolbarItem {
        // Create a new non-native icon
        let item = new ToolbarItem(caption, icon, false);

        // Show the item on the toolbar
        this._items.push(item);

        return (item);
    }

    /**
     * Removes any non-native items from the toolbar.
     */
    resetItems() {
        this._items = this._items.filter(val => val.isNative);
    }
    
    /**
     * @return True, if the saving button is currently enabled.
     */
    get savingEnabled() {
        return (this._items.indexOf(this._saveItem) >= 0);
    }

    /**
     * @param enabled Allow or disallow saving
     */
    set savingEnabled(enabled : boolean) {
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
        return (this._items);
    }

    /**
     * @return The save item, that may always be present on the toolbar.
     */
    get saveItem() : ToolbarItem {
        return (this._saveItem);
    }
}
