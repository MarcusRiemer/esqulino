import { SidebarDescription } from "./block.description";

/**
 * Base interface for everything sidebar related.
 */
export interface Sidebar {
  /**
   * The id for the component that needs to be instantiated for this sidebar.
   */
  readonly portalComponentTypeId: SidebarDescription["type"];
}
