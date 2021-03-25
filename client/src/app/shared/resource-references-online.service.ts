import { Injectable } from "@angular/core";

import { FullBlockLanguageGQL, FullGrammarGQL } from "../../generated/graphql";

import {
  ResourceReferencesService,
  RequiredResource,
} from "./resource-references.service";
import { LanguageService } from "./language.service";
import { BlockLanguage } from "./block";
import { first, map } from "rxjs/operators";

/**
 * Provides access to the most recent state of all resources that are available through
 * the existing data services.
 */
@Injectable()
export class ResourceReferencesOnlineService extends ResourceReferencesService {
  private _blockLanguages: { [blockLanguageId: string]: BlockLanguage } = {};

  constructor(
    private _languageService: LanguageService,
    private _blockLanguage: FullBlockLanguageGQL,
    private _grammar: FullGrammarGQL
  ) {
    super();
  }

  async getBlockLanguage(id: string, onMissing: "undefined" | "throw") {
    if (!this._blockLanguages[id]) {
      const blockLanguage = await this._blockLanguage
        .fetch({ id })
        .pipe(
          first(),
          map((res) => res.data.blockLanguages.nodes[0]),
          map((desc) => new BlockLanguage(desc))
        )
        .toPromise();

      this._blockLanguages[blockLanguage.id] = blockLanguage;
    }

    return this._blockLanguages[id];
  }

  getGrammarDescription(id: string, onMissing: "undefined" | "throw") {
    const g = this._grammar
      .fetch({ id })
      .pipe(
        first(),
        map((res) => res.data.grammars.nodes[0])
      )
      .toPromise();

    return g;
  }

  getCoreProgrammingLanguage(programmingLanguageId: string) {
    return this._languageService.getLanguage(programmingLanguageId);
  }

  async ensureResources(...req: RequiredResource[]) {
    const requests: Promise<any>[] = req.map((r) => {
      switch (r.type) {
        case "blockLanguage":
          return this.getBlockLanguage(r.id, "undefined");
        case "grammar":
          return this.getGrammarDescription(r.id, "undefined");
        case "blockLanguageGrammar":
          return this.ensureBlockLanguageGrammar(r.id);
        default:
          throw new Error(`Unknown resource required: ${r.type}`);
      }
    });

    if (requests.some((v) => !v)) {
      console.error("Ensural promise was falsy", req, "=>", requests);
      throw new Error("Ensural promise was falsy");
    }

    const toReturn = await Promise.all(requests);
    if (toReturn.some((v) => v === undefined)) {
      console.error("Ensural result was falsy", req, "=>", requests);
      throw new Error("Ensural result was falsy");
    }

    return toReturn.every((v) => !!v);
  }
}
