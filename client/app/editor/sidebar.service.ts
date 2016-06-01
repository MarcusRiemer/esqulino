import {Injectable, Type}            from '@angular/core'

import {BehaviorSubject}             from 'rxjs/BehaviorSubject'
import {Observable}                  from 'rxjs/Observable'


import * as Query from './query/sidebar.component'
import * as Page  from './page/sidebar.component'
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
    private _knownTypes : { [typeName:string] : Type} = {
        "page" : Page.SidebarComponent,
        "query" : Query.SidebarComponent
    };

    constructor() {
        this._sidebar = new BehaviorSubject<string>(undefined);
    }

    /**
     * Hides the currently shown sidebar.
     */
    hideSidebar() {
        this._sidebar.next(undefined);
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
     * @newType The new type of sidebar to show.
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
