import { EditorComponentDescription } from '../block-language.description';

/**
 * These components are assumed to be part of every editor.
 */
export const defaultEditorComponents: EditorComponentDescription[] = [
  {
    "componentType": "block-root"
  },
  {
    "componentType": "validator"
  },
  {
    "componentType": "generated-code"
  }
]