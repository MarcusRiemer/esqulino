import { SidebarDescription, EditorBlockDescription } from './block.description'

/**
 * Augments a language with information about the UI layer.
 */
export interface BlockLanguageDescription extends BlockLanguageDocument {
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
   * Date & time this resource was created
   */
  createdAt?: string;

  /**
   * Date & time this resource was updated the last time
   */
  updatedAt?: string;
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
   * The programming language this block language uses by default.
   */
  defaultProgrammingLanguage: string;
}
