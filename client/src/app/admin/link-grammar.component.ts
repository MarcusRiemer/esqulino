import { Component, Input } from "@angular/core";

import { map, filter, switchMap, distinctUntilChanged } from "rxjs/operators";

import { AdminListGrammarsGQL } from "../../generated/graphql";
import { BehaviorSubject, Observable, merge } from "rxjs";

/**
 * Creates a link to the grammar with the specified ID. Will attempt to
 * show a nice (human readable) name of the given grammar, but can also
 * gracefully fall back to the ID.
 */
@Component({
  templateUrl: "templates/link-grammar.html",
  selector: "link-grammar",
})
export class LinkGrammarComponent {
  private _grammarId = new BehaviorSubject<string>(undefined);

  readonly grammarId$ = this._grammarId.asObservable();

  @Input()
  set grammarId(newId: string) {
    this._grammarId.next(newId);
  }

  constructor(private _grammarsGQL: AdminListGrammarsGQL) {}

  readonly resolveName$: Observable<string> = this._grammarId.pipe(
    filter((id) => !!id),
    distinctUntilChanged(),
    switchMap(
      (_id) => this._grammarsGQL.watch({}, { errorPolicy: "all" }).valueChanges
    ),
    map((response) => response.data.grammars.nodes),
    filter((grammars) => !!grammars),
    map(
      (grammars) =>
        grammars.find((g) => g.id == this._grammarId.value)?.name ??
        this._grammarId.value
    )
  );

  readonly displayName$: Observable<string> = merge(
    this._grammarId,
    this.resolveName$
  );
}
