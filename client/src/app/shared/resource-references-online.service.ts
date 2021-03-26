import { Injectable } from "@angular/core";

import { first, map, tap } from "rxjs/operators";
import { throwError } from "rxjs";

import { FullBlockLanguageGQL, FullGrammarGQL } from "../../generated/graphql";

import {
  ResourceReferencesService,
  RequiredResource,
  RetrievalOptions,
} from "./resource-references.service";
import { LanguageService } from "./language.service";
import { BlockLanguage } from "./block";
import { BlattWerkzeugError } from "./blattwerkzeug-error";

export class ResourceRetrievalError extends BlattWerkzeugError {
  constructor(
    readonly resourceType: "BlockLanguageDescription" | "GrammarDescription",
    readonly id: string,
    readonly retrievalOptions: RetrievalOptions
  ) {
    super(`Error retrieving ${resourceType} "${id}"`);
  }
}

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

  async getBlockLanguage(
    id: string,
    { onMissing = "throw", fetchPolicy = "cache-first" }: RetrievalOptions = {}
  ) {
    if (!this._blockLanguages[id]) {
      await this._blockLanguage
        .fetch({ id }, { fetchPolicy })
        .pipe(
          first(),
          map((res) => {
            const nodes = res.data?.blockLanguages?.nodes ?? [];
            if (nodes.length === 0) {
              switch (onMissing) {
                case "throw":
                  return throwError(
                    new ResourceRetrievalError("BlockLanguageDescription", id, {
                      onMissing,
                      fetchPolicy,
                    })
                  );
                case "undefined":
                  return undefined;
              }
            } else if (nodes.length === 1) {
              const bl = new BlockLanguage(nodes[0]);
              // Nasty: A side effect to store the value for later
              //        This might be a very dumb idea
              this._blockLanguages[bl.id] = bl;
              return bl;
            } else {
              return throwError(
                new BlattWerkzeugError(
                  "Impossible: Got ${nodes.length} results for ID"
                )
              );
            }
          })
        )
        .toPromise();
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
          return this.getBlockLanguage(r.id, { onMissing: "undefined" });
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
