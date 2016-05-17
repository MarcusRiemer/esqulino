import {
    Component, DynamicComponentLoader, Injector, OnInit
} from '@angular/core'
import {
    Router, RouteSegment, UrlTree
} from '@angular/router'

import * as Query from './query/sidebar.component'
import * as Page from './page/sidebar.component'

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
        private _router: Router,
        private _routeSegment: RouteSegment
    ) {
    }

    /**
     * @return True, if the sidebar placeholder knows which sidebar to render.
     */
    get isVisible() {
        return (this.sidebarType != "none");
    }

    get sidebarType() {
        // Careful magic strings ahead! These values depend on the
        // chosen URL segments for the respective editors.
        const queryTree = this._router.createUrlTree(['query'], this._routeSegment);
        const pageTree = this._router.createUrlTree(['page'], this._routeSegment);
        
        if (this._router.urlTree.contains(queryTree)) {
            return ("query");
        } else if (this._router.urlTree.contains(pageTree)) {
            return ("page");
        } else {
            return ("none");
        }
    }
}
