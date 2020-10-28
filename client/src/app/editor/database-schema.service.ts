import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";

import { ProjectService } from "./project.service";

/**
 * Service to hold, get and send data from a schema.
 */
@Injectable({
  providedIn: "root",
})
export class DatabaseSchemaService {
  constructor(private _projectService: ProjectService) {}

  readonly currentSchema = this._projectService.activeProject.pipe(
    map((p) => p.schema),
    map((s) => s.tables)
  );
}
