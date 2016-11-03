import {Component, Input}          from '@angular/core'

import {ProjectDescription}        from '../shared/project.description'
import {ProjectDescriptionService} from '../shared/project.description.service'

/**
 * A single project list item entry.
 */
@Component({
    selector: 'project-list-item',
    templateUrl: 'app/front/templates/project-list-item.html',
})
export class ProjectListItemComponent {
    @Input() project : ProjectDescription;

    /**
     * TODO: Make this configurable
     */
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
    get projectServerHostname() : string {
        const currentHost = window.location.host;
        if (currentHost.startsWith("localhost")) {
            return (currentHost);
        } else {
            return "blattzeug.de";
        }
    }

    /**
     * @return A URL that allows to view this page as a "normal" user.
     */
    get viewUrl() : string {
        if (this.useSobdomain) {
            // TODO: Find out whether it would be more or less trivially
            //       possible to support HTTPs
            return (`http://${this.project.id}.${this.projectServerHostname}`);
        } else {
            return (`/view/${this.project.id}/`)
        }
    }
}

