import {Component, Input}               from '@angular/core'

import {Query}                          from '../../shared/query'
import {ValidationResult}               from '../../shared/query.validation'

@Component({
    templateUrl: 'app/editor/query/templates/validator.html',
    selector : 'sql-validator'
})
export class ValidatorComponent {
    /**
     * The query to validate
     */
    @Input() query : Query;

    get result() : ValidationResult {
        return (this.query.validate());
    }
}
           
