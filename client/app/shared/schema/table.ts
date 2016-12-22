import {Project}                              from '../project'
import {ProjectResource}                      from '../resource'
import {ColumnDescription, TableDescription}  from './schema.description'
import {Column, ColumnStatus}                 from './column'

/**
 * A Class to represent a Table with all containing Columns. 
 * This will replace the TableDescribtion used in the original design, but it
 * includes all variables for downwards compatibility. 
 */

export class Table {
    private _name : string;
    private _columns : Column[];

    constructor(desc : TableDescription, col : ColumnDescription[], project? : Project) {
         this._name = desc.name;
         this._columns = col
            .map(val => new Column(val, ColumnStatus.unchanged))
    }

    /**
     * Adds an empty column to the table.
     */
    addColumn() {
        var newColumn : ColumnDescription = {name : "New Column",
                                             index : this._columns.length,
                                             not_null : false,
                                             primary : false,
                                             type : "STRING"};
        this._columns.push(new Column(newColumn, ColumnStatus.new));
    }

    /**
     * Removes a column from the table.
     * @param: index - the index of the column to remove
     */
    removeColumn(index : number) {
        this._columns[index].setState(ColumnStatus.deleted);
    }

    /**
     * Removes a column from the table.
     * @param: index - the index of the column to remove
     */
    setColumnAsChanged(index : number) {
        this._columns[index].setState(ColumnStatus.changed);
    }

    /**
     * @return: Gives the name of the table.
     */
    get name() {
        return this._name;
    }

    /**
     * @return: Gives all columns of this table.
     */
    get columns() {
        return this._columns;
    }
}