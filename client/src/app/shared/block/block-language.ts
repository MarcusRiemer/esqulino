import { Tree, NodeDescription, Language, QualifiedTypeName, typenameEquals } from '../syntaxtree'

import { FixedBlocksSidebar, FixedBlocksSidebarCategory, FixedSidebarBlock } from './sidebar'
import { EditorBlock } from './editor-block'
import { BlockLanguageDescription } from './block-language.description'
import { EditorBlockDescription } from './block.description'
import * as Forward from './block-language.forward'

/**
 * Augments an existing language with additional information on how to
 * display elements of that languages using blocks.
 */
export class BlockLanguage implements Forward.BlockLanguage {
  private _sidebars: FixedBlocksSidebar[];
  private _editorBlocks: EditorBlockDescription[] = [];
  private _name: string;
  private _id: string;

  constructor(desc: BlockLanguageDescription) {
    this._id = desc.id;
    this._name = desc.name;

    this._sidebars = desc.sidebars.map(sidebarDesc => new FixedBlocksSidebar(this, sidebarDesc));
    this._editorBlocks = desc.editorBlocks;
  }

  /**
   * @return The unique id of this language model
   */
  get id() {
    return (this._id);
  }

  /**
   * @return The user friendly name of this language model
   */
  get name() {
    return (this._name);
  }

  /**
   * @return All sidebars that are defined for this block language.
   */
  get sidebars() {
    return (this._sidebars);
  }

  /**
   * @return True if this block language makes use of multiple sidebars.
   */
  get hasMultipleSidebars() {
    return (this.sidebars.length > 0);
  }

  /**
   * @return Types that are present in the language but do not have a
   *         block to augment them.
   */
  getMissingEditorBlocks(language: Language): QualifiedTypeName[] {
    // This is at least O(n²), but sadly sets do not allow overriding the
    // equality check so for the moment we will hope that our n
    // stays small enough.
    const missing = language.availableTypes
      .filter(t => !this._editorBlocks.some(b => t.matchesType(b.describedType)))
      .map(t => t.qualifiedName);

    return (missing);
  }

  /**
   * @return True, if the given tree can be rendered
   */
  canRenderTree(tree: Tree): boolean {
    const types = Array.from(tree.typesPresent)
      .map(type => JSON.parse(type) as QualifiedTypeName);

    return (types.every(type => this.hasEditorBlock(type)));
  }

  /**
   * @return True, if a editor block is present for the given type
   */
  hasEditorBlock(t: QualifiedTypeName) {
    return (!!this._editorBlocks.find(b => typenameEquals(b.describedType, t)));
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
  constructDefaultNode(language: Language, typeName: QualifiedTypeName): NodeDescription {
    // Construct the barebones description
    const toReturn: NodeDescription = {
      language: typeName.languageName,
      name: typeName.typeName
    };

    // Get hold of the type that is about to be instanciated.
    const t = language.getType(typeName);

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
