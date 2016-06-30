import {Component, Input}               from '@angular/core'

import {SelectQueryResult}                    from '../../shared/query.result'

@Component({
    templateUrl: 'app/editor/query/templates/result.html',
    selector : 'sql-result'
})
export class ResultComponent {
    /**
     * The result to show
     */
    @Input() public result : SelectQueryResult;
}
           
