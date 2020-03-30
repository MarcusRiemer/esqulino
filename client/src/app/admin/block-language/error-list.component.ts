import { Component, Input } from "@angular/core";

import { GeneratorError } from "../../shared/block/generator/error.description";

@Component({
  templateUrl: "templates/error-list.html",
  selector: "error-list",
})
export class ErrorListComponent {
  @Input() public errors: GeneratorError[] = [];

  errorMessage(err: GeneratorError) {
    switch (err.type) {
      case "ParameterMissingValue":
        return `Parameter "${err.name}" muss angegeben werden`;
      default:
        return JSON.stringify(err);
    }
  }
}
