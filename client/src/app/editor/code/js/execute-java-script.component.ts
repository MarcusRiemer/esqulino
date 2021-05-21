import { Component } from "@angular/core";
import { filter, switchMap } from "rxjs/operators";
import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { executeJavaScriptProgram } from "./execute-java-script";

@Component({
  templateUrl: "./execute-java-script.component.html",
  styleUrls: ["./execute-java-script.component.scss"],
})
export class ExecuteJavaScriptComponent {
  constructor(
    private readonly currentCodeResource: CurrentCodeResourceService
  ) {}

  readonly currentProgram$ = this.currentCodeResource.currentResource.pipe(
    filter((c) => !!c),
    switchMap((c) => c.generatedCode$),
    filter((c) => !!c),
    switchMap((c) => executeJavaScriptProgram(c))
  );
}
