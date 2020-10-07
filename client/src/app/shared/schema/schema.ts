import { TableDescription } from "./schema.description";
import { Table } from "./table";

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
  private _tables: Table[];

  constructor(tables: TableDescription[]) {
    this._tables = tables.map(
      (val) => new Table(val, val.columns, val.foreignKeys)
    );
  }

  /**
   * @return The schema definition of a table with the given name. Returns
   *         `undefined` if the table does not exist.
   */
  getTable(name: string, throwOnError = false) {
    const toReturn = this._tables.find((t) => t.name == name);

    if (!toReturn && throwOnError) {
      throw new Error(`Can't find table ${name}`);
    }

    return toReturn;
  }

  /**
   * @return True, if a table with that name exists.
   */
  hasTable(name: string) {
    return !!this._tables.find((t) => t.name == name);
  }

  /**
   * @param tableName The name of the table the column belongs to.
   * @param columnIndex The index of the column, starts at 0
   *
   * @return All known type information about the requested column.
   */
  getColumnByIndex(tableName: string, columnIndex: number) {
    const table = this._tables.find((t) => t.name == tableName);

    if (!table) {
      throw new Error(
        `Can't even find table ${tableName} for column #${columnIndex}`
      );
    }

    if (columnIndex > table.columns.length) {
      throw new Error(
        `Table ${tableName} has no column #${columnIndex}, maximum is ${table.columns.length}`
      );
    }

    return table.columns[columnIndex];
  }

  /**
   * @param tableName The name of the table the column belongs to.
   *
   * @return All known type information about the requested column.
   */
  getColumn(tableName: string, columnName: string) {
    const table = this._tables.find((t) => t.name == tableName);

    if (!table) {
      throw new Error(
        `Can't even find table ${tableName} for ${tableName}.${columnName}`
      );
    }

    const column = table.columns.find((c) => c.name == columnName);

    if (!column) {
      throw new Error(`Can't find column ${columnName} in table ${tableName}`);
    }

    return column;
  }

  /**
   * @return True, if a column with the given name exists inside the given
   *         table.
   */
  hasColumn(tableName: string, columnName: string) {
    const table = this._tables.find((t) => t.name == tableName);

    return table && table.columns.find((c) => c.name == columnName);
  }

  /**
   * @return Schemas for all available tables.
   */
  get tables() {
    return this._tables.filter((t) => !t.system_table);
  }

  /**
   * @return True, if there are no tables in the schema.
   */
  get isEmpty() {
    return this._tables.length === 0;
  }
}
