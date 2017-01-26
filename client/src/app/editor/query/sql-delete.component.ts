import {Component, Input}               from '@angular/core'

import {QueryDelete}                    from '../../shared/query'

@Component({
    selector: 'sql-delete',
    templateUrl: 'templates/query-delete.html'
})
export class DeleteComponent {
    @Input() query : QueryDelete;
}
