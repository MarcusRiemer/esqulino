import {Component, OnInit}         from 'angular2/core';
import {Router, ROUTER_DIRECTIVES} from 'angular2/router';

import {ProjectDescription}        from './project.description';
import {ProjectDescriptionService} from './project.description.service';


/**
 * Lists all publicly available projects
 */
@Component({
    selector: 'project-list',
    templateUrl: 'app/front/templates/project-list.html',
    directives: [ROUTER_DIRECTIVES]
})
export class ProjectListComponent implements OnInit {
    public projects : ProjectDescription[]

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectDescriptionService,
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
    navigateEditor(d : ProjectDescription) {
        this._router.navigate(['/Editor', { id : d.id }]);
    }

    /**
     * Navigate to a project in view mode
     */
    navigateView(d : ProjectDescription) {
        this._router.navigate(['/View', { id : d.id }]);
    }
}
