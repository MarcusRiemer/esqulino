import {
    Component, OnInit, OnDestroy, Inject
} from '@angular/core'
import {ActivatedRoute, Router}         from '@angular/router'

import {SIDEBAR_MODEL_TOKEN}            from '../editor.token'
import {borderCssClass}                 from '../shared/page-preview.util'

import {Page, ParameterMapping}         from '../../shared/page/index'
import {
    Heading, Row, Paragraph, QueryTable,
    Input, Button, EmbeddedHtml, Form, Link, Column
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
    templateUrl: 'app/editor/page/templates/sidebar-widgets.html',
    selector : "page-sidebar-widgets",
})
export class SidebarWidgetsComponent implements OnDestroy {
    /**
     * This ID is used to register this sidebar with the sidebar loader
     */
    public static get SIDEBAR_IDENTIFIER() { return "page-core-widgets" };

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
        @Inject(SIDEBAR_MODEL_TOKEN) page : Page,
        private _dragService : DragService,
        private _projectService : ProjectService,
        private _routeParams : ActivatedRoute,
        private _router : Router) {
        this._page = page;
        this._project = page.project;
    }

    /**
     * Freeing all subscriptions
     */
    ngOnDestroy() {
        this._subscriptionRefs.forEach( ref => ref.unsubscribe() );
        this._subscriptionRefs = [];
    }

    borderCssClass(category : any) : string {
        return (borderCssClass(category));
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
     * Informs the drag service about a started drag operation for an
     * empty row.
     */
    startRowDrag(evt : DragEvent) {
        this._dragService.startWidgetDrag(evt, "sidebar", Row.emptyDescription);
    }

    /**
     * Informs the drag service about a started drag operation for an
     * empty column.
     */
    startColumnDrag(evt : DragEvent) {
        this._dragService.startWidgetDrag(evt, "sidebar", Column.emptyDescription);
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
     * Starts a drag action for an input element
     */
    startInputDrag(evt : DragEvent) {
        this._dragService.startWidgetDrag(evt, "sidebar", Input.emptyDescription);
    }

    /**
     * Starts a drag action for a button element
     */
    startButtonDrag(evt : DragEvent) {
        this._dragService.startWidgetDrag(evt, "sidebar", Button.emptyDescription);
    }

    /**
     * Starts a drag action for an empty HTML element
     */
    startFormDrag(evt : DragEvent) {
        this._dragService.startWidgetDrag(evt, "sidebar", Form.emptyDescription);
    }

    /**
     * Starts a drag action for an empty HTML element
     */
    startEmbeddedHtmlDrag(evt : DragEvent) {
        this._dragService.startWidgetDrag(evt, "sidebar", EmbeddedHtml.emptyDescription);
    }

    /**
     * Starts a drag action for an link element
     */
    startLinkDrag(evt : DragEvent) {
        this._dragService.startWidgetDrag(evt, "sidebar", Link.emptyDescription);
    }
}
