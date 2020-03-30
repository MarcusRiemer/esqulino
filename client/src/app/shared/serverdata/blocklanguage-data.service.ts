import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";

import {
  BlockLanguageListDescription,
  BlockLanguageDescription,
} from "../block/block-language.description";

import { ServerApiService } from "./serverapi.service";
import { DataService } from "./data-service";

/**
 * Convenient and cached access to server side grammar descriptions.
 */
@Injectable()
export class BlockLanguageDataService extends DataService<
  BlockLanguageListDescription,
  BlockLanguageDescription
> {
  public constructor(
    private _serverApi: ServerApiService,
    snackBar: MatSnackBar,
    http: HttpClient
  ) {
    super(
      http,
      snackBar,
      _serverApi.getBlockLanguageListUrl(),
      "BlockLanguage"
    );
  }

  protected resolveIndividualUrl(id: string): string {
    return this._serverApi.individualBlockLanguageUrl(id);
  }

  /**
   * Deletes the block language with the given ID.
   */
  deleteBlockLanguage(id: string) {
    this.deleteSingle(id);
  }

  /**
   * Updates the given block language
   */
  updateBlockLanguage(desc: BlockLanguageDescription) {
    this.updateSingle(desc);
  }
}
