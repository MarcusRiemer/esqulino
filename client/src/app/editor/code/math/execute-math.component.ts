import { Component } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { filter, map, shareReplay, switchMap, tap } from "rxjs/operators";
import { allVisualisableTypes } from "../../../shared/syntaxtree/grammar-type-util";
import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { compileMath, executeMath, ResultStep } from "./execute-math";

@Component({
  templateUrl: "./execute-math.component.html",
  styleUrls: ["./execute-math.component.scss"],
})
export class ExecuteMathComponent {
  constructor(
    private readonly currentCodeResource: CurrentCodeResourceService
  ) {}

  readonly currentTree$ = this.currentCodeResource.currentResource.pipe(
    filter((c) => !!c),
    switchMap((c) => c.syntaxTree$)
  );

  readonly currentTypes$ = this.currentCodeResource.blockLanguageGrammar$.pipe(
    map((g) => allVisualisableTypes(g))
  );

  readonly currentInput$ = combineLatest([
    this.currentTree$,
    this.currentTypes$,
    this.currentCodeResource.validationResult,
  ]).pipe(
    filter(([ast, types, result]) => !!ast && !!types && result?.isValid),
    // TODO: Remove this nasty hack that seems to be required because the new
    //       syntax tree is emitted before it is validated.
    filter(([ast, types, _]) => {
      try {
        compileMath(ast, types);
        return true;
      } catch {
        return false;
      }
    }),
    map(([ast, types, _]) => compileMath(ast, types))
  );

  readonly currentResult$: Observable<ResultStep[]> = combineLatest([
    this.currentCodeResource.validationResult,
    this.currentInput$,
  ]).pipe(
    filter(([result, _]) => result.isValid),
    map(([_, input]) => input),
    map((input) => executeMath(input)),
    shareReplay(1)
  );
}
