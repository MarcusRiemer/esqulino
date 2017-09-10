import { Component, Input } from '@angular/core'

import { SourceDescription } from '../../shared/project.description'

/**
 * Renders a matching icon for a source.
 */
@Component({
  template: '<span class="fa {{ fontAwesomeIcon }} fa-fw"></span>',
  selector: 'source-icon'
})
export class SourceIconComponent {

  @Input() source: SourceDescription;

  /**
   * @return A FontAwesome icon class that matches the type.
   */
  get fontAwesomeIcon() {
    switch (this.source.type) {
      case "data": return "fa-database";
      default: return "fa-bug";
    }
  }
}
