import {
    Component, Input, OnInit, ChangeDetectorRef
} from '@angular/core'

import {Page, QueryReference}            from '../../../shared/page/index'

/**
 * Editing the internal model of esqulino pages
 */
@Component({
    selector: 'esqulino-page-tree',
    templateUrl: 'templates/page-tree.html',
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
