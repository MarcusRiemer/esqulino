import {Component, Input}               from '@angular/core'

import {ExpressionComponent}            from './sql.expr.component'

import {QueryInsert}                    from '../../shared/query'

@Component({
    selector : 'sql-insert',
    templateUrl : 'app/editor/query/templates/query-insert.html',
})
export class InsertComponent {
    @Input() query : QueryInsert;

    constructor() {

    }
}
