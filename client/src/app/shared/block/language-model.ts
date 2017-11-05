import { NodeDescription, Language, QualifiedTypeName, typenameEquals } from '../syntaxtree'

import { Block } from './block'
import { LanguageModelDescription } from './language-model.description'

/**
 * Augments an existing language with additional information on how to
 * display elements of that languages using blocks.
 */
export class LanguageModel {
  private _language: Language;
  private _blocks: Block[];
  private _displayName: string;
  private _id: string;

  constructor(desc: LanguageModelDescription) {
    this._id = desc.id;
    this._displayName = desc.displayName;

    this._language = new Language(desc.language);
    this._blocks = desc.blocks.map(blockDesc => new Block(blockDesc));
  }

  /**
   * @return The user friendly name of this language model
   */
  get displayName() {
    return (this._displayName);
  }

  /**
   * @return The name of the language this model is augmenting
   */
  get languageName() {
    return (this._language.name);
  }

  /**
   * @return All blocks that are available.
   */
  get availableBlocks(): Block[] {
    return (this._blocks);
  }

  /**
   * @return Types that are present in the language but do not have a
   *         block to augment them.
   */
  get missingBlocks(): QualifiedTypeName[] {
    // This is at least O(n²), but sadly sets do not allow overriding the
    // equality check so for the moment we will hope that our n
    // stays small enough.
    const missing = this._language.availableTypes
      .filter(t => !this._blocks.some(b => t.matchesType(b.qualifiedName)))
      .map(t => t.qualifiedName);

    return (missing);
  }

  /**
   * Implements the "best effort" guess to construct a node from nothing
   * but a type.
   */
  constructDefaultNode(typeName: QualifiedTypeName): NodeDescription {
    // Construct the barebones description
    const toReturn: NodeDescription = {
      language: typeName.languageName,
      name: typeName.typeName
    };

    // Get hold of the type that is about to be instanciated.
    const t = this._language.getType(typeName);

    // Are there any children categories that could be added preemptively?
    const reqCat = t.requiredChildrenCategoryNames;
    if (reqCat.length > 0) {
      toReturn.children = {};
      reqCat.forEach(c => {
        toReturn.children[c] = [];
      });
    }

    // Are there any properties that could be added preemptively?
    return (toReturn);
  }
}
