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
     * @return Schemas for all available tables.
     */
    get tables() {
        return (this._tables);
    }
}
