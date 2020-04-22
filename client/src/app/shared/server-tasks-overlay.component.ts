import {
  FailedServerTask,
  PendingServerTask,
  PublicServerTask,
  ServerTasksService,
  SucceededServerTask,
} from "./serverdata/server-tasks.service";
import { Component } from "@angular/core";
import { Observable } from "rxjs";

@Component({
  selector: "server-tasks-list",
  templateUrl: "./templates/server-tasks-overlay.html",
  styles: [".mat-list-base {padding-top: 0;}"],
})
export class ServerTasksOverlayComponent {
  constructor(private _serverTasks: ServerTasksService) {}

  readonly allTasks$ = this._serverTasks.publicTasks$;

  hasNoTasks(): Observable<boolean> {
    return this._serverTasks.hasNoTasks$;
  }
}
