import { Component } from "@angular/core";
import { map, switchMap } from "rxjs/operators";
import { CurrentCodeResourceService } from "../../current-coderesource.service";

@Component({
  selector: "app-execute-java-script",
  templateUrl: "./execute-java-script.component.html",
  styleUrls: ["./execute-java-script.component.scss"],
})
export class ExecuteJavaScriptComponent {
  constructor(
    private readonly currentCodeResource: CurrentCodeResourceService
  ) {}

  readonly currentProgram$ = this.currentCodeResource.currentResource.pipe(
    switchMap((c) => c.generatedCode$),
    map((c) => {
      if (c) {
      } else {
        return "---";
      }
    })
  );
}
