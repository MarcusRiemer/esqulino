import {
    Component, Input, OnInit,
    ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core'

import {ColumnDescription}              from '../../shared/schema'
import {
    QueryInsert, QueryUpdate, SyntaxTree
} from '../../shared/query'

/**
 * A column that is actively attempting to insert something
 */
interface Assignment {
    expr? : SyntaxTree.Expression
    column : ColumnDescription
    index : number
}

/**
 * Editing SQL assignment components (UPDATE, INSERT)
 */
@Component({
    selector: 'sql-assign',
    templateUrl: 'templates/query-assign.html',
})
export class InsertComponent {
    @Input() query : QueryInsert | QueryUpdate;
    
    /**
     * @return True, if the given query is an INSERT query.
     */
    get isAssignQuery() {
        return (this.query instanceof QueryInsert ||
                this.query instanceof QueryUpdate);
    }

    /**
     * @return All columns that have values set.
     */  
    get allColumns() : Assignment[] {        
        const allColumns = this.query.getTableSchema(this.query.tableName).columns;

        return (allColumns.map( v => { return ({
            column : v,
            index : v.index,
            expr : this.query.getValueForColumn(v.name)
        })}));
    }

    trackByColumnName(index : number, value : Assignment) {
        return (value.column.name);
    }

    onColumnUsageChanged(columnName : string) {
        const isActive = this.query.activeColumns.some(c => c.name == columnName);        
        this.query.changeActivationState(columnName, !isActive);
    }
}
