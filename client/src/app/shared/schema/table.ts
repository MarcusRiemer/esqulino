import {Project}                              from '../project'
import {ProjectResource}                      from '../resource'
import {ColumnDescription, TableDescription, ForeignKeyDescription}  from './schema.description'
import {Column, ColumnStatus}                 from './column'

/**
 * A Class to represent a Table with all containing Columns. 
 * This will replace the TableDescribtion used in the original design, but it
 * includes all variables for downwards compatibility. 
 */

export class Table {
    private _name : string;
    private _columns : Column[];
    private _foreign_keys : ForeignKeyDescription[];

    constructor(desc : TableDescription, col : ColumnDescription[], foreign_keys : ForeignKeyDescription[]) {
        this._name = desc.name;
        this._columns = col
            .map(val => new Column(val, ColumnStatus.unchanged));
        this._foreign_keys = foreign_keys;
    }

    /**
     * Adds an empty column to the table.
     */
    addColumn() {
        let newIndex = 0;
        while(this.getColumnwithIndex(newIndex)) {
            newIndex++;
        }
        var newColumn : ColumnDescription = {name : "New_Column",
                                             index : newIndex,
                                             not_null : false,
                                             primary : false,
                                             type : "TEXT"};
        this._columns.push(new Column(newColumn, ColumnStatus.new));
    }

    columnIsForeignKeyOfTable(columnName : string) : string {
        let table : string = undefined;
        for(let fk of this._foreign_keys) {
            for(let ref of fk.refs) {
                if(ref.from_column == columnName) {
                    table = ref.to_table;
                }
            }
        }
        return table;
    }

    columnIsForeignKeyOfColumn(columnName : string) : string {
        let column : string = undefined;
        for(let fk of this._foreign_keys) {
            for(let ref of fk.refs) {
                if(ref.from_column == columnName) {
                    column = ref.to_column;
                }
            }
        }
        return column;
    }

    /**
     * Removes a column from the table.
     * @param: index - the index of the column to remove
     */
    removeColumn(index : number) {
        this._columns[index].state = ColumnStatus.deleted;
    }

    /**
     * Removes a column from the table.
     * @param: index - the index of the column to remove
     */
    setColumnAsChanged(index : number) {
        this._columns[index].state = ColumnStatus.changed;
    }

    /**
     * @return: Gives the name of the table.
     */
    get name() {
        return this._name;
    }

    /**
     * Setter for table name.
     */
    set name(name : string) {
        this._name = name;
    }

    /**
     * @return: Gives all columns of this table.
     */
    get columns() {
        return this._columns;
    }

    /**
     * Function to get a column by it index value
     * @param index - the index of the searched column
     * @return: The column with the index
     */
    getColumnwithIndex(index : number) : Column {
        let column : Column = undefined;
        for(let col of this._columns) {
            if(col.index == index) {
                column = col;
            }
        }
        return column;
    }

    /**
     * @return: Gives all foreign keys of this table.
     */
    get foreign_keys() {
        return this._foreign_keys;
    }

    /**
     * Function to create a json representation to send it 
     * to the server.
     */
    toModel() : TableDescription {
        return {
            name : this._name,
            columns : this._columns.map(val => val.toModel()),
            foreign_keys : this._foreign_keys
        }
    }
}
