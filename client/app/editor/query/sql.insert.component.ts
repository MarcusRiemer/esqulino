import {Component, Input}               from '@angular/core'

import {ExpressionComponent}            from './sql.expr.component'

import {Expression}                     from '../../shared/query.syntaxtree'
import {ColumnDescription}              from '../../shared/schema.description'
import {QueryInsert}                    from '../../shared/query'

/**
 * A column that is actively attempting to insert something
 */
interface InsertingColumn {
    expr? : Expression
    column : ColumnDescription
    index : number
}

/**
 * Editing INSERT components
 */
@Component({
    selector : 'sql-insert',
    templateUrl : 'app/editor/query/templates/query-insert.html',
    directives : [ExpressionComponent]
})
export class InsertComponent {
    @Input() query : QueryInsert;

    constructor() {

    }

    /**
     * @return True, if the given query is an INSERT query.
     */
    get isInsertQuery() {
        return (this.query instanceof QueryInsert);
    }

    get allColumns() : InsertingColumn[] {
        const allColumns = this.query.getTableSchema(this.query.tableName).columns;

        return (allColumns.map( v => { return ({
            column : v,
            index : v.index,
            expr : this.query.getValueForColumn(v.index)
        })}));
    }

    /**
     * @return All columns that don't have any values set.
     */
    get unusedColumns() : InsertingColumn[] {
        const allColumns = this.query.getTableSchema(this.query.tableName).columns;
        const usedColumns = allColumns.filter(outer => !this.query.activeColumns.find( inner => inner.name == outer.name));

        return (usedColumns.map((v,i) => { return ({
            column : v,
            index: v.index
        })}));
    }

    /**
     * @return All columns that have values set.
     */  
    get usedColumns() : InsertingColumn[] {
        const usedColumns = this.query.activeColumns;
        const usedValues = this.query.values;

        let toReturn : InsertingColumn[] = [];

        usedColumns.forEach( (v,i) => {
            toReturn.push({
                expr : usedValues[i],
                column : usedColumns[i],
                index : usedColumns[i].index
            });
        });

        return (toReturn);
    }

    onColumnUsageChanged(index : number) {
        const isActive = this.query.activeColumns.some(c => c.index == index);
        
        this.query.changeActivationState(index, !isActive);
    }
}
