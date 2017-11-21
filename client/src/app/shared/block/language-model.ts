import { NodeDescription, Language, QualifiedTypeName, typenameEquals } from '../syntaxtree'

import { SidebarBlock } from './sidebar-block'
import { EditorBlock } from './editor-block'
import { LanguageModelDescription } from './language-model.description'
import { EditorBlockDescription } from './block.description'

/**
 * Augments an existing language with additional information on how to
 * display elements of that languages using blocks.
 */
export class LanguageModel {
  private _language: Language;
  private _sidebarBlocks: SidebarBlock[];
  private _editorBlocks: EditorBlockDescription[] = [];
  private _displayName: string;
  private _id: string;

  constructor(desc: LanguageModelDescription) {
    this._id = desc.id;
    this._displayName = desc.displayName;

    this._language = new Language(desc.language);
    this._sidebarBlocks = desc.sidebarBlocks.map(blockDesc => new SidebarBlock(blockDesc));
    this._editorBlocks = desc.editorBlocks;
  }

  /**
   * @return The unique id of this language
   */
  get id() {
    return (this._id);
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
   * @return All blocks that are available for use in the sidebar.
   */
  get availableSidebarBlocks(): SidebarBlock[] {
    return (this._sidebarBlocks);
  }

  /**
   * @return Types that are present in the language but do not have a
   *         block to augment them.
   */
  get missingEditorBlocks(): QualifiedTypeName[] {
    // This is at least O(n²), but sadly sets do not allow overriding the
    // equality check so for the moment we will hope that our n
    // stays small enough.
    const missing = this._language.availableTypes
      .filter(t => !this._editorBlocks.some(b => t.matchesType(b.describedType)))
      .map(t => t.qualifiedName);

    return (missing);
  }

  /**
   * @return The editor block that may be used to represent the given type.
   */
  getEditorBlock(t: QualifiedTypeName) {
    const toReturn = this._editorBlocks.find(b => typenameEquals(b.describedType, t));
    if (!toReturn) {
      throw new Error(`No known editor for ${JSON.stringify(t)}`);
    }

    return (toReturn);
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
