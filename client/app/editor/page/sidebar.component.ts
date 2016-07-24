import {Component, OnInit, OnDestroy}   from '@angular/core'
import {ActivatedRoute, Router}         from '@angular/router'

import {Query}                          from '../../shared/query'
import {
    Page, QueryReference
} from '../../shared/page/index'
import {
    Heading, Row, Paragraph, QueryTable
} from '../../shared/page/widgets/index'

import {
    ProjectService, Project
} from '../project.service'

import {DragService}                    from './drag.service'

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
     * Informs the drag service about a started drag operation for an
     * empty row.
     */
    startRowDrag(evt : DragEvent) {
        this._dragService.startRowDrag(evt, "sidebar", Row.emptyDescription);
    }

     /**
      * Starts a drag action for a paragraph.
      */
    startParagraphDrag(evt : DragEvent) {
        this._dragService.startWidgetDrag(evt, "sidebar", Paragraph.emptyDescription);
    }

    /**
      * Starts a drag action for a Heading.
      */
    startHeadingDrag(evt : DragEvent) {
        this._dragService.startWidgetDrag(evt, "sidebar", Heading.emptyDescription);
    }

    /**
     * Starts a drag action for a query table.
      */
    startQueryTableDrag(evt : DragEvent) {
        this._dragService.startWidgetDrag(evt, "sidebar", QueryTable.emptyDescription);
    }

    /**
     * Informs the drag service about a started drag operation for a
     * query reference
     */
    startReferencedQueryDrag(evt : DragEvent, ref : QueryReference) {
        this._dragService.startQueryRefDrag(evt, "sidebar", ref.toModel());
    }

    /**
     * @return All queries that are actually used on this page.
     */
    get referencedQueries() : QueryReference[] {
        if (this._page) {
            return (this._page.referencedQueries);
        } else {
            return ([]);
        }
    }
}

/**
 * This ID is used to register this sidebar with the sidebar loader
 */
export const SIDEBAR_IDENTIFIER = "page";
