import {Injectable, ApplicationRef} from '@angular/core'
import {Router}                     from '@angular/router'

import {Observable}                 from 'rxjs/Observable'
import {BehaviorSubject}            from 'rxjs/BehaviorSubject'

@Injectable()
export class SidebarService {
    private _sidebar : string;

    constructor(
        private _router : Router,
        private _appRef : ApplicationRef
    ) {
        // Usual case: There is no sidebar
        this._sidebar = undefined; //new BehaviorSubject<string>(undefined);

        // Hide the sidebar on every URL change
        // this._router.changes.subscribe(() => this.hideSidebar());
    }

    hideSidebar() {
        this._sidebar = undefined;
        //this._appRef.tick();
    }

    showSidebar(newType : string) {
        if (["page", "query"].indexOf(newType) < 0) {
            throw new Error(`Unknown sidebar type: ${newType}`);
        }
        
        this._sidebar = newType;

        // this._appRef.tick();
    }

    /**
     * @return True, if the sidebar should be visible
     */
    get isSidebarVisible() : boolean {
        return (!!this._sidebar);
    }

    get sidebarType() : string {
        return (this._sidebar);
    }
}
