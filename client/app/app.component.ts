import {Component, OnInit}    from 'angular2/core';
import {HTTP_PROVIDERS}       from 'angular2/http';
import {CORE_DIRECTIVES}      from 'angular2/common';
import {ProjectListComponent} from './project.component';
import {ProjectService}       from './project.service'
import {Project}              from './project'

@Component({
    selector: 'sql-scratch',
    templateUrl: 'app/templates/index.html',
    directives: [CORE_DIRECTIVES, ProjectListComponent],
    providers: [HTTP_PROVIDERS, ProjectService]
})

export class SqlScratchComponent implements OnInit {
    public title = 'SQL-Pad';
    public selectedProject : Project;

    constructor(private _projectService: ProjectService) { }

    ngOnInit() {
        this._projectService.fetchProjects()
    }
}
