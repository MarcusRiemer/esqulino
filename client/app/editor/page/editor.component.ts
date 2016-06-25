import {Component, OnInit, OnDestroy}   from '@angular/core'
import {Router, ActivatedRoute}         from '@angular/router'

import {Observable}                     from 'rxjs/Observable'

import {Page}                           from '../../shared/page/index'
import {Paragraph}                      from '../../shared/page/widgets/index'

import {Project}                        from '../project'
import {ProjectService}                 from '../project.service'
import {QueryService}                   from '../query.service'
import {SidebarService}                 from '../sidebar.service'
import {ToolbarService}                 from '../toolbar.service'

import {WidgetLoaderComponent}          from './widget-loader.component'
import {SidebarComponent}               from './sidebar.component'

/**
 * Top level component to edit esqulino pages
 */
@Component({
    templateUrl: 'app/editor/page/templates/editor.html',
    directives: [WidgetLoaderComponent],
    providers: [],
    pipes: []
})
export class PageEditorComponent implements OnInit, OnDestroy {
    /**
     * The currently edited project
     */
    private _project : Project;

    /**
     * The currently edited page
     */
    private _page : Page;

    private _routeRef : any;

    constructor(
        private _projectService : ProjectService,
        private _queryService : QueryService,
        private _toolbarService: ToolbarService,
        private _routeParams: ActivatedRoute,
        private _sidebarService : SidebarService
    ) {
        this._sidebarService.showSidebar(SidebarComponent.SIDEBAR_IDENTIFIER);
    }

    /**
     * Load the project to access the schema and its pages.
     */
    ngOnInit() {
        this._toolbarService.resetItems();
        this._toolbarService.savingEnabled = false;

        // Grab the correct project and query
        this._routeParams.params.subscribe(params => {
            var pageId = params['pageId'];
            this._projectService.activeProject
                .subscribe(res => {
                    // Project is loaded, display the correct page to edit
                    this._project = res;
                    this._page = this._project.getPageById(pageId);
                });
        })
    }

    /**
     * Subscriptions need to be explicitly released
     */
    ngOnDestroy() {
        this._routeRef.unsubscribe();
    }

    /*
     * @return The currently edited project
     */
    get project() {
        return (this._project);
    }

    /*
     * @return The currently edited page
     */
    get page() {
        return (this._page);
    }

    onSave() {
        
    }
}

