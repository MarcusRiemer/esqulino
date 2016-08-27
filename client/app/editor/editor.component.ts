import {
    Component, OnInit, OnDestroy, ChangeDetectorRef, ReflectiveInjector
} from '@angular/core'
import {Router, ActivatedRoute}         from '@angular/router'

import {TableDescription}               from '../shared/schema.description'

import {ProjectService, Project}        from './project.service'
import {SidebarService}                 from './sidebar.service'
import {PreferencesService}             from './preferences.service'

@Component({
    templateUrl: 'app/editor/templates/index.html',
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
        private _router : Router,
        private _changeDetectorRef : ChangeDetectorRef,
        private _preferences : PreferencesService
    ) { }

    /**
     * Load the project for all sub-components.
     */
    ngOnInit() {       
        this._routeRef = this._routeParams.params.subscribe(params => {
            let projectId = params['projectId'];
            
            console.log(`Loading project with id "${projectId}"`);
            
            this._projectService.setActiveProject(projectId);
            this._projectService.activeProject.subscribe(res => {
                this._project = res
            });
        });
        
        this._sidebarService.isSidebarVisible.subscribe(v => {
            // Fixed?: Causes change-detection-error on change
            // This more or less globally changes the application state,
            // we need to tell the change detector we are aware of this
            // otherwise Angular freaks out:
            // http://stackoverflow.com/questions/38262707/
            this._sidebarVisible = v;
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Subscriptions need to be explicitly released
     */
    ngOnDestroy() {
        this._routeRef.unsubscribe();
        this._projectService.forgetCurrentProject();
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

    get paneOrder() {
        return (this._preferences.paneOrder);
    }
}
