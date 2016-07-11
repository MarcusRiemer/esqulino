import {Component, Input}               from '@angular/core'

import {Page}                           from '../../shared/page/index'
import {Row}                            from '../../shared/page/widgets/index'

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

    /**
     * A blueprint is hovering over some row.
     */
    onBlueprintRowDrag(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();
    }

    /**
     * A blueprint row has been dropped.
     */
    onBlueprintRowDrop(evt : DragEvent, index : number) {
        // Indicates we can drop here
        evt.preventDefault();

        // Extract the new expression and append it
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        this.page.addEmptyRow(index);
    }

    /**
     * Starts a drag action for a row that is placed in the layout.
     */
    startRowDrag(evt : DragEvent, row : Row) {
        this._dragService.startRowDrag(evt, "page", row, () => {
            this.page.removeRow(row);
        });
    }

    /**
     * True, if the blueprint for rows should be shown.
     */
    get showBlueprintRow() {
        return (this._dragService.activeRow && this._dragService.activeOrigin == "sidebar");
    }
}
