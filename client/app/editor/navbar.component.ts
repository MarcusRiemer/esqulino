import {Component, Input}  from '@angular/core'
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated';

import {Project}           from './project'
import {
    Query, QuerySelect, QueryDelete, QueryInsert, QueryUpdate
} from '../shared/query'
import {Page}              from '../shared/page/page'

@Component({
    templateUrl: 'app/editor/templates/navbar.html',
    directives: [ROUTER_DIRECTIVES],
    selector: 'editor-navbar'
})
export class NavbarComponent {
    /**
     * The currently edited project
     */
    @Input() project : Project;

    /**
     * @param query The query that needs an icon.
     *
     * @return A Font Awesome CSS icon class
     */
    iconForQuery(query : Query) {
        if (query instanceof QueryDelete) {
            return ("fa-ban");
        } else if (query instanceof QueryInsert) {
            return ("fa-plus-circle");
        } else if (query instanceof QueryUpdate) {
            return ("fa-pencil");
        }else {
            return ("fa-search");
        } 
    }

    /**
     * @param page The page that needs an icon.
     *
     * @return A Font Awesome CSS icon class
     */
    iconForPage(page : Page) {
        return ("fa-file-text-o");
    }
}
