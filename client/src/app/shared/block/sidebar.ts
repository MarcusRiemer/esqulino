import { Observable } from "rxjs";

import {
  SidebarDescription,
  FixedBlocksSidebarCategoryDescription,
} from "./block.description";

/**
 * Base interface for everything sidebar related.
 */
export interface Sidebar {
  /**
   * The id for the component that needs to be instantiated for this sidebar.
   */
  readonly portalComponentTypeId: SidebarDescription["type"];

  /**
   * If the sidebar provides blocks in a standard way, they can be
   * obtained via this property.
   */
  readonly currentBlocks?: Observable<FixedBlocksSidebarCategoryDescription>;
}
