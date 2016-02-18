import {Component, OnInit, Input}  from 'angular2/core';
import {Router, ROUTER_DIRECTIVES} from 'angular2/router';

import {ProjectDescription}        from './project.description';
import {ProjectDescriptionService} from './project.description.service';

@Component({
    selector: 'project-list-item',
    templateUrl: 'app/front/templates/project-list-item.html',
    directives: [ROUTER_DIRECTIVES]
})
export class ProjectListItemComponent implements OnInit {
    @Input() project : ProjectDescription;

    public hasImage = false;

    public get imageUrl() : string {
        return (`/api/project/${this.project.id}/preview`);
    }
    
    /**
     * Used for dependency injection.
     */
    constructor(
        private _router: Router
    )
    {}

    /**
     * Check whether there should be an image.
     */
    ngOnInit() {
        this.hasImage = !!this.project.preview;
    }

    /**
     * Navigate to a project in edit mode
     */
    navigateEditor() {
        this._router.navigate(['/Editor', { id : this.project.id }]);
    }

    /**
     * Navigate to a project in view mode
     */
    navigateView() {
        this._router.navigate(['/View', { id : this.project.id }]);
    }
}

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
        private _projectService: ProjectDescriptionService,
        private _router: Router
    ) { }

    /**
     * Ensures that the project service has projects available
     */
    ngOnInit() {
        this._projectService.getProjects().then(projects => this.projects = projects)
    }
}
