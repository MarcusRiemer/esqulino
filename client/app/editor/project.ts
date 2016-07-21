import {Schema}                  from '../shared/schema'
import {Query, Model, loadQuery} from '../shared/query'
import {ProjectDescription}      from '../shared/project.description'

import {Page, ReferencedQuery}   from '../shared/page/page'

/**
 * A query reference that is ready to be used. This class
 * "glues together" the actual reference inside the page
 * and the actual query that reference points to.
 */
export class AvailableQuery {
    ref : ReferencedQuery
    query : Query
}

/**
 * A loaded project with editing capatabilities. This is were all
 * information is lumped together.
 */
export class Project {
    public id : string;
    public name : string;
    public description : string;
    public schema : Schema;

    private _queries : Query[];
    private _pages : Page[];
    private _indexPageId : string;
    
    /**
     * Construct a new project and a whole slew of other
     * objects based on the JSON wire format.
     */
    constructor(json : ProjectDescription) {
        this.id = json.id;
        this.name = json.name;
        this.description = json.description;
        this._indexPageId = json.indexPageId;
        this.schema = new Schema(json.schema);

        // Map all abstract queries to concrete query objects
        this._queries = json.queries.map( val => loadQuery(this.schema, val) );
        this._pages = json.pages.map( val => new Page(val) );
    }

    /**
     * @return All available queries, no order guaranteed.
     */
    get queries() {
        return (this._queries);
    }

    /**
     * @return All available pages, no order guaranteed.
     */
    get pages() {
        return (this._pages);
    }

    /**
     * @return The id of the index page.
     */
    get indexPageId() {
        return (this._indexPageId);
    }

    /**
     * @param newId The id of the index page.
     */
    set indexPageId(newId : string) {
        this._indexPageId = newId;
    }

    /**
     * Retrieves queries by ID. If any ID does not match exactly
     * one query an exception is thrown.
     *
     * @param ids The requested IDs
     *
     * @return One query for each of the given IDs.
     */
    getQueriesById(ids : string[]) : Query[] {
        const toReturn = this._queries.filter(q => ids.some(id => q.id === id) );

        if (toReturn.length != ids.length) {
            throw new Error(`Found ${toReturn.length} elements, expected ${ids.length}`);
        }

        return (toReturn);        
    }

    /**
     * @return A single query identified by it's ID
     */
    getQueryById(id : string) : Query {
        return (this._queries.find(item => (item.id == id)));
    }

    /**
     * @return All queries (and their names) that are available on the given page.
     */
    getAvailableQueries(page : Page) : AvailableQuery[] {
        return (page.referencedQueries.map(q => {
            return ({
                ref : q,
                query : this.getQueryById(q.queryId)
            })
        }));
    }

    /**
     * Adds a new query to this project.
     *
     * @param query The query to add.
     */
    addQuery(query : Query) {
        this._queries.push(query);
    }

    /**
     * @param id A single query identified by it's ID
     */
    removeQueryById(id : string) {
        const index = this._queries.findIndex( q => q.id === id);

        // Remove at index
        if (index >= 0) {
            this.queries.splice(index, 1);
        }
    }

    /**
     * @return A single page identified by it's ID
     */
    getPageById(id : string) : Page {
        return (this._pages.find(item => (item.id == id)));
    }

    /**
     * @return True, if the given page id is part of this project.
     */
    hasPage(id : string) : boolean {
        return (this._pages.some(page => page.id == id));
    }

    /**
     * @return True, if a page with the given name is part of this project.
     */
    hasPageByName(name : string) : boolean {
        return (this._pages.some(page => page.name == name));
    }

    /**
     * Adds a new page to this project.
     * 
     * @param page The page to add.
     */
    addPage(page : Page) {
        this._pages.push(page);

        // Is this the only page?
        if (this._pages.length == 1) {
            // Then it's the start page
            this._indexPageId = page.id;
        }
    }

    /**
     * @param id A single page identified by it's ID
     */
    removePageById(id : string) {
        const index = this._pages.findIndex(p => p.id === id);

        // Remove at index
        if (index >= 0) {
            this._pages.splice(index, 1);
        }

        // Was this the last page or the index page?
        if (this._pages.length == 0 || this._indexPageId == id) {
            // Then there is no start page anymore
            this._indexPageId = undefined;
        }
    }


    toModel() : ProjectDescription {
        return ({
            id : this.id,
            name : this.name,
            description : this.description,
            indexPageId : this.indexPageId
        });
    }
}
