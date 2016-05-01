import {TableDescription, ColumnDescription}          from './schema.description'

export {TableDescription, ColumnDescription}

/**
 * A database schema against which a query could be tested. All get methods
 * of this class throw an exception if the specified instance can't be found,
 * because the absence of a table or column that is expected to exist by the
 * caller is a pretty fundamental assumption that should not fail without
 * a bang.
 *
 * This class is basically a convenient frontend to ask questions about a
 * list of table descriptions.
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
     * @return True, if a table with that name exists.
     */
    hasTable(name : string) {
        return (!!this._tables.find(t => t.name == name));
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
