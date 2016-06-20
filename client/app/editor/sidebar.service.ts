import {Injectable, Type}            from '@angular/core'

import {BehaviorSubject}             from 'rxjs/BehaviorSubject'
import {Observable}                  from 'rxjs/Observable'


import * as Query                   from './query/sidebar.component'
import * as Page                    from './page/sidebar.component'

/**
 * Manages the global state of the sidebar.
 */
@Injectable()
export class SidebarService {
    private _sidebar : BehaviorSubject<string>;

    /**
     * Valid types for sidebars.
     * TODO: Allow different sidebars to somehow register themself.
     */
    private _knownTypes : { [typeName:string] : Type} = { };

    constructor() {
        this._sidebar = new BehaviorSubject<string>(undefined);

        const pageId = Page.SidebarComponent.SIDEBAR_IDENTIFIER;
        const queryId = Query.SidebarComponent.SIDEBAR_IDENTIFIER;

        this.registerType(pageId, Page.SidebarComponent);
        this.registerType(queryId, Query.SidebarComponent);
    }

    /**
     * Hides the currently shown sidebar.
     */
    hideSidebar() {
        this._sidebar.next(undefined);
    }

    /**
     * Registers a new type of sidebar that is ready for use.
     *
     * @param newType The string ID that is used to request this type.
     * @param component The component constructr that should be used.
     */
    registerType(newType : string, componentType : Type) {
        if (this.isValidType(newType)) {
            throw new Error(`Attempted to override sidebar type "${newType}"`);
        }

        this._knownTypes[newType] = componentType;        
    }

    /**
     * @return True, if the given type could be shown by the sidebar.
     */
    isValidType(newType : string) : boolean {
        return (!!this._knownTypes[newType]);
    }

    /**
     * @return The component type for the given identifier.
     */
    getComponentType(newType : string) : Type {
        return (this._knownTypes[newType]);
    }

    /**
     * Triggers showing a different sidebar.
     * 
     * @newType The new type of sidebar to show. This is a string, but
     *          the identifier should be retrieved using the 
     *          SIDEBAR_IDENTIFIER property of the Sidebar Component you
     *          are using.
     */
    showSidebar(newType : string) {
        if (!this.isValidType(newType)) {
            throw new Error(`Unknown sidebar type: ${newType}`);
        }

        this._sidebar.next(newType);
    }

    /**
     * @return An observable that raises events when
     *         the visibilit changes.
     */
    get isSidebarVisible() : Observable<boolean> {
        return (this._sidebar.map(s => !!s));
    }

    /**
     * @return An observable for the current type of the sidebar
     */
    get sidebarType() : Observable<string> {
        return (this._sidebar);
    }
}
