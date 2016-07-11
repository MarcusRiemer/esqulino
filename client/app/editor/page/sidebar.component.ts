import {Component, OnInit, OnDestroy}   from '@angular/core'
import {ActivatedRoute, Router}         from '@angular/router'

import {Query}                          from '../../shared/query'
import {Page}                           from '../../shared/page/index'

import {Project}                        from '../project'
import {ProjectService}                 from '../project.service'

import {DragService}                    from './drag.service'

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
export class SidebarComponent implements OnInit, OnDestroy {
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

    /**
     * Subscriptions that need to be released
     */
    private _subscriptionRefs : any[] = [];

    constructor(
        private _dragService : DragService,
        private _projectService : ProjectService,        
        private _routeParams : ActivatedRoute,
        private _router : Router) {
    }

    /**
     * Load the project to access the schema and its pages.
     */
    ngOnInit() {
        // Once initially and every time the URL changes
        this.refreshViewState();
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach( ref => ref.unsubscribe() );
        this._subscriptionRefs = [];
    }

    /**
     * View Variable: The currently edited page
     */
    get page() {
        return (this._page);
    }

    startRowDrag(evt : DragEvent) {
        this._dragService.startRowDrag("sidebar", evt);
    }

    private refreshViewState() {
        // Grab the current project
        this._projectService.activeProject
            .first() // One shot subscription
            .subscribe(p => {
                this._project = p;
                
                // Grab the correct query id
                const childRoute = this._router.routerState.firstChild(this._routeParams);

                const routeRef = childRoute.params.subscribe(param => {
                    const pageId = param['pageId'];
                
                    // Project is loaded, display the correct  query
                    this._page = this._project.getPageById(pageId);
                });
                
                this._subscriptionRefs.push(routeRef);
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
