import { Component, Input } from '@angular/core'
import { Pipe, PipeTransform } from '@angular/core'

import { Query } from '../../shared/query'

/**
 * Transforms a query into its string expression.
 */
@Pipe({ name: 'sqlString', pure: false })
export class SqlStringPipe implements PipeTransform {
  public transform(value: Query, args: string[]): any {
    try {
      return (value.toSqlString());
    } catch (e) {
      return (`${e}`);
    }
  }
}

@Component({
  selector: 'sql-query',
  templateUrl: 'templates/query.html',
})
export class QueryComponent {
  @Input() query: Query;
}
