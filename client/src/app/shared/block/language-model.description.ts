import { SidebarBlockDescription, EditorBlockDescription } from './block.description'

/**
 * Augments a language with information about the UI layer.
 */
export interface LanguageModelDescription extends LanguageModelDocument {
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
 * 
 * @todo Move this into a better fitting place
 */
export interface LanguageModelDocument {
  /**
   * All blocks that should be shown in the sidebar.
   */
  sidebarBlocks: SidebarBlockDescription[];

  /**
   * How blocks should be represented in the drag & drop editor.
   */
  editorBlocks: EditorBlockDescription[];
}
