import {Component, Input}                 from '@angular/core'

import {SidebarService}                   from '../sidebar.service'

/**
 * Wrapper around something that is displayed in the sidebar.
 */
@Component({
    selector: 'sidebar-item-host',
    templateUrl: 'templates/sidebar-item-host.html'
})
export class SidebarItemHost {
    /**
     * A header text to display for this item
     */
    @Input() header : string

    /**
     * The unique ID of this sidebar
     */
    @Input() sidebarInstanceId : number

    /**
     * True, if a "close" button should be shown.
     */
    @Input() showClose : boolean = false;

    /**
     * Additional classes to show for the `card` element
     */
    @Input() cardClasses : string = "";

    constructor(private _sidebarService : SidebarService = undefined) {

    }

    /**
     * Closes this sidebar-item.
     */
    doClose() {
        if (this._sidebarService) {
            this._sidebarService.hideById(this.sidebarInstanceId);
        }
    }
}
