import {Component, Inject, OnInit} from '@angular/core'

import {QueryTable}               from '../../../../shared/page/widgets/index'

import {SidebarService}           from '../../../sidebar.service'
import {RegistrationService}      from '../../../registration.service'
import {WIDGET_MODEL_TOKEN}       from '../../../editor.token'

import {WidgetComponent}          from '../../widget.component'

@Component({
    templateUrl: 'app/editor/page/tree/widgets/templates/query-table.html',
})
export class QueryTableComponent {    
    constructor(@Inject(WIDGET_MODEL_TOKEN) public model : QueryTable) {

    }
}
