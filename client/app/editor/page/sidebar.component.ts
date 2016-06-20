import {Component, Input, OnInit}       from '@angular/core'
import {RouteSegment, Router}           from '@angular/router'

import {Query}                          from '../../shared/query'
import {Page}                           from '../../shared/page/index'

import {Project}                        from '../project'
import {ProjectService}                 from '../project.service'

/**
 * Used in UI to determine whether a query is referenced from this
 * page or not.
 */
interface UsableQuery {
    query : Query
    used : boolean
}

/**
 * The sidebar hosts elements that can be dragged onto the currently active
 * page. Additionally it sometimes offers a "trashcan" where items can be
 * dropped if they are meant to be deleted.
 */
@Component({
    templateUrl: 'app/editor/page/templates/sidebar.html',
    selector : "page-sidebar",
})
export class SidebarComponent implements OnInit {
    /**
     * This ID is used to register this sidebar with the sidebar loader
     */
    public static get SIDEBAR_IDENTIFIER() { return "page" };
    
    /**
     * The currently edited project
     */
    private _project : Project;

    /**
     * The currently edited page
     */
    private _page : Page;

    constructor(
        private _projectService : ProjectService,        
        private _routeParams : RouteSegment,
        private _router : Router) {

        this._router.changes.subscribe( () => {
            this.updateCache();
        });
    }

    /**
     * Load the project to access the schema and its pages.
     */
    ngOnInit() {
        // Once initially and every time the URL changes
        this.updateCache();
    }

    get page() {
        return (this._page);
    }

    updateCache() {
        // Grab the current project
        this._projectService.activeProject
            .first() // One shot subscription
            .subscribe(p => {
                this._project = p;
                
                // Grab the correct query id
                const childRoute = this._router.routeTree.firstChild(this._routeParams);
                const pageId = childRoute.getParam('pageId');
                
                // Project is loaded, display the correct  query
                this._page = this._project.getPageById(pageId);
            });
    }

    
    /**
     * @return All queries that could be possibly used on this page.
     */
    get queries() : UsableQuery[] {
        if (this._page) {
            return (this._project.queries.map(q => {
                return ({
                    query : q,
                    used : this._page.isUsingQuery(q.id)
                });
            }));
        } else {
            return ([]);
        }
    }
}

/**
 * This ID is used to register this sidebar with the sidebar loader
 */
export const SIDEBAR_IDENTIFIER = "page";
