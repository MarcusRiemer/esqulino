import { QualifiedTypeName, NodeDescription } from '../syntaxtree'

import { BlockDescription } from './block.description'

/**
 * Controls how a certain type should be presented to the user.
 */
export class Block {

  private _description: BlockDescription;

  constructor(desc: BlockDescription) {
    this._description = desc;
  }

  /**
   * @return The node that should be created when this block
   *         needs to be instanciated.
   */
  get defaultNode(): NodeDescription {
    return (this._description.defaultNode);
  }

  /**
   * @return The fully qualified name that this block describes.
   */
  get qualifiedName() {
    return (this._description.describedType);
  }
}
