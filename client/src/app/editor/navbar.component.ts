import {Component, Input}    from '@angular/core'

import {
    Query
} from '../shared/query'
import {
    Page, QueryReference, QueryReferenceDescription
} from '../shared/page/page'

import {Project}             from './project.service'

import {DragService}         from './page/drag.service'

@Component({
    templateUrl: 'templates/navbar.html',
    selector: 'editor-navbar'
})
export class NavbarComponent {
    /**
     * The currently edited project
     */
    @Input() project : Project;

    constructor(private _pageDragService : DragService) {

    }

    /**
     * Starts dragging around a query.
     */
    startQueryDrag(evt : DragEvent, query : Query) {
        this._pageDragService.startQueryRefDrag(evt, "sidebar", {
            type : "query",
            name : query.name,
            queryId : query.id,
            mapping : []
        });
    }

    /**
     * @param page The page that needs an icon.
     *
     * @return A Font Awesome CSS icon class
     */
    iconForPage(page : Page) {
        if (page.id === this.project.indexPageId) {
            return ("fa-star-o");
        } else {
            return ("fa-file-text-o");
        }
    }
}
