import {Component, Inject, OnInit} from '@angular/core'

import {QueryTable}               from '../../../../shared/page/widgets/index'

import {WIDGET_MODEL_TOKEN}       from '../../../editor.token'

/**
 * Allows to edit a QueryTable
 */
@Component({
    templateUrl: 'templates/query-table.html',
})
export class QueryTableComponent {    
    constructor(@Inject(WIDGET_MODEL_TOKEN) public model : QueryTable) {

    }
}
