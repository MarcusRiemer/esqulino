import {Component, OnInit, Input}  from '@angular/core'
import {ROUTER_DIRECTIVES}         from '@angular/router'

import {ProjectDescription}        from '../shared/project.description'
import {ProjectDescriptionService} from '../shared/project.description.service'

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
     * Check whether there should be an image.
     */
    ngOnInit() {
        this.hasImage = !!this.project.preview;
    }
}

