import { Component } from "@angular/core";
import { ServerTaskOverlayService } from "./server-tasks-overlay.service";
import { ServerTasksOverlayComponent } from "./server-tasks-overlay.component";

@Component({
  selector: "server-tasks",
  templateUrl: "./templates/server-tasks.html",
})
export class ServerTasksComponent {
  constructor(private _tasksOverlay: ServerTaskOverlayService) {}

  showTasks(event) {
    this._tasksOverlay.open(ServerTasksOverlayComponent, event);
  }
}
