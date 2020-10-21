import { ForeignKeyDescription } from "./schema.description";

/**
 * "Over-the-wire" format to describe a command. This is interpreted
 * by the server to actually alter the specified database.
 */
export interface CommandDescription {
  type: string;
  index: number;
  columnIndex?: number;
}

/**
 * This type is a nasty workaround for the JSON schema generation:
 * When specifying a base-type the generator will create a schema
 * that does not include deriving types. So to make these deriving
 * types part of the schema, this explicit mention of all sub-types
 * is used.
 */
export type ConcreteCommand =
  | AddColumnDescription
  | DeleteColumnDescription
  | SwitchColumnDescription
  | RenameColumnDescription
  | ChangeColumnNotNullDescription
  | ChangeColumnPrimaryKeyDescription
  | ChangeColumnStandardValueDescription
  | ChangeColumnTypeDescription
  | ChangeTableNameDescription
  | AddForeignKeyDescription
  | RemoveForeignKeyDescription;
/**
 * A complete request to alter a schema.
 */
export interface AlterSchemaRequestDescription {
  commands: ConcreteCommand[];
}

export interface AddColumnDescription extends CommandDescription {
  type: "addColumn";
}

export interface DeleteColumnDescription extends CommandDescription {
  type: "deleteColumn";
}

export interface SwitchColumnDescription extends CommandDescription {
  type: "switchColumn";
  indexOrder: number[];
}

export interface RenameColumnDescription extends CommandDescription {
  type: "renameColumn";
  oldName: string;
  newName: string;
}

export interface ChangeColumnTypeDescription extends CommandDescription {
  type: "changeColumnType";
  oldType: string;
  newType: string;
}

export interface ChangeColumnPrimaryKeyDescription extends CommandDescription {
  type: "changeColumnPrimaryKey";
}

export interface ChangeColumnNotNullDescription extends CommandDescription {
  type: "changeColumnNotNull";
}

export interface ChangeColumnStandardValueDescription
  extends CommandDescription {
  type: "changeColumnStandardValue";
  oldValue: string;
  newValue: string;
}

export interface ChangeTableNameDescription extends CommandDescription {
  type: "renameTable";
  oldName: string;
  newName: string;
}

export interface AddForeignKeyDescription extends CommandDescription {
  type: "addForeignKey";
  newForeignKey: ForeignKeyDescription;
}

export interface RemoveForeignKeyDescription extends CommandDescription {
  type: "removeForeignKey";
  foreignKeyToRemove: ForeignKeyDescription;
}
