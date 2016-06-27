import {Component, OnInit, OnDestroy}   from '@angular/core'
import {CORE_DIRECTIVES}                from '@angular/common'
import {HTTP_PROVIDERS}                 from '@angular/http'
import {
    Router, ActivatedRoute, ROUTER_DIRECTIVES
} from '@angular/router'

import {TableDescription}               from '../shared/schema.description'

import {PageService}                    from './page.service'
import {Project}                        from './project'
import {ProjectService}                 from './project.service'
import {QueryService}                   from './query.service'
import {ToolbarService}                 from './toolbar.service'
import {ToolbarComponent}               from './toolbar.component'
import {NavbarComponent}                from './navbar.component'
import {SidebarLoaderComponent}         from './sidebar-loader.component'
import {SidebarService}                 from './sidebar.service'

import {DragService}                    from './query/drag.service'

@Component({
    templateUrl: 'app/editor/templates/index.html',
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES,
                 ToolbarComponent, NavbarComponent, SidebarLoaderComponent],
    providers: [HTTP_PROVIDERS, SidebarService, PageService,
                ProjectService, QueryService, DragService, ToolbarService]
})
export class EditorComponent implements OnInit, OnDestroy {
    /**
     * The currently edited project
     */
    private _project : Project = null;

    /**
     * Cached state of the sidebar, the UI template doesn't
     * like observables.
     */
    private _sidebarVisible = false;

    private _routeRef : any;

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectService,
        private _sidebarService: SidebarService,
        private _routeParams: ActivatedRoute,
        private _router : Router
    ) { }

    /**
     * Load the project for all sub-components.
     */
    ngOnInit() {
        this._routeRef = this._routeParams.params.subscribe(params => {
            let projectId = params['projectId'];
            
            console.log(`Loading project with id "${projectId}"`);
            
            this._projectService.setActiveProject(projectId);
            this._projectService.activeProject.subscribe(
                res => this._project = res
             );
        });
        
        this._sidebarService.isSidebarVisible.subscribe(v => this._sidebarVisible = v);
    }

    /**
     * Subscriptions need to be explicitly released
     */
    ngOnDestroy() {
        this._routeRef.unsubscribe();
    }

    /**
     * All currently available queries, but possibly an empty list.
     * Using this property ensures that the template does not throw
     * any null pointer exceptions.
     *
     * @return A possibly empty list of queries
     */
    get availableQueries() {
        if (this._project) {
            return (this._project.queries);
        } else {
            return ([]);
        }
    }

    /**
     * @return True, if the sidebar should be visible.
     */
    get isSidebarVisible() {
        return (this._sidebarVisible);
    }

    /**
     * Read only access to currently edited project.
     */
    get project() {
        return (this._project);
    }
}
