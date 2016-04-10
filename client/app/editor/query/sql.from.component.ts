import {Component, Input}               from 'angular2/core'

import {DragService}                    from './drag.service'
import {ExpressionComponent}            from './sql.expr.component'

import {QuerySelect, Model, SyntaxTree}       from '../../shared/query'

@Component({
    selector : 'sql-from',
    templateUrl : 'app/editor/query/templates/query-from.html',
})
export class FromComponent {
    @Input() from : SyntaxTree.From;
}
