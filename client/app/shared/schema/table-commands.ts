import { TableDescription, ColumnDescription }    from './schema.description'
import { Table }                                  from './table'
import { Column, ColumnStatus }                   from './column'

/**
 * abstract class for all table commands
 */
abstract class TableCommand {
  abstract do(table: Table): void;
  abstract undo(table: Table): void;
}

/**
 * Class for adding a new column to the table
 */
export class AddNewColumn extends TableCommand {
  do(table: Table): void {
    table.addColumn();
  }

  undo(table: Table): void {
    table.columns.splice(-1, 1);
  }
}

/**
 * Class for deleting a column of a table
 */
export class DeleteColumn extends TableCommand {
  private _columnIndex : number;
  private _lastColumnState : ColumnStatus;
  constructor(columnIndex : number, lastColumnState : ColumnStatus) {
    super();
    this._columnIndex = columnIndex;
    this._lastColumnState = lastColumnState;
  }

  do(table: Table): void {
    table.removeColumn(this._columnIndex);
  }

  undo(table: Table): void {
    table.columns[this._columnIndex].setState(this._lastColumnState);
  }
}

/**
 * Class for switching the place of a column
 */
export class SwitchColumnOrder extends TableCommand {
  private _from : number;
  private _to : number;
  constructor(from : number, to : number) {
    super();
    this._from = from;
    this._to = to;
  }

  do(table: Table): void {
    this.moveColumn(table.columns, this._from, this._to);
  }

  undo(table: Table): void {
    this.moveColumn(table.columns, this._to, this._from);
  }

  private moveColumn(columns : Column[], from : number, to : number) {
    columns.splice(to, 0, columns.splice(from, 1)[0]);
  }
}

/**
 * Class to rename a column
 */
export class RenameColumn extends TableCommand {
  private _columnIndex : number;
  private _oldName : string;
  private _newName : string;
  constructor(columnIndex : number, oldName : string, newName : string) {
    super();
    this._columnIndex = columnIndex;
    this._newName = newName;
    this._oldName = oldName
  }

  do(table: Table): void {
    table.columns[this._columnIndex].name = this._newName;
  }

  undo(table: Table): void {
    table.columns[this._columnIndex].name = this._oldName;
  }
}

/**
 * Class to change the type of a column
 */
export class ChangeColumnType extends TableCommand {
  private _columnIndex : number;
  private _oldType : string;
  private _newType : string;
  constructor(columnIndex : number, oldType : string, newType : string) {
    super();
    this._columnIndex = columnIndex;
    this._newType = newType;
    this._oldType = oldType;
  }

  do(table: Table): void {
    table.columns[this._columnIndex].type = this._newType;
  }

  undo(table: Table): void {
    table.columns[this._columnIndex].type = this._oldType;
  }
}

/**
 * Class to change the primary key state of a column
 */
export class ChangeColumnPK extends TableCommand {
  private _columnIndex : number;
  constructor(columnIndex : number) {
    super();
    this._columnIndex = columnIndex;
  }

  do(table: Table): void {
    table.columns[this._columnIndex].primary = !table.columns[this._columnIndex].primary;
  }

  undo(table: Table): void {
    table.columns[this._columnIndex].primary = !table.columns[this._columnIndex].primary;
  }
}

/**
 * Class to change the not null state of a column
 */
export class ChangeColumnNN extends TableCommand {
  private _columnIndex : number;
  constructor(columnIndex : number) {
    super();
    this._columnIndex = columnIndex;
  }

  do(table: Table): void {
    table.columns[this._columnIndex].not_null = !table.columns[this._columnIndex].not_null;
  }

  undo(table: Table): void {
    table.columns[this._columnIndex].not_null = !table.columns[this._columnIndex].not_null;
  }
}

/**
 * Class to change the standart value of the column
 */
export class ChangeColumnStandartValue extends TableCommand {
  private _columnIndex : number;
  private _oldValue : string;
  private _newValue : string;
  constructor(columnIndex : number, oldValue : string, newValue : string) {
    super();
    this._columnIndex = columnIndex;
    this._newValue = newValue;
    this._oldValue = oldValue;
  }

  do(table: Table): void {
    table.columns[this._columnIndex].dflt_value = this._newValue;
  }

  undo(table: Table): void {
    table.columns[this._columnIndex].dflt_value = this._oldValue;
  }
}

/**
 * Class to change the name of the table
 */
export class ChangeTableName extends TableCommand {
  private _oldName : string;
  private _newName: string;
  constructor(oldName : string, newName : string) {
    super();
    this._newName = newName;
    this._oldName = oldName;
  }

  do(table: Table): void {
    table.name = this._newName;
  }

  undo(table: Table): void {
    table.name = this._oldName;
  }
}

/**
 * Class to hold all table commands
 */
export class TableCommandHolder{
  commands : TableCommand[];
}
