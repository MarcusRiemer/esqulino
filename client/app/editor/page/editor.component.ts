import {Component, Input, OnInit}       from '@angular/core'
import {Router, RouteSegment}           from '@angular/router'

import {Observable}                     from 'rxjs/Observable'

import {Page}                           from '../../shared/page/page'

import {Project}                        from '../project'
import {ProjectService}                 from '../project.service'
import {QueryService}                   from '../query.service'
import {ToolbarService}                 from '../toolbar.service'


/**
 * Top level component to edit esqulino pages
 */
@Component({
    templateUrl: 'app/editor/page/templates/editor.html',
    directives: [],
    providers: [],
    pipes: []
})
export class PageEditorComponent implements OnInit {
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
        private _queryService : QueryService,
        private _toolbarService: ToolbarService,
        private _routeParams: RouteSegment
    ) {
    }

    /**
     * Load the project to access the schema and its pages.
     */
    ngOnInit() {
        this._toolbarService.resetItems();

        // Grab the correct project and query
        var pageId = this._routeParams.getParam('pageId');
        this._projectService.activeProject
            .subscribe(res => {
                if (res) {
                    // Project is loaded, display the correct page to edit
                    this._project = res;
                    this._page = this._project.getPageById(pageId);
                }
            });
    }

    get project() {
        return (this._project);
    }

    get page() {
        return (this._page);
    }
}

