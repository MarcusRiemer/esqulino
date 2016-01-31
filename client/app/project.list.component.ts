import {Component, OnInit} from 'angular2/core';
import {Router}            from 'angular2/router';

import {ProjectService}              from './project.service'
import {Project, ProjectDescription} from './project'


/**
 * Lists all publicly available projects
 */
@Component({
    selector: 'project-list',
    templateUrl: 'app/templates/project-list.html'
})
export class ProjectListComponent implements OnInit {
    public projects : Project[]

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectService,
        private _router: Router
    ) { }

    /**
     * Ensures that the project service has projects available
     */
    ngOnInit() {
        this._projectService.getProjects().then(projects => this.projects = projects)
    }

    /**
     * Navigate to a project in edit mode
     */
    navigateEditor(projectDescription : ProjectDescription) {
        this._router.navigate(['Editor', { name : projectDescription.name }]);
    }
}
