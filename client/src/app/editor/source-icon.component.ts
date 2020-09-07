import { Component, Input } from "@angular/core";

import { ProjectSourceDescription } from "../shared/project.description";

/**
 * Renders a matching icon for a source.
 */
@Component({
  template: '<span class="fa {{ fontAwesomeIcon }} fa-fw"></span>',
  selector: "source-icon",
})
export class SourceIconComponent {
  @Input() source: ProjectSourceDescription;

  /**
   * @return A FontAwesome icon class that matches the type.
   */
  get fontAwesomeIcon() {
    switch (this.source.kind) {
      case "data":
        return "fa-database";
      default:
        return "fa-bug";
    }
  }
}
