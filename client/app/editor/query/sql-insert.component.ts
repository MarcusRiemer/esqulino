import {Component, Input, ChangeDetectionStrategy} from '@angular/core'

import {ExpressionComponent}            from './sql-expr.component'

import {ColumnDescription}              from '../../shared/schema.description'
import {QueryInsert, SyntaxTree}        from '../../shared/query'

/**
 * A column that is actively attempting to insert something
 */
interface InsertingColumn {
    expr? : SyntaxTree.Expression
    column : ColumnDescription
    index : number
}

/**
 * Editing INSERT components
 */
@Component({
    selector : 'sql-insert',
    templateUrl : 'app/editor/query/templates/query-insert.html',
    directives : [ExpressionComponent],
    changeDetection : ChangeDetectionStrategy.OnPush
})
export class InsertComponent {
    @Input() query : QueryInsert;

    private _allColumnsCache : InsertingColumn[];
    
    constructor() {

    }

    /**
     * @return True, if the given query is an INSERT query.
     */
    get isInsertQuery() {
        return (this.query instanceof QueryInsert);
    }

    /**
     * @return All columns that have values set.
     */  
    get allColumns() : InsertingColumn[] {        
        if (!this._allColumnsCache) {
            const allColumns = this.query.getTableSchema(this.query.tableName).columns;

            this._allColumnsCache = allColumns.map( v => { return ({
                column : v,
                index : v.index,
                expr : this.query.getValueForColumn(v.name)
            })});
        }
        
        return (this._allColumnsCache)
    }

    onColumnUsageChanged(columnName : string) {
        const isActive = this.query.activeColumns.some(c => c.name == columnName);
        
        this.query.changeActivationState(columnName, !isActive);

        // Reset the cache
        this._allColumnsCache = undefined;
    }
}
