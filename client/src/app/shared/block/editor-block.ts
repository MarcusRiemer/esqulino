import { EditorBlockDescription } from "./block.description";

/**
 * Controls how a certain block should be represented in the drag &
 * drop editor.
 */
export class EditorBlock {
  private _description: EditorBlockDescription;

  constructor(desc: EditorBlockDescription) {
    this._description = desc;
  }

  /**
   * The type this block can be used to represent.
   */
  get qualifiedName() {
    return this._description.describedType;
  }

  get visualDescription() {
    return this._description.visual || { blockType: "error" };
  }
}
