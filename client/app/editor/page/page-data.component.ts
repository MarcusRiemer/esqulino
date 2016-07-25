import {Component, Input, OnInit}       from '@angular/core'

import {
    Page, QueryReference, QueryReferenceDescription
} from '../../shared/page/index'

import {Project}                        from '../project.service'

/**
 * Specifying the data that is available to a certain page.
 */
@Component({
    selector: 'esqulino-page-data',
    templateUrl: 'app/editor/page/templates/page-data.html'
})
export class PageDataComponent implements OnInit {
    /**
     * The edited page
     */
    @Input() page : Page;

    /**
     * The edited project
     */
    @Input() project : Project;

    /**
     * The "reference a new query" control uses this as
     * backing Data. Initially this is an empty reference.
     */
    toReference : QueryReferenceDescription = {
        type : "query",
        name : undefined,
        queryId : undefined
    };

    /**
     * Occurs after databinding and catches some common errors.
     */
    ngOnInit() {
        if (!this.page) {
            throw new Error("PageDataComponent doesn't have a page");
        }

        if (!this.project) {
            throw new Error("PageDataComponent doesn't have a project");
        }

        // Set an initial query to show
        this.toReference.queryId = this.project.queries[0].id;
    }

    /**
     * @return Queries that could be referenced by this page.
     */
    get possibleQueries() {
        return (this.project.queries);
    }

    /**
     * @return Queries that are referenced by this page
     */
    get referencedQueries() {
        return (this.page.referencedQueries);
    }

    /**
     * The user has decided to reference a new query. We ensure that
     * the name is actually available and prompt for a new name in case
     * of a name collision.
     */
    onAddQueryReference(ref : QueryReferenceDescription) {
        ref.name = this.project.getQueryById(ref.queryId).name;
        
        // Ensure the name is unique.
        while (this.page.usesQueryReferenceByName(ref.name)) {
            ref.name = prompt("Name schon benutzt! Bitte einen neuen Namen eingeben.", ref.name);
        }
        
        this.page.addQueryReference(ref);
    }
}
