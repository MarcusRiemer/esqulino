import {Component, OnInit, OnDestroy}   from '@angular/core'
import {ActivatedRoute, Router}         from '@angular/router'

import {Query, ResultColumn}            from '../../shared/query'
import {
    Page, QueryReference, ParameterMapping
} from '../../shared/page/index'
import {
    Heading, Row, Paragraph, QueryTable, Input, Button, EmbeddedHtml, Link
} from '../../shared/page/widgets/index'

import {
    ProjectService, Project
} from '../project.service'

import {DragService, PageDragEvent}     from './drag.service'

/**
 * The sidebar hosts elements that can be dragged onto the currently active
 * page. Additionally it sometimes offers a "trashcan" where items can be
 * dropped if they are meant to be deleted.
 */
@Component({
    templateUrl: 'app/editor/page/templates/sidebar-data.html',
    selector : "page-sidebar"
})
export class SidebarDataComponent implements OnInit, OnDestroy {
    /**
     * This ID is used to register this sidebar with the sidebar loader
     */
    public static get SIDEBAR_IDENTIFIER() { return "page-core-data" };

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
     * Something is beeing dragged over a parameter
     */
    onParameterDrag(evt : DragEvent) {
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        if (pageEvt.parameterValueProvider) {
            evt.preventDefault();
        }
    }

    /**
     * Something is beeing dragged over a parameter
     */
    onParameterDrop(evt : DragEvent, param : ParameterMapping) {
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        if (pageEvt.parameterValueProvider) {
            evt.preventDefault();

            param.providingName = pageEvt.parameterValueProvider;

            if (this._dragService.currentDrag.callbacks.onParameterMapping) {
                this._dragService.currentDrag.callbacks.onParameterMapping(param);
            }
        }
    }

    /**
     * Starts a drag action for a column reference.
     */
    startColumnDrag(evt : DragEvent,
                    queryRef : QueryReference,
                    column : ResultColumn) {
        this._dragService.startColumnRefDrag(evt, "sidebar", {
            columnName: column.shortName,
            queryName : queryRef.name
        });
    }

    /**
     * Informs the drag service about a started drag operation for a
     * query reference
     */
    startReferencedQueryDrag(evt : DragEvent, ref : QueryReference) {
        this._dragService.startQueryRefDrag(evt, "sidebar", ref.toModel());
    }

    startParameterValueProviderDrag(evt : DragEvent, valueProviderName : string) {
        this._dragService.startValueDrag(evt, "sidebar", valueProviderName);
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

    /**
     * Columns are tracked by their full name
     */
    trackByColumnId(index : number, columnRef : ResultColumn) {
        return (columnRef.fullName);
    }

    /**
     * @return True, if page request parameters should be shown
     */
    get showPageRequestParameters() {
        return (this.page && this._page.requestParameters.length > 0);
    }
}

