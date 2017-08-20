import { Component, Input } from '@angular/core'

import { QueryResult } from '../../shared/query'

@Component({
  templateUrl: 'templates/result.html',
  selector: 'sql-result'
})
export class ResultComponent {
  /**
   * The result to show
   */
  @Input() public result: QueryResult;
}

