import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Sidebar } from "../sidebar";
import { FixedBlocksSidebarCategoryDescription } from "../block.description";
import { Table } from "../../schema";

@Injectable()
export class DatabaseSchemaSidebar implements Sidebar {
  constructor(private _schema: Observable<Table[]>) {}

  readonly portalComponentTypeId = "databaseSchema";

  readonly currentBlocks: Observable<
    FixedBlocksSidebarCategoryDescription
  > = this._schema.pipe(
    map((tables) => {
      return {
        categoryCaption: "Test",
        blocks: [
          {
            displayName: "Test",
            defaultNode: {
              language: "sql",
              name: "tableIntroduction",
              properties: {
                name: "test_table",
              },
            },
          },
          {
            displayName: "Test",
            defaultNode: {
              language: "sql",
              name: "tableIntroduction",
              properties: {
                name: "test_table_2",
              },
            },
          },
        ],
      };
    })
  );
}
