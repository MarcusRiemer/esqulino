import {Component, OnInit, Input}  from 'angular2/core';
import {Router, ROUTER_DIRECTIVES} from 'angular2/router';

import {ProjectDescription}        from '../shared/project.description';
import {ProjectDescriptionService} from '../shared/project.description.service';

/**
 * A single project list item entry.
 */
@Component({
    selector: 'project-list-item',
    templateUrl: 'app/front/templates/project-list-item.html',
    directives: [ROUTER_DIRECTIVES]
})
export class ProjectListItemComponent implements OnInit {
    @Input() project : ProjectDescription;

    public hasImage = false;

    /**
     * @return The image URL of this project
     */
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
        this._router.navigate(['/Editor', { projectId : this.project.id }]);
    }

    /**
     * Navigate to a project in view mode
     */
    navigateView() {
        this._router.navigate(['/View', { projectId : this.project.id }]);
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
        this._projectService.fetchProjects().subscribe(projects => this.projects = projects)
    }
}
