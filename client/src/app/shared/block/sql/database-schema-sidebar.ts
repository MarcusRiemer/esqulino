import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Table, Column } from "../../schema";

import { Sidebar } from "../sidebar";
import {
  FixedBlocksSidebarCategoryDescription,
  SidebarBlockDescription,
} from "../block.description";

export function mapColumn(t: Table, c: Column): SidebarBlockDescription {
  // Commonly column names are prefixed with the name of the
  // table. This costs a lot of space in the sidebar, so we
  // hide this convenvention.
  let displayName = c.name;
  if (displayName.startsWith(t.name)) {
    debugger;
    displayName = displayName.substring(t.name.length);

    if (displayName.startsWith("_")) {
      displayName = displayName.substring(1);
    }
  }

  return {
    displayName,
    defaultNode: {
      language: "sql",
      name: "columnName",
      properties: {
        refTableName: t.name,
        columnName: c.name,
      },
    },
  };
}

export function mapTable(t: Table): SidebarBlockDescription[] {
  const tableBlock: SidebarBlockDescription = {
    displayName: t.name,
    defaultNode: {
      language: "sql",
      name: "tableIntroduction",
      properties: {
        name: t.name,
      },
    },
  };

  const columnBlocks = t.columns.map((c) => mapColumn(t, c));

  return [tableBlock, ...columnBlocks];
}

/**
 * Creates sidebar blocks that match a certain SQL database schema.
 */
export class DatabaseSchemaSidebar implements Sidebar {
  constructor(private _schema: Observable<Table[]>) {}

  readonly portalComponentTypeId = "databaseSchema";

  readonly currentBlocks: Observable<FixedBlocksSidebarCategoryDescription> =
    this._schema.pipe(
      map((tables) => ({
        categoryCaption: "SQL Schema",
        blocks: tables.flatMap((t) => mapTable(t)),
      }))
    );
}
