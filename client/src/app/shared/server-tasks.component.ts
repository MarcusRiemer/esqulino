import { Component } from "@angular/core";
import { ServerTasksService } from "./serverdata/server-tasks.service";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Component({
  selector: "server-tasks",
  templateUrl: "./templates/server-tasks-button.html",
})
export class ServerTasksComponent {
  constructor(private _serverTasks: ServerTasksService) {}

  readonly allTasks$ = this._serverTasks.publicTasks$.pipe(
    map((list) => list.reverse())
  );

  hasNoTasks(): Observable<boolean> {
    return this._serverTasks.hasNoTasks$;
  }
}
