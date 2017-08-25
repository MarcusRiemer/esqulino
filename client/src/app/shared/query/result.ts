import { RequestErrorDescription } from '../serverapi.service'

import * as Model from './description'
import { Query } from './base'

/**
 * Not much ado about type safety here, in the raw
 * format every cell is a string.
 */
type RawRow = string[]

/**
 * The result usually contains a list of rows and a list of columns.
 * If the result is a simulation there are additional properties.
 */
type QueryResultDescription = {
  rows?: RawRow[]
  inserted?: RawRow[]
  highlight?: number[]
  columns: string[]
};

/**
 * Over the wire format to describe a query that could not
 * be run on the server.
 */
export interface QueryRunErrorDescription extends RequestErrorDescription {

}

/**
 * Provides some extra type information for a certain cell.
 */
class Cell {
  /**
   * The query this cell is a result of
   */
  private _query: Query;

  /**
   * The column index of this cell
   */
  private _index: number;

  /**
   * The value of this cell
   */
  private _value: string;

  /**
   * Constructs a concrete cell
   *
   * @param query The query this cell is a result of
   * @param index The column index of this cell
   * @param value The value of this cell
   */
  constructor(query: Query, index: number, value: string) {
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
  private _query: Query;
  private _cells: Cell[];
  private _highlight: boolean;

  constructor(query: Query, raw: RawRow, highlight?: boolean) {
    this._query = query;
    this._highlight = !!highlight;
    this._cells = raw.map((v, k) => new Cell(query, k, v));
  }

  get cells() {
    return (this._cells);
  }

  get isHighlighted() {
    return (this._highlight);
  }
}

function isQueryRunErrorDescription(arg: any): arg is QueryRunErrorDescription {
  return (arg.message !== undefined);
}

function isQueryResultDescription(arg: any): arg is QueryResultDescription {
  return !!(arg.rows && arg.columns);
}

/**
 * Adds type information to a raw QueryResultDescription.
 */
export class QueryResult {
  private _query: Query;

  private _rows: Row[] = [];
  private _inserted: Row[] = [];

  private _columns: string[] = [];

  private _simulated: boolean;

  /**
   * If this field is set, the query was not succesfull
   */
  private _error: QueryRunErrorDescription;

  /**
   * A result may be an error or a list of rows.
   *
   * @param query     The query that was running
   * @param res       The result of the run
   * @param simulated True if this is the result of a simulation.
   */
  constructor(query: Query, res: QueryResultDescription | QueryRunErrorDescription, simulated: boolean) {
    this._query = query;
    this._simulated = simulated;

    if (isQueryRunErrorDescription(res)) {
      this._error = res;
    } else if (isQueryResultDescription(res)) {
      const highlighted = res.highlight || [];

      this._rows = res.rows.map((v, i) => new Row(query, v, highlighted.includes(i)));
      this._inserted = (res.inserted || []).map(v => new Row(query, v));
      this._columns = res.columns;
    }
  }

  /**
   * @return True, if the promised row count matches the actual row count.
   */
  get hasValidSingleRowCount() {
    // If this query does not expect a single row everything goes, otherwise
    // the result must exactly be a single row!
    return (!this._query.singleRow || this._rows.length === 1);
  }

  /**
   * @return True, if this result is an error.
   */
  get isError(): boolean {
    return (!!this._error);
  }

  /**
   * @return True if this is the result of a simulation.
   */
  get isSimulated(): boolean {
    return (this._simulated);
  }

  /**
   * @return The servers error message.
   */
  get errorMessage() {
    return (this._error.message);
  }

  /**
   * @return All result rows
   */
  get rows() {
    return (this._rows);
  }

  /**
   * Rows that have been inserted
   */
  get inserted() {
    return (this._inserted);
  }

  /**
   * @return The names of the columns involved in this result.
   */
  get cols() {
    return (this._columns);
  }
}
