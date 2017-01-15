import {Component, Input, OnInit}       from '@angular/core';

import {TableDescription}               from '../shared/schema.description'

import {ProjectService, Project}        from './project.service'
import {QueryService}                   from './query.service'


/**
 * Displays the schema for a list of tables.
 */
@Component({
    templateUrl: 'templates/schema-table.html',
    selector: "sql-table"
})
export class SchemaTableComponent implements OnInit {
    /**
     * The tables to display.
     */
    @Input() tables : TableDescription[];

    /**
     * True, if creation should be allowed from this component.
     */
    @Input() allowCreate : boolean = false;

    /**
     * The currently edited project
     */
    private _project : Project;


    constructor(
        private _projectService: ProjectService,
        private _queryService: QueryService) {
    }

    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        this._projectService.activeProject
            .subscribe(res => this._project = res);
    }
}
