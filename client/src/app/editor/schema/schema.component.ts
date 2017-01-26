import {Component, Input, OnInit}     from '@angular/core';

import {ProjectService, Project}      from '../project.service'
import {SidebarService}               from '../sidebar.service'
import {ToolbarService}               from '../toolbar.service'

@Component({
    templateUrl: 'templates/schema.html'
})

/**
 * A class as entry-point for the representation of a schema
 */
export class SchemaComponent implements OnInit {
    /**
     * The currently edited project
     */
    public project : Project;

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectService,
        private _toolbarService: ToolbarService,
        private _sidebarService: SidebarService
    ) {
        this._sidebarService.hideSidebar();
    }

    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        this._toolbarService.resetItems();
        this._toolbarService.savingEnabled = false;
        
        this._projectService.activeProject
            .subscribe(res =>{
                 this.project = res
            });
    }
}
