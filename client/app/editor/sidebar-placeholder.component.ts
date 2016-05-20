import {Component}           from '@angular/core'

import {SidebarService}      from './sidebar.service'

import * as Query from './query/sidebar.component'
import * as Page  from './page/sidebar.component'

/**
 * Shows the correct type of sidebar depending on the URL
 */
@Component({
    selector: 'sidebar-placeholder',
    templateUrl: 'app/editor/templates/sidebar-placeholder.html',
    directives: [Query.SidebarComponent, Page.SidebarComponent]
})
export class SidebarPlaceholderComponent {
    constructor(
        private _sidebarService : SidebarService
    ) {
    }

    get sidebarType() {
        return (this._sidebarService.sidebarType);
    }
}
