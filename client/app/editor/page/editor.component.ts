import {Component, OnInit, OnDestroy}   from '@angular/core'
import {Router, ActivatedRoute}         from '@angular/router'

import {Observable}                     from 'rxjs/Observable'

import {Page}                           from '../../shared/page/index'
import {Paragraph}                      from '../../shared/page/widgets/index'

import {Project}                        from '../project'
import {ProjectService}                 from '../project.service'
import {PageService}                    from '../page.service'
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

    /**
     * Subscriptions that need to be released
     */
    private _subscriptionRefs : any[] = [];

    private _renderPreview : string;


    constructor(
        private _projectService : ProjectService,
        private _pageService : PageService,
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

        // Grab the correct project and query
        let subRef = this._routeParams.params.subscribe(params => {
            var pageId = params['pageId'];
            this._projectService.activeProject
                .subscribe(res => {
                    // Project is loaded, display the correct page to edit
                    this._project = res;
                    this._page = this._project.getPageById(pageId);
                });
        })

        this._subscriptionRefs.push(subRef);

        // Reacting to saving
        this._toolbarService.savingEnabled = true;
        let btnSave = this._toolbarService.saveItem;

        subRef = btnSave.onClick.subscribe( (res) => {
            btnSave.isInProgress = true;
            this._pageService.savePage(this.project, this._page)
            // Always delay visual feedback by 500ms
                .delay(500)
                .subscribe(res => btnSave.isInProgress = false);
        });

        this._subscriptionRefs.push(subRef)

        // Reacting to rendering
        let btnRender = this._toolbarService.addButton("render", "Vorschau", "search", "r");
        subRef = btnRender.onClick.subscribe( (res) => {
            btnRender.isInProgress = true;
            this._pageService.renderPage(this.project, this.page)
                .subscribe(res => {
                    this._renderPreview = res;
                    btnRender.isInProgress = false;
                });
        });

        this._subscriptionRefs.push(subRef)


    }

    /**
     * Subscriptions need to be explicitly released
     */
    ngOnDestroy() {
        this._subscriptionRefs.forEach( ref => ref.unsubscribe() );
        this._subscriptionRefs = [];
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
}

