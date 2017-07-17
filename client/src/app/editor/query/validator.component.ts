import { Component, Input } from '@angular/core'

import { Query } from '../../shared/query'
import { ValidationResult } from '../../shared/query/validation'

@Component({
  templateUrl: 'templates/validator.html',
  selector: 'sql-validator'
})
export class ValidatorComponent {
  /**
   * The query to validate
   */
  @Input() query: Query;

  get result(): ValidationResult {
    if (this.query) {
      return (this.query.validate());
    } else {
      return (undefined);
    }
  }
}

