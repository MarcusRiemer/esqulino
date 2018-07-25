import { SidebarDescription, EditorBlockDescription } from './block.description'
import { BlockLanguageGeneratorDocument } from './generator/generator.description';

/**
 * Augments a language with information about the UI layer. This definition is
 * used by the editors, especially the block editor, to show customized editors
 * for different languages. These customizations include:
 *
 * * The blocks that are shown in the sidebar.
 * * Possibly language specific sidebars.
 * * Definitions of the actual blocks.
 * * Possibly language specific editor components.
 */
export interface BlockLanguageDescription extends BlockLanguageDocument, BlockLanguageListDescription {

}

/**
 * Superficial information about a block language, usually used when loads of
 * block languages are queried together.
 */
export interface BlockLanguageListDescription {
  /**
   * The internal ID of this language model.
   */
  id: string;

  /**
   * The name that should be displayed to the user.
   */
  name: string;

  /**
   * A unique (but possibly empty) id. If this is undefined the language has
   * no builtin counterpart on the client.
   */
  slug?: string;

  /**
   * The programming language this block language uses by default.
   */
  defaultProgrammingLanguageId: string;

  /**
   * The ID of the block language that may have been used to generate this
   * block language.
   */
  blockLanguageGeneratorId?: string;

  /**
   * The grammar that this block language may visualize.
   */
  grammarId?: string;

  /**
   * Date & time this resource was created
   */
  createdAt?: string;

  /**
   * Date & time this resource was updated the last time
   */
  updatedAt?: string;
}

/**
 * Any component that could be displayed in the actual editor view.
 */
export type EditorComponentDescription = QueryPreviewComponentDescription;

/**
 * Basic properties for all editor components
 */
export interface BaseEditorComponentDescription {

}

/**
 * 
 */
export interface QueryPreviewComponentDescription extends BaseEditorComponentDescription {
  componentType: "query-preview"
}

/**
 * The data about a language model that is stored in the database
 */
export interface BlockLanguageDocument {
  /**
   * How the available blocks should be represented in the sidebar.
   */
  sidebars: SidebarDescription[];

  /**
   * How blocks should be represented in the drag & drop editor.
   */
  editorBlocks: EditorBlockDescription[];

  /**
   * Specialised components that should be shown for this block
   * language.
   */
  editorComponents: EditorComponentDescription[];

  /**
   * Information on how to (re)-generate this block language.
   */
  localGeneratorInstructions?: BlockLanguageGeneratorDocument
}
