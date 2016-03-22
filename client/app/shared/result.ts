import {Query, Model}                   from './query'

/**
 * Not much ado about type safety here, in the raw
 * format every cell is a string.
 */
type RawRow = [string]

/**
 * A result is simply a list of rows.
 */
export type RawResult = [RawRow]

/**
 * Provides some extra type information for a certain cell.
 */
class Cell {
    private _query : Query;
    private _index : number;
    private _value : string;

    constructor(query : Query, index : number, value : string) {
        this._query = query;
        this._index = index;
        this._value = value;
    }

    /**
     * Possibly formats the value based on the type.
     */
    get value() {
        return (this._value);
    }
}

/**
 * Allows to adress columns by name or index.
 */
class Row {
    private _query : Query;
    private _cells : Cell[];
    
    constructor(query : Query, raw : RawRow) {
        this._query = query;
        this._cells = raw.map( (v,k) => new Cell(query, k, v));
    }

    get cells() {
        return (this._cells);
    }
}

export class QueryResult {
    private _query : Query;

    private _rows : Row[];
    
    constructor(query : Query, raw : RawResult) {
        this._query = query;
        this._rows = raw.map( v => new Row(query, v));
    }

    get rows() {
        return (this._rows);
    }

    get cols() {
        return (this._query.select.columns.map(v => v.name));
    }
}
