import {Component}                      from '@angular/core';

import {QuerySelect}          from '../shared/query'

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
        this._toolbarService.resetItems();
        this._toolbarService.savingEnabled = true;

        let saveItem = this._toolbarService.saveItem;
        saveItem.onClick.subscribe( (res) => {
            saveItem.isInProgress = true;
            this._projectService.storeProjectDescription(this.project)
                .subscribe(res => saveItem.isInProgress = false);
        });
        
        this._projectService.activeProject
            .subscribe(res => this.project = res);
    }

    /**
     * The user has decided to delete a query.
     */
    onQueryDelete(queryId : string) {
        this._projectService.deleteQuery(queryId);
    }
}
