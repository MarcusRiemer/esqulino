import {Component, Input, OnInit}     from '@angular/core';
import { Router, ActivatedRoute }     from '@angular/router'

import {ProjectService, Project}      from '../project.service'
import {SidebarService}               from '../sidebar.service'
import {ToolbarService}               from '../toolbar.service'

/**
 * A class as entry-point for the representation of a schema
 */
@Component({
    template: ``
})
export class SchemaRedirectComponent implements OnInit {
    /**
     * The currently edited project
     */
    public project : Project;

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectService,
        private _router: Router,
        private _route: ActivatedRoute,
    ) {}

    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        this._projectService.activeProject
            .first()
            .subscribe (res =>{
                this.project = res
                this._router.navigate([this.project.currentDatabaseName], { relativeTo: this._route })
            });
    }
}
