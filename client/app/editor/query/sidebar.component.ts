import {Component, Input}            from 'angular2/core'

import {DragService}                 from './drag.service'

import {Query}                       from '../../shared/query'

@Component({
    templateUrl: 'app/editor/query/templates/sidebar.html',
    selector : 'sql-sidebar'
})
export class SidebarComponent {
    /**
     * View Variable:
     * The currently edited query
     */
    @Input() query : Query;

    constructor(private dragService : DragService) {
    }
}
