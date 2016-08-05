import {Component, Input}    from '@angular/core'
import {ROUTER_DIRECTIVES}   from '@angular/router';

import {
    Query, QuerySelect, QueryDelete, QueryInsert, QueryUpdate
} from '../shared/query'
import {Page}                from '../shared/page/page'

import {Project}             from './project.service'
import {QueryIconComponent}  from './query-icon.component'

@Component({
    templateUrl: 'app/editor/templates/navbar.html',
    directives: [ROUTER_DIRECTIVES, QueryIconComponent],
    selector: 'editor-navbar'
})
export class NavbarComponent {
    /**
     * The currently edited project
     */
    @Input() project : Project;

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
