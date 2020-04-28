import { Component, ElementRef, ViewChild } from "@angular/core";
import { ServerTaskOverlayService } from "./server-tasks-overlay.service";
import { ServerTasksListComponent } from "./server-tasks-list.component";

@Component({
  selector: "server-tasks",
  templateUrl: "./templates/server-tasks-button.html",
})
export class ServerTasksComponent {
  @ViewChild("taskButton") private _button: ElementRef;

  constructor(private _tasksOverlay: ServerTaskOverlayService) {}

  showTasks() {
    console.log(this._button);
    this._tasksOverlay.open(ServerTasksListComponent, this._button);
  }
}
