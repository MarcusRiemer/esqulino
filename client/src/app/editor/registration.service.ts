import {Injectable, Type}            from '@angular/core'

import {Observable}                  from 'rxjs/Observable'
import {ReplaySubject}               from 'rxjs/ReplaySubject'

/**
 * Allows to register a sidebar component
 */
export interface SidebarType {
    typeId : string,
    componentType : Type<any>
}

/**
 * Allows sub-modules to register code that needs to be run once
 * the editor has started. This is usually done to register types
 * with the sidebar or similar services.
 */
@Injectable()
export class RegistrationService {

    // These types are waiting to be registered
    private _sidebarTypes : ReplaySubject<SidebarType>;

    constructor() {
        this._sidebarTypes = new ReplaySubject<SidebarType>();
    }

    /**
     * Registers a new sidebar.
     */
    registerSidebarType(reg : SidebarType) {
        console.log(`Registered sidebar with id "${reg.typeId}"`);
        
        this._sidebarTypes.next(reg);
    }

    /**
     * @return All available sidebar types, no matter when they
     *         were registered.
     */
    get sidebarTypes() : Observable<SidebarType> {
        return (this._sidebarTypes);
    }

}
