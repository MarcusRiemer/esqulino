import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { DatabaseSchemaService } from "../../../editor/database-schema.service";

import { Sidebar } from "../sidebar";
import { FixedBlocksSidebarCategoryDescription } from "../block.description";

@Injectable()
export class DatabaseSchemaSidebar implements Sidebar {
  constructor(private _dbSchema: DatabaseSchemaService) {}

  readonly portalComponentTypeId = "databaseSchema";

  readonly currentBlocks: Observable<
    FixedBlocksSidebarCategoryDescription
  > = this._dbSchema?.currentSchema.pipe(
    map((tables) => {
      return {
        categoryCaption: "Test",
        blocks: [],
      };
    })
  );
}
