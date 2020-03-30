import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";

import { GrammarDescription, GrammarListDescription } from "../syntaxtree";
import { fieldCompare } from "../util";

import { ServerApiService } from "./serverapi.service";
import { DataService } from "./data-service";

import { map } from "rxjs/operators";

/**
 * Convenient and cached access to server side grammar descriptions.
 */
@Injectable()
export class GrammarDataService extends DataService<
  GrammarListDescription,
  GrammarDescription
> {
  public constructor(
    private _serverApi: ServerApiService,
    snackBar: MatSnackBar,
    http: HttpClient
  ) {
    super(http, snackBar, _serverApi.getGrammarListUrl(), "Grammar");
  }

  protected resolveIndividualUrl(id: string): string {
    return this._serverApi.individualGrammarUrl(id);
  }

  /**
   * Grammars in stable sort order.
   *
   * @return All grammars that are known on the server and available for the current user.
   */
  readonly list = this.listCache.value.pipe(
    map((list) => list.sort(fieldCompare<GrammarListDescription>("name")))
  );
}
