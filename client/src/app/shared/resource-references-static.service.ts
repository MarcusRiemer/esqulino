import { Injectable } from '@angular/core'

import { BlockLanguage } from './block';
import { ResourceReferencesService, RequiredResource } from './resource-references.service';
import { GrammarDescription } from './syntaxtree';
import { LanguageService } from './language.service';
import { BlockLanguageDescription } from './block/block-language.description';

/**
 * Provides access to a pre-defined set of resources.
 */
@Injectable()
export class ResourceReferencesStaticService extends ResourceReferencesService {

  private _blockLanguages: { [blockLanguageId: string]: BlockLanguage } = {};

  private _grammars: { [grammarId: string]: GrammarDescription } = {};

  constructor(
    blockLanguages: BlockLanguageDescription[] = [],
    grammars: GrammarDescription[] = [],

  ) {
    super();

    blockLanguages.forEach(b => this._blockLanguages[b.id] = new BlockLanguage(b));
    grammars.forEach(g => this._grammars[g.id] = g);
  }

  getBlockLanguage(id: string, onMissing: "undefined" | "throw") {
    if (!this._blockLanguages[id]) {

      if (onMissing === "throw") {
        throw new Error(`Could not construct block language "${id}" on the fly`);
      } else {
        return (undefined);
      }
    }

    return (this._blockLanguages[id]);
  }

  getGrammarDescription(id: string, onMissing: "undefined" | "throw") {
    const g = this._grammars[id];
    if (!g && onMissing === "throw") {
      throw new Error(`Could not retriebe grammar "${id}" on the fly`);
    } else {
      return (g);
    }
  }

  getCoreProgrammingLanguage(programmingLanguageId: string) {
    return this._languageService.getLanguage(programmingLanguageId);
  }

  async ensureResources(req: RequiredResource | RequiredResource[]) {
    req = this.wrapRequired(req);
    const ensurals = req.map(r => {
      switch (r.type) {
        case "blockLanguage": return Promise.resolve(!!this._blockLanguages[r.id]);
        case "grammar": return Promise.resolve(!!this._grammars[r.id]);
        case "blockLanguageGrammar": return this.ensureBlockLanguageGrammar(r.id);
      }
    });

    const toReturn = await Promise.all(ensurals);
    return (toReturn.every(r => r));
  }

}