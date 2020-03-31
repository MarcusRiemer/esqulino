import { Component, Input } from "@angular/core";

import { Project } from "./project.service";

@Component({
  templateUrl: "templates/navbar.html",
  selector: "editor-navbar",
})
export class NavbarComponent {
  /**
   * The currently edited project
   */
  @Input() project: Project;

  /**
   * @return The name of the database that is currently in use
   */
  get currentDatabaseName() {
    if (this.project) {
      return this.project.currentDatabaseName;
    }
  }
}
