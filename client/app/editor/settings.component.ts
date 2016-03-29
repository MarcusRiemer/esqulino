import {Component}                      from 'angular2/core';

import {Project}        from './project'
import {ProjectService} from './project.service'


@Component({
    templateUrl: 'app/editor/templates/settings.html'
})
export class SettingsComponent {
    /**
     * The currently edited project
     */
    public project : Project;

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectService
    ) {
    }

    /**
     * Load the project to access the schema
     */
    ngOnInit() {        
        this._projectService.ActiveProject
            .subscribe(res => this.project = res);
    }
}
