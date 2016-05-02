import {QuerySelect, Model}                   from './query'

/**
 * Not much ado about type safety here, in the raw
 * format every cell is a string.
 */
type RawRow = [string]

/**
 * A result is simply a list of rows.
 */
type QueryResultDescription = RawRow[]

/**
 * Over the wire format to describe a query that could not
 * be run on the server.
 */
export interface QueryRunErrorDescription {
    error : string
}

/**
 * Parameters are simply a key-value dictionary. Whenever a query
 * makes use of user-bound parameters, these are transferred via
 * this kind of object.
 */
export type QueryParamsDescription = { [paramKey:string] : string }

/**
 * Some servers support execution of arbitrary queries. This is intended
 * to be used during development and can be done via this request-type.
 */
export type ArbitraryQueryRequestDescription = {
    params : QueryParamsDescription
    sql : string
}

/**
 * Provides some extra type information for a certain cell.
 */
class Cell {
    /**
     * The query this cell is a result of
     */
    private _query : QuerySelect;

    /**
     * The column index of this cell
     */
    private _index : number;

    /**
     * The value of this cell
     */
    private _value : string;

    /**
     * Constructs a concrete cell
     *
     * @param query The query this cell is a result of
     * @param index The column index of this cell
     * @param value The value of this cell
     */
    constructor(query : QuerySelect, index : number, value : string) {
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
    private _query : QuerySelect;
    private _cells : Cell[];
    
    constructor(query : QuerySelect, raw : RawRow) {
        this._query = query;
        this._cells = raw.map( (v,k) => new Cell(query, k, v));
    }

    get cells() {
        return (this._cells);
    }
}

function isQueryRunErrorDescription(arg : any) : arg is QueryRunErrorDescription {
    return (arg.error !== undefined);
}

function isQueryResultDescription(arg : any) : arg is QueryResultDescription {
    return (Array.isArray(arg));
}

/**
 * Adds type information to a raw QueryResultDescription.
 */
export class QueryResult {
    private _query : QuerySelect;

    private _rows : Row[] = [];

    /**
     * If this field is set, the query was not succesfull
     */
    private _error : QueryRunErrorDescription;

    /**
     * A result may be an error or a list of rows.
     *
     * @param query The query that was running
     * @param res   The result of the run
     */
    constructor(query : QuerySelect, res : QueryResultDescription | QueryRunErrorDescription) {
        this._query = query;

        if (isQueryRunErrorDescription(res)) {
            this._error = res;
        } else if (isQueryResultDescription(res)) {
            this._rows = res.map( v => new Row(query, v));
        }
    }

    /**
     * @return True, if this result is an error.
     */
    get isError() : boolean {
        return (!!this._error);
    }

    /**
     * @return The servers error message.
     */
    get errorMessage() {
        return (this._error.error);
    }

    /**
     * @return All result rows
     */
    get rows() {
        return (this._rows);
    }

    /**
     * @return The names of the columns involved in this result.
     */
    get cols() {
        return (this._query.select.actualColums);
    }
}
