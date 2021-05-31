import { ForeignKeyDescription } from "./schema.description";
import { Table } from "./table";
import { Column, ColumnStatus } from "./column";

import {
  AddColumnDescription,
  AddForeignKeyDescription,
  AlterSchemaRequestDescription,
  ChangeColumnNotNullDescription,
  ChangeColumnPrimaryKeyDescription,
  ChangeColumnStandardValueDescription,
  ChangeColumnTypeDescription,
  ChangeTableNameDescription,
  CommandDescription,
  DeleteColumnDescription,
  RemoveForeignKeyDescription,
  RenameColumnDescription,
  SwitchColumnDescription,
  ConcreteCommand,
} from "./table-commands.description";

/**
 * A collection of classes to implement a redo/undo functiont to the
 * editing of a table. Designed after Command design pattern.
 * The list of commands can be sent to the server, to do the corresponding changes
 * on the server.
 */

/**
 * abstract class for all table commands
 */
export abstract class TableCommand {
  protected _lastStatus: ColumnStatus;
  protected _columnIndex: number;

  /** */
  protected _index: number;

  constructor(lastStatus?: ColumnStatus, columIndex?: number) {
    this._columnIndex = columIndex;
    this._lastStatus = lastStatus;
  }

  /**
   * Function to change the status of the column as changed
   * @param table - the edited table
   */
  markColumnChanged(table: Table): void {
    if (
      table.getColumnByIndex(this._columnIndex).state == ColumnStatus.unchanged
    ) {
      table.getColumnByIndex(this._columnIndex).state = ColumnStatus.changed;
    }
  }

  /**
   * Setter for the index value
   */
  set index(index: number) {
    this._index = index;
  }

  /**
   * Getter for index value
   */
  get index(): number {
    return this._index;
  }

  /**
   * Function with the command what to do by doing it
   * @param table - the edited table
   */
  abstract do(table: Table): void;

  /**
   * Function to undo the command
   * @param table - the edited table
   */
  abstract undo(table: Table): void;

  /**
   * Function to restore the last status of a column
   * @param table - the edited table
   */
  restoreLastStatus(table: Table): void {
    table.getColumnByIndex(this._columnIndex).state = this._lastStatus;
  }

  abstract toModel(): CommandDescription;

  abstract get commandText(): String;
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

  toModel(): AddColumnDescription {
    return {
      type: "addColumn",
      index: this._index,
      columnIndex: this._columnIndex, // is undefined
    };
  }

  get commandText(): String {
    return "Neue Spalte hinzugefügt";
  }
}

/**
 * Class for deleting a column of a table
 */
export class DeleteColumn extends TableCommand {
  constructor(table: Table, columnIndex: number) {
    super(table.getColumnByIndex(columnIndex).state, columnIndex);
  }

  do(table: Table): void {
    table.removeColumn(
      table.columns.indexOf(table.getColumnByIndex(this._columnIndex))
    );
  }

  undo(table: Table): void {
    this.restoreLastStatus(table);
  }

  toModel(): DeleteColumnDescription {
    return {
      type: "deleteColumn",
      index: this._index,
      columnIndex: this._columnIndex,
    };
  }

  get commandText(): String {
    return `Spalte ${this._columnIndex} entfernt`;
  }
}

/**
 * Class for switching the place of a column
 */
export class SwitchColumnOrder extends TableCommand {
  private _to: number;
  private _from: number;
  private _indexOrder: number[] = [];

  constructor(table: Table, columnIndex: number, to: number) {
    super(table.getColumnByIndex(columnIndex).state, columnIndex);
    this._to = to;
    this._from = table.columns.indexOf(table.getColumnByIndex(columnIndex));
  }

  do(table: Table): void {
    this.markColumnChanged(table);
    this.moveColumn(table.columns, this._from, this._to);
    table.columns.map((col) => {
      if (col.state != ColumnStatus.deleted) {
        this._indexOrder.push(col.index);
      }
    });
  }

  undo(table: Table): void {
    this.moveColumn(table.columns, this._to, this._from);
    this.restoreLastStatus(table);
    this._indexOrder.splice(0, this._indexOrder.length);
  }

  private moveColumn(columns: Column[], from: number, to: number) {
    columns.splice(to, 0, columns.splice(from, 1)[0]);
  }

  toModel(): SwitchColumnDescription {
    return {
      type: "switchColumn",
      index: this._index,
      columnIndex: +this._columnIndex,
      indexOrder: this._indexOrder,
    };
  }

  get commandText(): String {
    return `Spalte ${this._columnIndex} von Position ${this._from} nach ${this._to} verschoben`;
  }
}

/**
 * Class to rename a column
 */
export class RenameColumn extends TableCommand {
  private _oldName: string;
  private _newName: string;

  constructor(
    table: Table,
    columnIndex: number,
    oldName: string,
    newName: string
  ) {
    super(table.getColumnByIndex(columnIndex).state, columnIndex);
    this._newName = newName;
    this._oldName = oldName;
  }

  do(table: Table): void {
    table.getColumnByIndex(this._columnIndex).name = this._newName;
    this.markColumnChanged(table);
  }

  undo(table: Table): void {
    table.getColumnByIndex(this._columnIndex).name = this._oldName;
    this.restoreLastStatus(table);
  }

  toModel(): RenameColumnDescription {
    return {
      type: "renameColumn",
      index: this._index,
      columnIndex: +this._columnIndex,
      newName: this._newName,
      oldName: this._oldName,
    };
  }

  get commandText(): String {
    return `Spalte ${this._columnIndex} von ${this._oldName} nach ${this._newName} umbenannt`;
  }
}

/**
 * Class to change the type of a column
 */
export class ChangeColumnType extends TableCommand {
  private _oldType: string;
  private _newType: string;

  constructor(
    table: Table,
    columnIndex: number,
    oldType: string,
    newType: string
  ) {
    super(table.getColumnByIndex(columnIndex).state, columnIndex);
    this._newType = newType;
    this._oldType = oldType;
  }

  do(table: Table): void {
    table.getColumnByIndex(this._columnIndex).type = this._newType;
    this.markColumnChanged(table);
  }

  undo(table: Table): void {
    table.getColumnByIndex(this._columnIndex).type = this._oldType;
    this.restoreLastStatus(table);
  }

  toModel(): ChangeColumnTypeDescription {
    return {
      type: "changeColumnType",
      index: this._index,
      columnIndex: +this._columnIndex,
      newType: this._newType,
      oldType: this._oldType,
    };
  }

  get commandText(): String {
    return `Spalte ${this._columnIndex} Type zu ${this._newType} geaendert`;
  }
}

/**
 * Class to change the primary key state of a column
 */
export class ChangeColumnPrimaryKey extends TableCommand {
  constructor(table: Table, columnIndex: number) {
    super(table.getColumnByIndex(columnIndex).state, columnIndex);
  }

  do(table: Table): void {
    table.getColumnByIndex(this._columnIndex).primary = !table.getColumnByIndex(
      this._columnIndex
    ).primary;
    this.markColumnChanged(table);
  }

  undo(table: Table): void {
    table.getColumnByIndex(this._columnIndex).primary = !table.getColumnByIndex(
      this._columnIndex
    ).primary;
    this.restoreLastStatus(table);
  }

  toModel(): ChangeColumnPrimaryKeyDescription {
    return {
      type: "changeColumnPrimaryKey",
      index: this._index,
      columnIndex: this._columnIndex,
    };
  }

  get commandText(): String {
    return `Spalte ${this._columnIndex} Primaerschluessel Status veraendert`;
  }
}

/**
 * Class to change the not null state of a column
 */
export class ChangeColumnNotNull extends TableCommand {
  constructor(table: Table, columnIndex: number) {
    super(table.getColumnByIndex(columnIndex).state, columnIndex);
  }

  do(table: Table): void {
    table.getColumnByIndex(this._columnIndex).not_null =
      !table.getColumnByIndex(this._columnIndex).not_null;
    this.markColumnChanged(table);
  }

  undo(table: Table): void {
    table.getColumnByIndex(this._columnIndex).not_null =
      !table.getColumnByIndex(this._columnIndex).not_null;
    this.restoreLastStatus(table);
  }

  toModel(): ChangeColumnNotNullDescription {
    return {
      type: "changeColumnNotNull",
      index: this._index,
      columnIndex: this._columnIndex,
    };
  }

  get commandText(): String {
    return `Spalte ${this._columnIndex} Not Null Status veraendert`;
  }
}

/**
 * Class to change the standart value of the column
 */
export class ChangeColumnStandardValue extends TableCommand {
  private _oldValue: string;
  private _newValue: string;

  constructor(
    table: Table,
    columnIndex: number,
    oldValue: string,
    newValue: string
  ) {
    super(table.getColumnByIndex(columnIndex).state, columnIndex);
    this._newValue = newValue;
    this._oldValue = oldValue;
  }

  do(table: Table): void {
    table.getColumnByIndex(this._columnIndex).dflt_value = this._newValue;
    this.markColumnChanged(table);
  }

  undo(table: Table): void {
    table.getColumnByIndex(this._columnIndex).dflt_value = this._oldValue;
    this.restoreLastStatus(table);
  }

  toModel(): ChangeColumnStandardValueDescription {
    return {
      type: "changeColumnStandardValue",
      index: this._index,
      columnIndex: +this._columnIndex,
      newValue: this._newValue,
      oldValue: this._oldValue,
    };
  }

  get commandText(): String {
    return `Spalte ${this._columnIndex} Default Value zu ${this._newValue} geaendert`;
  }
}

export class AddForeignKey extends TableCommand {
  private _newForeignKey: ForeignKeyDescription;
  private _toInsert: ForeignKeyDescription;

  constructor(
    table: Table,
    columnIndex: number,
    foreignKey: ForeignKeyDescription
  ) {
    super(table.getColumnByIndex(columnIndex).state, columnIndex);
    this._newForeignKey = foreignKey;
  }

  do(table: Table): void {
    this._toInsert = { references: [] };
    for (let ref of this._newForeignKey.references.slice(
      0,
      this._newForeignKey.references.length
    )) {
      this._toInsert.references.push({
        fromColumn: ref.fromColumn,
        toColumn: ref.toColumn,
        toTable: ref.toTable,
      });
    }
    table.foreign_keys.push(this._toInsert);
    this.markColumnChanged(table);
  }

  undo(table: Table): void {
    this._toInsert = { references: [] };
    for (let ref of this._newForeignKey.references.slice(
      0,
      this._newForeignKey.references.length
    )) {
      this._toInsert.references.push({
        fromColumn: ref.fromColumn,
        toColumn: ref.toColumn,
        toTable: ref.toTable,
      });
    }
    this._toInsert = table.removeForeignKey(this._toInsert);
    this.restoreLastStatus(table);
  }

  toModel(): AddForeignKeyDescription {
    return {
      type: "addForeignKey",
      index: this._index,
      columnIndex: +this._columnIndex,
      newForeignKey: this._newForeignKey,
    };
  }

  get commandText(): String {
    return `Fremdschluessel für Spalte ${this._columnIndex} zur Tabelle ${this._newForeignKey.references[0].toTable} mit Spalte ${this._newForeignKey.references[0].toColumn} erzeugt`;
  }
}

export class RemoveForeignKey extends TableCommand {
  private _oldForeignKey: ForeignKeyDescription;
  private _toRemove: ForeignKeyDescription;

  constructor(
    table: Table,
    columnIndex: number,
    foreignKey: ForeignKeyDescription
  ) {
    super(table.getColumnByIndex(columnIndex).state, columnIndex);
    this._oldForeignKey = foreignKey;
  }

  do(table: Table): void {
    this._toRemove = { references: [] };
    for (let ref of this._oldForeignKey.references.slice(
      0,
      this._oldForeignKey.references.length
    )) {
      this._toRemove.references.push({
        fromColumn: ref.fromColumn,
        toColumn: ref.toColumn,
        toTable: ref.toTable,
      });
    }
    this._oldForeignKey = table.removeForeignKey(this._toRemove);
    this.markColumnChanged(table);
  }

  undo(table: Table): void {
    this._toRemove = { references: [] };
    for (let ref of this._oldForeignKey.references.slice(
      0,
      this._oldForeignKey.references.length
    )) {
      this._toRemove.references.push({
        fromColumn: ref.fromColumn,
        toColumn: ref.toColumn,
        toTable: ref.toTable,
      });
    }
    table.foreign_keys.push(this._toRemove);
    this.restoreLastStatus(table);
  }

  toModel(): RemoveForeignKeyDescription {
    return {
      type: "removeForeignKey",
      index: this._index,
      columnIndex: +this._columnIndex,
      foreignKeyToRemove: this._oldForeignKey,
    };
  }

  get commandText(): String {
    return `Fremdschluessel für Spalte ${this._columnIndex} zur Tabelle ${this._oldForeignKey.references[0].toTable} mit Spalte ${this._oldForeignKey.references[0].toColumn} entfernt`;
  }
}

/**}'
 * Class to change the name of the table
 */
export class ChangeTableName extends TableCommand {
  private _oldName: string;
  private _newName: string;

  constructor(_table: Table, oldName: string, newName: string) {
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

  toModel(): ChangeTableNameDescription {
    return {
      type: "renameTable",
      index: this._index,
      columnIndex: undefined,
      newName: this._newName,
      oldName: this._oldName,
    };
  }

  get commandText(): String {
    return `Tabelle unbenannt in ${this._newName}`;
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

  get activeIndex() {
    return this._activeIndex;
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
    if (this._activeIndex != this._commands.length - 1) {
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
    newCommand.index = this._activeIndex;
  }

  /**
   * Function to cut all commands that are ahead of the active index
   */
  prepareToSend() {
    if (this._activeIndex < this._commands.length - 1) {
      this._commands.splice(this._activeIndex + 1, this._commands.length);
    }
  }

  /**
   * Function to create a json representation to send it
   * to the server.
   */
  toModel(): AlterSchemaRequestDescription {
    return {
      commands: this.commands.map((val) => val.toModel() as ConcreteCommand),
    };
  }
}
