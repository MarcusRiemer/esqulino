import {Component, OnInit, OnDestroy}   from '@angular/core'
import {ActivatedRoute, Router}         from '@angular/router'

import {Query}                          from '../../shared/query'
import {Page}                           from '../../shared/page/index'
import {Row}                            from '../../shared/page/widgets/index'

import {Project}                        from '../project'
import {ProjectService}                 from '../project.service'

import {DragService}                    from './drag.service'

/**
 * Used in UI to determine whether a query is referenced from this
 * page or not.
 */
interface UsableQuery {
    query : Query
    name? : string
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
        // Grab the current project
        this._projectService.activeProject
            .first()
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
     * Freeing all subscriptions
     */
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

    /**
     * Something has been dragged over the trash
     */
    onTrashDrag(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();
    }

    /**
     * Something has been dropped in the trash
     */
    onTrashDrop(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();
        
        if (this._dragService.currentDrag.callbacks &&
            this._dragService.currentDrag.callbacks.onRemove) {
            this._dragService.currentDrag.callbacks.onRemove();
        }
    }

    /**
     * View Variabe: True, if the trash shouldn't be shown. This
     *               inversion is useful to bind to the `hidden`
     *               DOM property.
     */
    get hideTrash() {
        return (!(this._dragService.activeOrigin == "page"));
    }

    /**
     * Informs the drag service about a started drag operation.
     */
    startRowDrag(evt : DragEvent) {
        this._dragService.startRowDrag(evt, "sidebar", Row.emptyDescription);
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

    /**
     * @return All queries that are actually used on this page.
     */
    get usedQueries() : UsableQuery[] {
        return (this.page.referencedQueries.map(ref => {
            return ({
                query : this._project.getQueryById(ref.queryId),
                name : ref.name,
                used : true
            })
        }));
    }
}

/**
 * This ID is used to register this sidebar with the sidebar loader
 */
export const SIDEBAR_IDENTIFIER = "page";
