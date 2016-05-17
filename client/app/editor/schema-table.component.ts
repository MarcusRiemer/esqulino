import {Component, Input}               from '@angular/core';

import {TableDescription}               from '../shared/schema.description'

import {Project}                        from './project'
import {ProjectService}                 from './project.service'
import {QueryService}                   from './query.service'



@Component({
    templateUrl: 'app/editor/templates/schema.table.html',
    selector: "sql-table"
})
export class SchemaTableComponent {
    @Input() tables : TableDescription[];

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

    onCreateSelect(tableName : string) {
        this._queryService.createSelect(this._project, tableName)
            .subscribe( (res) => console.log(`Created SELECT query for table "${tableName}"`));
    }

    onCreateInsert(tableName : string) {
        this._queryService.createInsert(this._project, tableName)
            .subscribe( (res) => console.log(`Created INSERT query for table "${tableName}"`));
    }
}
