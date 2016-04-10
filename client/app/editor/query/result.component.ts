import {Component, Input}               from 'angular2/core'

import {QuerySelect, Model}                   from '../../shared/query'

@Component({
    templateUrl: 'app/editor/query/templates/result.html',
    selector : 'sql-result'
})
export class ResultComponent {
    /**
     * The result to show
     */
    @Input() public result : QuerySelect;
}
           
