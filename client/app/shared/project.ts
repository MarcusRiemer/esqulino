import {Schema}                  from './schema'
import {Query, Model, loadQuery} from './query'
import {
    ProjectDescription, ApiVersion, ApiVersionToken, CURRENT_API_VERSION
} from './project.description'

import {Page}                    from './page/page'

export {ProjectDescription}

/**
 * A loaded project with editing capatabilities. This is were all
 * information is lumped together.
 */
export class Project implements ApiVersion {
    public id : string;
    public name : string;
    public description : string;
    public schema : Schema;

    private _queries : Query[]
    private _pages : Page[]
    private _indexPageId : string
    private _version : ApiVersionToken
    
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

        if (json.apiVersion as string != this.apiVersion) {
            throw new Error(`Attempted to load a project with version ${json.apiVersion}, current version is ${this.apiVersion}`);
        }

        // Map all abstract queries to concrete query objects
        this._queries = json.queries.map( val => loadQuery(val, this.schema, this) );
        this._pages = json.pages.map( val => new Page(val, this) );
    }

    /**
     * @return The version of this project
     */
    get apiVersion() : ApiVersionToken {
        return (CURRENT_API_VERSION);
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
     * @return True, if a query with the given name is part of this project.
     */
    hasQueryByName(name : string) : boolean {
        return (this._queries.some(query => query.name == name));
    }
    
    /**
     * @return True, if a query with the given id is part of this project.
     */
    hasQueryById(id : string) : boolean {
        return (this._queries.some(query => query.id == id));
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
     * @return True, if a page with this ID is part of this project.
     */
    hasPageById(id : string) : boolean {
        return (this._pages.some(item => (item.id == id)));
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
            apiVersion : this.apiVersion,
            description : this.description,
            indexPageId : this.indexPageId
        });
    }
}
