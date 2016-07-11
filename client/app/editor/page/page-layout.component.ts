import {Component, Input}               from '@angular/core'

import {Page}                           from '../../shared/page/index'

import {SidebarService}                 from '../sidebar.service'

import {DragService, PageDragEvent}     from './drag.service'
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
        private _sidebarService : SidebarService,
        private _dragService : DragService
    ) {}

    onBlueprintRowDrag(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();
    }

    onBlueprintRowDrop(evt : DragEvent, index : number) {
        // Indicates we can drop here
        evt.preventDefault();

        // Extract the new expression and append it
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        this.page.addRow(index);
    }

    /**
     * True, if the blueprint for rows should be shown.
     */
    get showBlueprintRow() {
        return (this._dragService.activeRow);
    }
}
