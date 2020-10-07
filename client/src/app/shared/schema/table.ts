import {
  ColumnDescription,
  TableDescription,
  ForeignKeyDescription,
} from "./schema.description";
import { Column, ColumnStatus } from "./column";

/**
 * A Class to represent a Table with all containing Columns.
 * This will replace the TableDescribtion used in the original design, but it
 * includes all variables for downwards compatibility.
 */
export class Table {
  private _name: string;
  private _columns: Column[];
  private _foreign_keys: ForeignKeyDescription[];
  private _isSystemTable: boolean;

  constructor(
    desc: TableDescription,
    col: ColumnDescription[],
    foreign_keys: ForeignKeyDescription[]
  ) {
    this._name = desc.name;
    this._isSystemTable = desc.systemTable;
    this._columns = col.map((val) => new Column(val, ColumnStatus.unchanged));
    this._foreign_keys = foreign_keys;
  }

  /**
   * Adds an empty column to the table.
   */
  addColumn() {
    let newIndex = 0;
    while (this.getColumnByIndex(newIndex)) {
      newIndex++;
    }
    var newColumn: ColumnDescription = {
      name: "New_Column",
      index: newIndex,
      notNull: false,
      primary: false,
      type: "TEXT",
    };
    this._columns.push(new Column(newColumn, ColumnStatus.new));
  }

  columnIsForeignKeyOfTable(columnName: string): string {
    let table: string = undefined;
    for (let fk of this._foreign_keys) {
      for (let ref of fk.references) {
        if (ref.fromColumn == columnName) {
          table = ref.toTable;
        }
      }
    }
    return table;
  }

  columnIsForeignKeyOfColumn(columnName: string): string {
    let column: string = undefined;
    for (let fk of this._foreign_keys) {
      for (let ref of fk.references) {
        if (ref.fromColumn == columnName) {
          column = ref.toColumn;
        }
      }
    }
    return column;
  }

  /**
   * Removes a column from the table.
   * @param: index - the index of the column to remove
   */
  removeColumn(index: number) {
    this._columns[index].state = ColumnStatus.deleted;
  }

  /**
   * Removes a column from the table.
   * @param: index - the index of the column to remove
   */
  setColumnAsChanged(index: number) {
    this._columns[index].state = ColumnStatus.changed;
  }

  /**
   * @return: Gives the name of the table.
   */
  get name() {
    return this._name;
  }

  /**
   * Setter for table name.
   */
  set name(name: string) {
    this._name = name;
  }

  /**
   * @return True, if this table is an implementation detail.
   */
  get system_table() {
    return this._isSystemTable;
  }

  /**
   * @return: Gives all columns of this table.
   */
  get columns() {
    return this._columns;
  }

  /**
   * Function to get a column by it index value
   * @param index - the index of the searched column
   * @return: The column with the index
   */
  getColumnByIndex(index: number): Column {
    return this._columns.find((col) => col.index == index);
  }

  /**
   * @return: Gives all foreign keys of this table.
   */
  get foreign_keys() {
    return this._foreign_keys;
  }

  /**
   * Function to remove a foreign key from the Table
   */
  removeForeignKey(toRemove: ForeignKeyDescription): ForeignKeyDescription {
    let toReturn: ForeignKeyDescription = { references: [] };
    for (let fkRef of this.foreign_keys) {
      for (let fk of fkRef.references) {
        if (
          fk.fromColumn === toRemove.references[0].fromColumn &&
          fk.toColumn === toRemove.references[0].toColumn &&
          fk.toTable === toRemove.references[0].toTable
        ) {
          toReturn.references.push(
            fkRef.references.splice(fkRef.references.indexOf(fk), 1)[0]
          );
        }
      }
      if (fkRef.references.length == 0) {
        this.foreign_keys.splice(this.foreign_keys.indexOf(fkRef), 1);
      }
    }
    return toReturn;
  }

  /**
   * Function to create a json representation to send it
   * to the server.
   */
  toModel(): TableDescription {
    return {
      name: this._name,
      columns: this._columns.map((val) => val.toModel()),
      foreignKeys: this._foreign_keys,
      systemTable: this._isSystemTable,
    };
  }
}
