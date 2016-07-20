import {Component, Input, OnInit}       from '@angular/core'

import {Page, ReferencedQuery}          from '../../shared/page/index'

import {Project}                        from '../project'

/**
 * Editing the layout of esqulino pages
 */
@Component({
    selector: 'esqulino-page-data',
    templateUrl: 'app/editor/page/templates/page-data.html'
})
export class PageDataComponent implements OnInit {
    @Input() page : Page;

    @Input() project : Project;

    /**
     * The "reference a new query" control uses this as
     * backing Data.
     */
    toReference : ReferencedQuery = {
        name : undefined,
        queryId : undefined
    };
    
    /**
     * Occurs after databinding and catches some common errors.
     */
    ngOnInit() {
        if (!this.page) {
            throw new Error("PageLayoutComponent doesn't have a page");
        }
    }

    /**
     * @return Queries that could be referenced by this page.
     */
    get availableQueries() {
        return (this.project.queries);
    }

    /**
     * The user has decided to reference a new query. We ensure that
     * the name is actually available and prompt for a new name in case
     * of a name collision.
     */
    onAddQueryReference(ref : ReferencedQuery) {
        console.log(ref);
        const query = this.project.getQueryById(ref.queryId);

        const newRef : ReferencedQuery = {
            name: query.name,
            queryId : ref.queryId
        }

        while (this.page.usesQueryName(newRef.name)) {
            newRef.name = prompt("Name schon benutzt! Bitte einen neuen Namen eingeben.", newRef.name);
        }
        
        this.page.addQueryReference(newRef);
    }
}
