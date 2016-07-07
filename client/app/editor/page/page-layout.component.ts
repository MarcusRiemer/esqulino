import {Component, Input}               from '@angular/core'

import {Page}                           from '../../shared/page/index'

import {SidebarService}                 from '../sidebar.service'

import {WidgetLoaderComponent}          from './widget-loader.component'
/**
 * Editing the layout of esqulino pages
 */
@Component({
    selector: 'esqulino-page-layout',
    templateUrl: 'app/editor/page/templates/page-layout.html',
    directives: [WidgetLoaderComponent]
})
export class PageLayoutComponent {
    @Input() page : Page;

    constructor(
        private _sidebarService : SidebarService
    ) {}
    
    
}
