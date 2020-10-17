import { TestBed } from "@angular/core/testing";

import { DatabaseSchemaService } from "../../../editor/database-schema.service";

import { DatabaseSchemaSidebar } from "./database-schema-sidebar";

describe(`DatabaseSchemaSidebarService`, () => {
  function instantiate() {
    TestBed.configureTestingModule({
      imports: [],
      providers: [DatabaseSchemaService, DatabaseSchemaSidebar],
      declarations: [],
    });

    return {
      service: TestBed.inject(DatabaseSchemaSidebar),
    };
  }

  it(`can be instantiated`, () => {});
});
