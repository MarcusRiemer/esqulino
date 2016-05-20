import {Component, OnInit, Input}  from '@angular/core';
import {ROUTER_DIRECTIVES}         from '@angular/router';

import {ProjectDescription}        from '../shared/project.description';
import {ProjectDescriptionService} from '../shared/project.description.service';

import {ProjectListItemComponent}  from './project-list-item.component'

/**
 * Lists all publicly available projects
 */
@Component({
    selector: 'project-list',
    templateUrl: 'app/front/templates/project-list.html',
    directives: [ROUTER_DIRECTIVES, ProjectListItemComponent]
})
export class ProjectListComponent implements OnInit {
    public projects : ProjectDescription[]

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectDescriptionService
    ) { }

    /**
     * Ensures that the project service has projects available
     */
    ngOnInit() {
        this._projectService.fetchProjects()
            .subscribe(projects => this.projects = projects)
    }
}
