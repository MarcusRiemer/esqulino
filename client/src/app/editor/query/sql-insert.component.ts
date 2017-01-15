import {
    Component, Input, OnInit,
    ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core'

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
    selector: 'sql-insert',
    templateUrl: 'templates/query-insert.html',
})
export class InsertComponent implements OnInit {
    @Input() query : QueryInsert;
    
    constructor(private _cdRef : ChangeDetectorRef) {
        
    }

    ngOnInit() {
        /*this.query.invalidateEvent.subscribe(v => {
            this._cdRef.markForCheck();
        });*/
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
        const allColumns = this.query.getTableSchema(this.query.tableName).columns;

        return (allColumns.map( v => { return ({
            column : v,
            index : v.index,
            expr : this.query.getValueForColumn(v.name)
        })}));
    }

    trackByColumnName(index : number, value : InsertingColumn) {
        return (value.column.name);
    }

    onColumnUsageChanged(columnName : string) {
        const isActive = this.query.activeColumns.some(c => c.name == columnName);        
        this.query.changeActivationState(columnName, !isActive);
    }
}
