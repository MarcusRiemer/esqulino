import { SidebarBlockDescription, FixedBlocksSidebarDescription, EditorBlockDescription } from './block.description'

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
}

/**
 * The data about a language model that is stored in the database
 */
export interface BlockLanguageDocument {

  /**
   * How the available blocks should be represented in the sidebar.
   */
  sidebars: FixedBlocksSidebarDescription[];

  /**
   * How blocks should be represented in the drag & drop editor.
   */
  editorBlocks: EditorBlockDescription[];
}
