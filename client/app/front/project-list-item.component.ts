import {Component, Input}          from '@angular/core'
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
export class ProjectListItemComponent {
    @Input() project : ProjectDescription;

    useSobdomain = true;

    /**
     * @return The image URL of this project
     */
    get imageUrl() : string {
        return (`/api/project/${this.project.id}/preview`);
    }

    /**
     * @return True, if this item has an image
     */
    get hasImage() : boolean {
        return (this.project && !!this.project.preview);
    }

    /**
     * @return The currently visited hostname
     */
    get hostname() : string {
        return (window.location.host);
    }

    /**
     * @return A URL that allows to view this page as a "normal" user.
     */
    get viewUrl() : string {
        if (this.useSobdomain) {
            return (`//${this.project.id}.${this.hostname}`);
        } else {
            return (`/view/${this.project.id}/`)
        }
    }
}

