import {Component, Input}  from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated';

import {Project}           from './project'
import {
    Query, QuerySelect, QueryDelete, QueryInsert
} from '../shared/query'

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
     * @return A Font Awesome CSS icon class
     */
    iconForQuery(query : Query) {
        if (query instanceof QueryDelete) {
            return ("fa-ban");
        } else if (query instanceof QueryInsert) {
            return ("fa-plus-circle");
        } else {
            return ("fa-search");
        } 
    }
}
