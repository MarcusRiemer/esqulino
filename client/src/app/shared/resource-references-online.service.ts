import { Injectable } from '@angular/core';

import { ResourceReferencesService, RequiredResource } from './resource-references.service';
import { LanguageService } from './language.service';
import { IndividualBlockLanguageDataService, IndividualGrammarDataService } from './serverdata';
import { BlockLanguage } from './block';

/**
 * Provides access to the most recent state of all resources that are available through
 * the existing data services.
 */
@Injectable()
export class ResourceReferencesOnlineService extends ResourceReferencesService {
  private _blockLanguages: { [blockLanguageId: string]: BlockLanguage } = {};

  constructor(
    private _languageService: LanguageService,
    private _individualBlockLanguageData: IndividualBlockLanguageDataService,
    private _individualGrammarData: IndividualGrammarDataService,
  ) {
    super()
  }

  getBlockLanguage(id: string, onMissing: "undefined" | "throw") {
    if (!this._blockLanguages[id]) {
      const desc = this._individualBlockLanguageData.getLocal(id, "undefined");
      if (!desc) {
        if (onMissing === "throw") {
          throw new Error(`Could not construct block language "${id}" on the fly`);
        } else {
          return (undefined);
        }
      }

      const blockLanguage = new BlockLanguage(desc);
      this._blockLanguages[desc.id] = blockLanguage;
    }

    return (this._blockLanguages[id]);
  }

  getGrammarDescription(id: string, onMissing: "undefined" | "throw") {
    const g = this._individualGrammarData.getLocal(id, "undefined");
    if (!g && onMissing === "throw") {
      throw new Error(`Could not retriebe grammar "${id}" on the fly`);
    } else {
      return (g);
    }
  }

  getCoreProgrammingLanguage(programmingLanguageId: string) {
    return this._languageService.getLanguage(programmingLanguageId);
  }

  async ensureResources(...req: RequiredResource[]) {
    const requests: Promise<any>[] = req.map(r => {
      switch (r.type) {
        case "blockLanguage": return (this._individualBlockLanguageData.getLocal(r.id, "request"));
        case "grammar": return (this._individualGrammarData.getLocal(r.id, "request"));
        case "blockLanguageGrammar": return (this.ensureBlockLanguageGrammar(r.id));
        default: throw new Error(`Unknown resource required: ${r.type}`);
      }
    });

    if (requests.some(v => !v)) {
      console.error("Ensural promise was falsy", req, "=>", requests);
      throw new Error("Ensural promise was falsy");
    }


    const toReturn = await Promise.all(requests);
    if (toReturn.some(v => v === undefined)) {
      console.error("Ensural result was falsy", req, "=>", requests);
      throw new Error("Ensural result was falsy")
    }

    return toReturn.every(v => !!v);
  }
}