import { TableDescription, ColumnDescription }  from './schema.description'
import { Table }                                from './table'
import { Column, ColumnStatus }                 from './column'

/**
 * A collection of classes to implement a redo/undo functiont to the
 * editing of a table. Designed after Command design pattern.
 * The list of commands can be sent to the server, to do the corresponding changes
 * on the server. 
 */

export interface CommandDescription {
  type : string;
  columnIndex : number;
}

export interface AddColumnDescription extends CommandDescription {
  type : "addColumn";
}

export interface DeleteColumnDescription extends CommandDescription {
  type : "deleteColumn";
}

export interface SwitchColumnDescription extends CommandDescription {
  type : "switchColumn";
  to : number;
}

export interface RenameColumnDescription extends CommandDescription {
  type : "renameColumn";
  oldName : string;
  newName : string;
}

export interface ChangeColumnTypeDescription extends CommandDescription {
  type : "changeColumnType";
  oldType : string;
  newType : string;
}

export interface ChangeColumnPKDescription extends CommandDescription {
  type : "changeColumnPK";
}

export interface ChangeColumnNNDescription extends CommandDescription {
  type : "changeColumnNN";
}

export interface ChangeColumnStandartValueDescription extends CommandDescription {
  type : "changeColumnStandartValue";
  oldValue : string;
  newValue : string;
}

export interface ChangeTableNameDescription extends CommandDescription {
  type : "renameTable";
  oldName : string;
  newName : string;
}

/**
 * abstract class for all table commands
 */
export abstract class TableCommand {
  protected _lastStatus: ColumnStatus;
  protected _columnIndex: number;

  constructor(lastStatus? : ColumnStatus, columIndex? : number) {
    this._columnIndex = columIndex;
    this._lastStatus = lastStatus;
  }

  /**
   * Function with the command what to do by doing it
   * @param table - the edited table
   */
  do(table: Table): void {
    if (table.columns[this._columnIndex].state == 4) {
      table.columns[this._columnIndex].state = 2;
    }
  };

  /**
   * Function to undo the command
   * @param table - the edited table
   */
  undo(table: Table): void {
    table.columns[this._columnIndex].state = this._lastStatus;
  };

  abstract toModel() : CommandDescription;
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

  toModel() : AddColumnDescription {
    return {
      type : "addColumn",
      columnIndex : this._columnIndex
    };
  }
}

/**
 * Class for deleting a column of a table
 */
export class DeleteColumn extends TableCommand {

  constructor(table : Table, columnIndex: number) {
    super(table.columns[columnIndex].state, columnIndex);
    
  }

  do(table: Table): void {
    table.removeColumn(this._columnIndex);
  }

  undo(table: Table): void {
    super.undo(table);
  }

  toModel() : DeleteColumnDescription {
    return {
      type : "deleteColumn",
      columnIndex : this._columnIndex
    };
  }
}

/**
 * Class for switching the place of a column
 */
export class SwitchColumnOrder extends TableCommand {
  private _to: number;

  constructor(table : Table, from: number, to: number) {
    super(table.columns[from].state, from);
    this._to = to;
  }

  do(table: Table): void {
    super.do(table);
    this.moveColumn(table.columns, this._columnIndex, this._to);
  }

  undo(table: Table): void {
    this.moveColumn(table.columns, this._to, this._columnIndex);
    super.undo(table);
  }

  private moveColumn(columns: Column[], from: number, to: number) {
    columns.splice(to, 0, columns.splice(from, 1)[0]);
  }

  toModel() : SwitchColumnDescription {
    return {
      type : "switchColumn",
      columnIndex : this._columnIndex,
      to : this._to
    };
  }
}

/**
 * Class to rename a column
 */
export class RenameColumn extends TableCommand {
  private _oldName: string;
  private _newName: string;

  constructor(table : Table, columnIndex: number, oldName: string, newName: string) {
    super(table.columns[columnIndex].state, columnIndex);
    this._newName = newName;
    this._oldName = oldName
  }

  do(table: Table): void {
    table.columns[this._columnIndex].name = this._newName;
    super.do(table);
  }

  undo(table: Table): void {
    table.columns[this._columnIndex].name = this._oldName;
    super.undo(table);
  }

  toModel() : RenameColumnDescription {
    return{
      type : "renameColumn",
      columnIndex : this._columnIndex,
      newName : this._newName,
      oldName : this._oldName
    };
  }
}

/**
 * Class to change the type of a column
 */
export class ChangeColumnType extends TableCommand {
  private _oldType: string;
  private _newType: string;

  constructor(table : Table, columnIndex: number, oldType: string, newType: string) {
    super(table.columns[columnIndex].state, columnIndex);
    this._newType = newType;
    this._oldType = oldType;
  }

  do(table: Table): void {
    table.columns[this._columnIndex].type = this._newType;
    super.do(table);
  }

  undo(table: Table): void {
    table.columns[this._columnIndex].type = this._oldType;
    super.undo(table);
  }

  toModel() : ChangeColumnTypeDescription {
    return {
      type : "changeColumnType",
      columnIndex : this._columnIndex,
      newType : this._newType,
      oldType : this._oldType
    };
  }
}

/**
 * Class to change the primary key state of a column
 */
export class ChangeColumnPK extends TableCommand {

  constructor(table : Table, columnIndex: number) {
    super(table.columns[columnIndex].state, columnIndex);
  }

  do(table: Table): void {
    table.columns[this._columnIndex].primary = !table.columns[this._columnIndex].primary;
    super.do(table);
  }

  undo(table: Table): void {
    table.columns[this._columnIndex].primary = !table.columns[this._columnIndex].primary;
    super.undo(table);
  }

  toModel() : ChangeColumnPKDescription {

    return{
      type : "changeColumnPK",
      columnIndex : this._columnIndex
    };
  }
}

/**
 * Class to change the not null state of a column
 */
export class ChangeColumnNN extends TableCommand {

  constructor(table : Table, columnIndex: number) {
    super(table.columns[columnIndex].state, columnIndex);
  }

  do(table: Table): void {
    table.columns[this._columnIndex].not_null = !table.columns[this._columnIndex].not_null;
    super.do(table);
  }

  undo(table: Table): void {
    table.columns[this._columnIndex].not_null = !table.columns[this._columnIndex].not_null;
    super.undo(table);
  }

  toModel() : ChangeColumnNNDescription {
    return {
      type : "changeColumnNN",
      columnIndex : this._columnIndex
    }
  }
}

/**
 * Class to change the standart value of the column
 */
export class ChangeColumnStandartValue extends TableCommand {
  private _oldValue: string;
  private _newValue: string;

  constructor(table : Table, columnIndex: number, oldValue: string, newValue: string) {
    super(table.columns[columnIndex].state, columnIndex);
    this._newValue = newValue;
    this._oldValue = oldValue;
  }

  do(table: Table): void {
    table.columns[this._columnIndex].dflt_value = this._newValue;
    super.do(table);
  }

  undo(table: Table): void {
    table.columns[this._columnIndex].dflt_value = this._oldValue;
    super.undo(table);
  }

  toModel() : ChangeColumnStandartValueDescription {

    return{
      type : "changeColumnStandartValue",
      columnIndex : this._columnIndex,
      newValue : this._newValue,
      oldValue : this._oldValue
    };
  }
}

/**
 * Class to change the name of the table
 */
export class ChangeTableName extends TableCommand {
  private _oldName: string;
  private _newName: string;

  constructor(table : Table, oldName: string, newName: string) {
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

  toModel() : ChangeTableNameDescription {
    return {
      type : "renameTable",
      columnIndex : this._columnIndex,
      newName : this._newName,
      oldName : this._oldName
    };
  }
}

/**
 * Class to hold all table commands
 */
export class TableCommandHolder {
  private _activeIndex: number;
  private _commands: TableCommand[];
  private _table: Table;

  constructor(table: Table) {
    this._activeIndex = -1;
    this._commands = [];
    this._table = table;
  }

  get commands() {
    return this._commands;
  }

  /**
   * Function to undo the current command
   */
  undo() {
    if (this._activeIndex >= 0) {
      this._commands[this._activeIndex].undo(this._table);
      this._activeIndex--;
    }
  }

  /**
   * Function to do and add a new command
   * @param newCommand -  the new command to add 
   */
  do(newCommand: TableCommand) {
    newCommand.do(this._table);
    this.addCommand(newCommand);
  }

  /**
   * Function to redo the last undone function
   */
  redo() {
    if (this._activeIndex != (this._commands.length - 1)) {
      this._activeIndex++;
      this._commands[this._activeIndex].do(this._table);
    }
  }

  /**
   * Function to add a new command to the list, while deleting the undone commands ahead
   * @param newCommand -  the new command to add 
   */
  private addCommand(newCommand: TableCommand) {
    if (this._activeIndex < this._commands.length - 1) {
      this._commands.splice(this._activeIndex + 1, this._commands.length);
    }
    this._commands.push(newCommand);
    this._activeIndex = this._commands.length - 1;
  }
}
