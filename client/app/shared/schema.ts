import {TableDescription, ColumnDescription}          from './schema.description'

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
        const toReturn = this._tables.find(t => t.name == name);

        if (!toReturn) {
            throw new Error(`Can't find table ${name}`);
        }

        return (toReturn);
    }

    /**
     * @return The column definition of a certain table
     */
    getColumn(tableName : string, columnName : string) {
        const table = this._tables.find(t => t.name == tableName);

        if (!table) {
            throw new Error(`Can't even find table ${tableName} for ${tableName}.${columnName}`);
        }

        const column = table.columns.find(c => c.name == columnName);

        if (!column) {
            throw new Error(`Can't find column ${columnName} in table ${tableName}`);
        }

        return (column);
    }

    /**
     * @return Schemas for all available tables.
     */
    get tables() {
        return (this._tables);
    }
}
