import {
    Component, OnInit, OnDestroy, ViewChild, Input
} from '@angular/core'
import {Router, ActivatedRoute}         from '@angular/router'

import {Observable}                     from 'rxjs/Observable'

import {Paragraph}                      from '../../shared/page/widgets/index'

import {ProjectService, Project}        from '../project.service'
import {PageService, Page}              from '../page.service'
import {PreferencesService}             from '../preferences.service'
import {RegistrationService}            from '../registration.service'
import {SidebarService}                 from '../sidebar.service'
import {ToolbarService}                 from '../toolbar.service'

import {ServerPreviewComponent}         from './server-preview.component'
import {SidebarDataComponent}           from './page-data.sidebar'
import {SidebarWidgetsComponent}        from './page-widgets.sidebar'

/**
 * Base class for components that edit esqulino pages.
 *
 * On top of that this component provides a <datalist> with the id
 * `page-required-parameters` that can be used for autocompletion in various
 * sub-components.
 */
export class PageEditor implements OnInit, OnDestroy {
    /**
     * Sidebars may only be registered once
     */
    private static _sidebarsRegistered = false;
    
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

    @Input()
    public doRenderPreview = false;

    @ViewChild(ServerPreviewComponent)
    private _serverPreview : ServerPreviewComponent;

    constructor(
        private _projectService : ProjectService,
        private _pageService : PageService,
        private _toolbarService: ToolbarService,
        private _routeParams: ActivatedRoute,
        private _sidebarService : SidebarService,
        private _preferences : PreferencesService
    ) {
        
    }

    /**
     * Reverts sidebars back to normal.
     */
    private showDefaultSidebars() : void {        
        this._sidebarService.showMultiple([
            {
                type : SidebarWidgetsComponent.SIDEBAR_IDENTIFIER,
                param : this._page,
                sticky : true,
            },
            {
                type : SidebarDataComponent.SIDEBAR_IDENTIFIER,
                param : this._page,
                sticky : true,
            }
        ]);
    }

    /**
     * Load the project to access the schema and its pages.
     */
    ngOnInit() {
        this._toolbarService.resetItems();

        // Grab the correct project and page
        let subRef = this._routeParams.params.subscribe(params => {
            var pageId = params['pageId'];

            console.log(`Page Editor: PageId changed to ${pageId}`);
            
            this._projectService.activeProject
                .filter(p => !!p)
                .first()
                .subscribe(res => {
                    // Project is loaded, display the correct page to edit
                    this._project = res;
                    this._page = this._project.getPageById(pageId);

                    // The active page has changed: Reset render preview and sidebar
                    this.showDefaultSidebars();
                    this.doRenderPreview = false;

                    console.log(`Page Editor: Showing "${this._page.name}" (${this._page.id})`);
                });
        })

        this._subscriptionRefs.push(subRef)

        // Reacting to rendering
        let btnRender = this._toolbarService.addButton("render", "Vorschau", "search", "r");
        subRef = btnRender.onClick.subscribe( (res) => {
            // Show the render preview
            this.doRenderPreview = !this.doRenderPreview;

            // And do an actual rendering-request if everything is in order.
            if (this.doRenderPreview && this._serverPreview.allParametersAvailable) {
                btnRender.isInProgress = true;
                this._serverPreview.refresh()
                    .subscribe(res => {
                        btnRender.isInProgress = false;
                    });
            }
        });

        this._subscriptionRefs.push(subRef);

        // Reacting to saving
        this._toolbarService.savingEnabled = true;
        let btnSave = this._toolbarService.saveItem;

        subRef = btnSave.onClick.subscribe( (res) => {
            btnSave.isInProgress = true;
            this._pageService.savePage(this.project, this._page)
            // Always delay visual feedback by 500ms
                .delay(500)
                .subscribe(res => {
                    btnSave.isInProgress = false;
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

    /**
     * @return True, if a debug JSON model should be shown.
     */
    get showJsonModel() {
        return (this._preferences.showJsonModel);
    }

    /*
     * @return The currently edited project
     */
    @Input()
    get project() {
        return (this._project);
    }

    /*
     * @return The currently edited page
     */
    @Input()
    get page() {
        return (this._page);
    }

    get requiredParameterNames() {
        if (this.page) {
            return (this.page.requiredParameterNames);
        } else {
            return ([]);
        }
    }
}
