import { QualifiedTypeName, NodeDescription } from '../syntaxtree'

import { SidebarBlockDescription } from './block.description'

/**
 * This is how a certain type will be made availabe for the user
 * in the sidebar.
 */
export class SidebarBlock {

  private _description: SidebarBlockDescription;

  constructor(desc: SidebarBlockDescription) {
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
   * @return A friendly name that should be displayed to the user.
   */
  get displayName() {
    return (this._description.sidebar.displayName);
  }
}
