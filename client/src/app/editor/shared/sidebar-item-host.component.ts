import { Component, Input } from '@angular/core'

/**
 * Wrapper around something that is displayed in the sidebar.
 */
@Component({
  selector: 'sidebar-item-host',
  templateUrl: 'templates/sidebar-item-host.html'
})
export class SidebarItemHost {
  /**
   * A header text to display for this item
   */
  @Input() header: string

  /**
   * Additional classes to show for the `card` element
   */
  @Input() cardClasses: string = "";
}
