import {
    Component, DynamicComponentLoader, Injector, OnInit
} from '@angular/core'
import {
    Router, RouteSegment, UrlTree
} from '@angular/router'

import * as Query from './query/sidebar.component'
import * as Page from './page/sidebar.component'

/**
 * Checks whether the currently active route should display a
 * sidebar or not.
 *
 * @param router The global router instance
 * @param segment A router segment from the editor
 */
export function sidebarType(router : Router, routeSegment : RouteSegment) {
    // Careful, magic strings ahead! These values depend on the
    // chosen URL segments for the respective editors.
    const queryTree = router.createUrlTree(['query'], routeSegment);
    const pageTree = router.createUrlTree(['page'], routeSegment);
    
    if (router.urlTree.contains(queryTree)) {
        return ("query");
    } else if (router.urlTree.contains(pageTree)) {
        return ("page");
    } else {
        return ("none");
    }
}

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
        return (sidebarType(this._router, this._routeSegment));
    }
}
