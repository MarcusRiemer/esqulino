import {Component, Input}                 from '@angular/core'

import {SidebarService}                   from '../sidebar.service'

/**
 * Wrapper around something that is displayed in the sidebar.
 */
@Component({
    selector: 'sidebar-item-host',
    templateUrl: 'app/editor/templates/sidebar-item-host.html'
})
export class SidebarItemHost {
    @Input() header : string

    @Input() sidebarId : number

    @Input() showClose : boolean = false;

    constructor() {

    }

    /**
     * Closes this sidebar-item.
     */
    doClose() {
        //this._sidebarService.hideById(this.sidebarId);
    }
}
