import {Component, Input}               from '@angular/core'

import {Query}                          from '../../shared/query'

@Component({
    selector: 'sql-delete',
    templateUrl: 'templates/query-delete.html'
})
export class DeleteComponent {
    @Input() query : Query;
}
