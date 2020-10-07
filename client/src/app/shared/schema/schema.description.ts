/**
 * The "over-the-wire" description of a single column
 * inside a table.
 */
export interface ColumnDescription {
  index: number;
  name: string;
  type: string;
  notNull: boolean;
  dfltValue?: string;
  primary: boolean;
}

/**
 * A reference from the column of one table to a specific
 * column of another table.
 */
export interface ForeignKeyDescription {
  references: {
    toTable: string;
    toColumn: string;
    fromColumn: string;
  }[];
}

/**
 * The "over-the-wire" description of a single table
 * with all of its columns.
 */
export interface TableDescription {
  name: string;
  /**
   * @minItems 1
   */
  columns: ColumnDescription[];
  foreignKeys: ForeignKeyDescription[];
  systemTable: boolean;
}

/**
 * At the lowest level all tabular data is simply represented by
 * a string array for each row.
 */
export type RawTableDataDescription = string[][];

/**
 * Allows bulk insertion of tabular data like from CSV files or other
 * bulky sources.
 */
export interface RequestTabularInsertDescription {
  /**
   * The names of the columns to insert the data in.
   *
   * @minItems 1
   */
  columnNames: string[];

  /**
   * The rows to insert. The order of the data inside the columns must
   * match the order of `columnNames`.
   *
   * @minItems 1
   */
  data: RawTableDataDescription;
}

/**
 * Answer of the server after a bulk insertion
 */
export interface ResponseTabularInsertDescription {
  numInsertedRows: number;
  numTotalRows: number;
}
