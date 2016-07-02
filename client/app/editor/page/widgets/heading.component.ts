import {Component, Input, OnInit} from '@angular/core'

import {Heading}                  from '../../../shared/page/widgets/index'

import {SidebarService}           from '../../sidebar.service'

import {WidgetComponent}          from './widget.component'

@Component({
    templateUrl: 'app/editor/page/widgets/templates/heading.html',
    selector: "esqulino-heading",
    inputs: ["model"]
})
export class HeadingComponent extends WidgetComponent<Heading> {
    constructor(_sidebarService : SidebarService) {
        super(_sidebarService);
    }
}
