import { LanguageDescription } from '../syntaxtree'

import { SidebarBlockDescription, EditorBlockDescription } from './block.description'

/**
 * Augments a language with information about the UI layer.
 */
export interface LanguageModelDescription {
  /**
   * The internal ID of this language model.
   */
  id: string;

  /**
   * The name that should be displayed to the user.
   */
  name: string;

  /**
   * The actual language that is augmented.
   */
  language: LanguageDescription;

  /**
   * All blocks that should be shown in the sidebar.
   */
  sidebarBlocks: SidebarBlockDescription[];

  /**
   * How blocks should be represented in the drag & drop editor.
   */
  editorBlocks: EditorBlockDescription[];
}
