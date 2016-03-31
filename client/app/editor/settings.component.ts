import {Component}                      from 'angular2/core';

import {Project}        from './project'
import {ProjectService} from './project.service'
import {ToolbarService} from './toolbar.service'


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
        private _projectService: ProjectService,
        private _toolbarService: ToolbarService
    ) {
    }

    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        this._toolbarService.savingEnabled = true;
        this._projectService.ActiveProject
            .subscribe(res => this.project = res);
    }
}
