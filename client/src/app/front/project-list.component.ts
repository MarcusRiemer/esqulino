import {Component, OnInit, Input}  from '@angular/core'

import {ProjectDescription}        from '../shared/project.description'
import {ProjectDescriptionService} from '../shared/project.description.service'

/**
 * Lists all publicly available projects
 */
@Component({
    selector: 'project-list',
    templateUrl: 'templates/project-list.html',
})
export class ProjectListComponent implements OnInit {
    public projects : ProjectDescription[]

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService : ProjectDescriptionService
    ) { }

    /**
     * Ensures that the project service has projects available
     */
    ngOnInit() {
        this._projectService.fetchProjects()
            .subscribe(projects => this.projects = projects)
    }
}
