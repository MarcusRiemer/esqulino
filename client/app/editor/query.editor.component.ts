import {Component}                      from 'angular2/core';
import {Router, RouteParams}            from 'angular2/router';

import {Query, Model}           from '../shared/query';

import {Project}                from './project'
import {ProjectService}         from './project.service'
import {QueryComponent}         from './query';

@Component({
    templateUrl: 'app/editor/templates/query-editor.html',
    directives: [QueryComponent]
})
export class QueryEditorComponent {
    /**
     * The currently edited query
     */
    public query : Query;

    /**
     * The currently edited project
     */
    public project : Project;

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectService,
        private _routeParams: RouteParams
    ) { }

    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        var projectId = this._routeParams.get('id');
        this._projectService.getProject(projectId)
            .then(res => {
                this.project = res;
                // Build a new query in place for testing purposes
                this.query = new Query(this.project.schema,
                                       this.generateQueryModel());

                console.log(this.query);
            });
    }

    onClick() {
        this.query = new Query(this.project.schema,
                               this.generateQueryModel());

        console.log("New Query");
    }

    /**
     * Generates an artificial query on the fly that is currently
     * used as test query.
     */
    generateQueryModel() : Model.Query {
        return ({
            select : {
                columns : [
                    { single : {column : "id", table : "person" } },
                    { single : {column : "name" , table : "person" } }
                ]
            },

            from : { table : "person",
                     alias : "pe",
                     joins : [
                         { table : "ort",
                           alias  : "o",
                           type : "cross"
                         }
                     ]}
            
        });
        
    }
}
