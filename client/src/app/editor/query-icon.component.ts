import { Component, Input } from '@angular/core'

// TODO CLEANUP: Use actual query class
type Query = any

/**
 * Renders a matching icon for a query.
 */
@Component({
  template: '<span class="fa {{ iconForQuery(query) }} fa-fw"></span><ng-template [ngIf]="showName">{{ query?.name }}</ng-template>',
  selector: 'query-icon'
})
export class QueryIconComponent {

  @Input() query: Query;

  @Input() showName = true;

  @Input() detailSelect = false;

  /**
   * @param query The query that needs an icon.
   *
   * @return A Font Awesome CSS icon class
   */
  iconForQuery(query: Query) {
    if (query.delete) {
      return ("fa-ban");
    } else if (query.insert) {
      return ("fa-plus-circle");
    } else if (query.update) {
      return ("fa-pencil");
    } else if (query.select) {
      if (!this.detailSelect) {
        return ("fa-search");
      } else {
        if (query.singleRow) {
          return ("fa-ellipsis-h");
        } else {
          return ("fa-table");
        }
      }
    } else {
      return ("fa-bug");
    }
  }
}
