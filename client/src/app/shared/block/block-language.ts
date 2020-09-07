import {
  Tree,
  NodeDescription,
  Language,
  QualifiedTypeName,
  typenameEquals,
} from "../syntaxtree";

import { FixedBlocksSidebar } from "./sidebar-blocks";
import { Sidebar } from "./sidebar";
import {
  BlockLanguageDescription,
  EditorComponentDescription,
} from "./block-language.description";
import { EditorBlockDescription } from "./block.description";
import * as Forward from "./block-language.forward";

import { DatabaseSchemaSidebar } from "./sql/database-schema-sidebar";
import { ProgramUserFunctionsSidebar } from "./truck/program-user-functions-sidebar";
import { MetaDefinedTypesSidebar } from "./meta/meta-defined-types-sidebar";
import { TruckWorldTilesSidebar } from "./truck/truck-world-tiles-sidebar";

/**
 * Augments an existing language with additional information on how to
 * display elements of that languages using blocks.
 */
export class BlockLanguage implements Forward.BlockLanguage {
  private _sidebars: Sidebar[];
  private _editorBlocks: EditorBlockDescription[] = [];
  private _editorComponents: EditorComponentDescription[] = [];
  private _name: string;
  private _id: string;
  private _slug: string;
  private _defaultProgrammingLanguageId: string;
  private _grammarId: string;
  private _rootCssClasses: string[];

  constructor(desc: BlockLanguageDescription) {
    this._id = desc.id;
    this._slug = desc.slug;
    this._name = desc.name;
    this._grammarId = desc.grammarId;
    this._defaultProgrammingLanguageId = desc.defaultProgrammingLanguageId;
    this._editorBlocks = desc.editorBlocks;
    this._editorComponents = desc.editorComponents;
    this._rootCssClasses = desc.rootCssClasses || [];

    this._sidebars = desc.sidebars.map((sidebarDesc) => {
      switch (sidebarDesc.type) {
        case "fixedBlocks":
          return new FixedBlocksSidebar(this, sidebarDesc);
        case "databaseSchema":
          return new DatabaseSchemaSidebar();
        case "truckProgramUserFunctions":
          return new ProgramUserFunctionsSidebar();
        case "metaDefinedTypes":
          return new MetaDefinedTypesSidebar();
        case "truckWorldTiles":
          return new TruckWorldTilesSidebar();
        default:
          throw new Error(`Unknown sidebar type: ${(sidebarDesc as any).type}`);
      }
    });
  }

  /**
   * @return The unique id of this block language
   */
  get id() {
    return this._id;
  }

  /**
   * @return The unique, but readable slug of this block language.
   */
  get slug() {
    return this._slug;
  }

  /**
   * @return The user friendly name of this block language
   */
  get name() {
    return this._name;
  }

  /**
   * @return The grammar that must be used to validate the visualized syntaxtree.
   */
  get grammarId() {
    return this._grammarId;
  }

  /**
   * @return The ID of the default programming language.
   */
  get defaultProgrammingLanguageId() {
    return this._defaultProgrammingLanguageId;
  }

  /**
   * @return The editor components this block language demands.
   */
  get editorComponents(): ReadonlyArray<EditorComponentDescription> {
    return this._editorComponents;
  }

  /**
   * @return All sidebars that are defined for this block language.
   */
  get sidebars(): ReadonlyArray<Sidebar> {
    return this._sidebars;
  }

  /**
   * @return True if this block language makes use of multiple sidebars.
   */
  get hasMultipleSidebars() {
    return this.sidebars.length > 1;
  }

  /**
   * @return The css classes that should be applied at the root
   */
  get rootCssClasses() {
    return this._rootCssClasses;
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
      .filter(
        (t) => !this._editorBlocks.some((b) => t.matchesType(b.describedType))
      )
      .map((t) => t.qualifiedName);

    return missing;
  }

  /**
   * @return True, if the given tree can be rendered
   */
  canRenderTree(tree: Tree): boolean {
    const types = Array.from(tree.typesPresent).map(
      (type) => JSON.parse(type) as QualifiedTypeName
    );

    return types.every((type) => this.hasEditorBlock(type));
  }

  missingVisualBlocks(tree: Tree) {
    const types = Array.from(tree.typesPresent).map(
      (type) => JSON.parse(type) as QualifiedTypeName
    );

    return types.filter((type) => !this.hasEditorBlock(type));
  }

  /**
   * @return True, if a editor block is present for the given type
   */
  hasEditorBlock(t: QualifiedTypeName) {
    return !!this._editorBlocks.find((b) => typenameEquals(b.describedType, t));
  }

  /**
   * @return The editor block that may be used to represent the given type.
   */
  getEditorBlock(t: QualifiedTypeName) {
    const toReturn = this._editorBlocks.find((b) =>
      typenameEquals(b.describedType, t)
    );
    if (!toReturn) {
      throw new Error(`No known editor for ${JSON.stringify(t)}`);
    }

    return toReturn;
  }

  /**
   * Implements the "best effort" guess to construct a node from nothing
   * but a type.
   */
  constructDefaultNode(
    language: Language,
    typeName: QualifiedTypeName
  ): NodeDescription {
    // Construct the barebones description
    const toReturn: NodeDescription = {
      language: typeName.languageName,
      name: typeName.typeName,
    };

    // Get hold of the type that is about to be instanciated.
    const t = language.getType(typeName);

    // Are there any children categories that could be added preemptively?
    const reqCat = t.allowedChildrenCategoryNames;
    if (reqCat.length > 0) {
      toReturn.children = {};
      reqCat.forEach((c) => {
        toReturn.children[c] = [];
      });
    }

    // Are there any properties that could be added preemptively?
    return toReturn;
  }
}
