import {
    Component, Input, OnInit, ChangeDetectorRef
} from '@angular/core'

import {Page, QueryReference}            from '../../../shared/page/index'

import {WidgetNode}                      from './widget-node.component'

/**
 * Editing the internal model of esqulino pages
 */
@Component({
    selector: 'esqulino-page-tree',
    templateUrl: 'app/editor/page/tree/templates/page-tree.html',
    directives: [WidgetNode]
})
export class PageTreeComponent implements OnInit {
    @Input() page : Page;

    /**
     * Occurs after databinding and catches some common errors.
     */
    ngOnInit() {
        if (!this.page) {
            throw new Error("PageTreeComponent doesn't have a page");
        }
    }
}
