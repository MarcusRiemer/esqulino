/**
 * The "over-the-wire" description of a single column
 * inside a table.
 */
export interface ColumnDescription {
  index: number
  name: string
  type: string
  not_null: boolean
  dflt_value?: string
  primary: boolean
}

/**
 * A reference from the column of one table to a specific
 * column of another table.
 */
export interface ForeignKeyDescription {
  references: {
    to_table: string
    to_column: string
    from_column: string
  }[];
}

/**
 * The "over-the-wire" description of a single table 
 * with all of its columns.
 */
export interface TableDescription {
  name: string
  /**
   * @minItems 1
   */
  columns: ColumnDescription[]
  foreign_keys: ForeignKeyDescription[]
  system_table?: boolean
}

/**
 * At the lowest level all tabular data is simply represented by
 * a string array for each row.
 */
export type RawTableDataDescription = string[][];

/**
 * Allows bulk insertion of tabular data like from CSV files. The order
 * of the data in the actual columns must match the order of the given
 * column names.
 */
export interface RequestTabularInsertDescription {
  /**
   * @minItems 1
   */
  columnNames: string[];
  data: RawTableDataDescription;
}

