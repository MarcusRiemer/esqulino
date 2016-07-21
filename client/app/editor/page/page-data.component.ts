import {Component, Input, OnInit}       from '@angular/core'

import {Page, ReferencedQuery}          from '../../shared/page/index'

import {Project, AvailableQuery}        from '../project'

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
    toReference : ReferencedQuery = {
        name : undefined,
        queryId : undefined
    };

    /**
     * Caching the used queries as they are dynamically instanciated
     * which doesn't fly well with angular.
     */
    private _usedQueries : AvailableQuery[];
    
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
    get usedQueries() {
        return (this.project.getAvailableQueries(this.page));
    }

    /**
     * Used queries are tracked by the reference to the 
     */
    trackUsedQuery(index : number, avail : AvailableQuery) {
        return (avail.ref);
    }

    /**
     * The user has decided to reference a new query. We ensure that
     * the name is actually available and prompt for a new name in case
     * of a name collision.
     */
    onAddQueryReference(ref : ReferencedQuery) {
        console.log(ref);
        const query = this.project.getQueryById(ref.queryId);

        // Build a new reference. Otherwise the `ReferencedQuery` instance
        // passed to the page will be linked to this editor.
        const newRef : ReferencedQuery = {
            name: query.name,
            queryId : ref.queryId
        }

        // Ensure the name is unique.
        while (this.page.usesQueryName(newRef.name)) {
            newRef.name = prompt("Name schon benutzt! Bitte einen neuen Namen eingeben.", newRef.name);
        }
        
        this.page.addQueryReference(newRef);
    }
}
