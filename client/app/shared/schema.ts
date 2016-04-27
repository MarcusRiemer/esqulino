import {TableDescription, ColumnDescription}          from './table'

/**
 * A database schema against which a query could be tested.
 */
export class Schema {
    private _tables : TableDescription[];
    
    constructor(tables : TableDescription[]) {
        this._tables = tables;
    }

    /**
     * @return The schema definition of a table with the given name.
     */
    getTable(name : string) {
        return (this._tables.find(t => t.name == name));
    }
}
