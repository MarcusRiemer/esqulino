import {Schema}                  from '../shared/schema'
import {Query, Model, loadQuery} from '../shared/query'
import {ProjectDescription}      from '../shared/project.description'

import {Page}                    from '../shared/page/page'

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
    
    /**
     * Construct a new project and a whole slew of other
     * objects based on the JSON wire format.
     */
    constructor(json : ProjectDescription) {
        this.id = json.id;
        this.name = json.name;
        this.description = json.description;
        this.schema = new Schema(json.schema);

        // Map all abstract queries to concrete query objects
        this._queries = json.queries.map( val => loadQuery(this.schema, val) );
        this._pages = json.pages.map( val => new Page(val));
    }

    /**
     * @return All available queries, no order guaranteed.
     */
    get queries() {
        return (this._queries);
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
     * @return All available pages, no order guaranteed.
     */
    get pages() {
        return (this._pages);
    }

    /**
     * @return A single query identified by it's ID
     */
    getQueryById(id : string) : Query {
        return (this._queries.find(item => (item.id == id)));
    }

    /**
     * @return A single page identified by it's ID
     */
    getPageById(id : string) : Page {
        return (this._pages.find(item => (item.id == id)));
    }

    /**
     * @return A single query identified by it's ID
     */
    removeQueryById(id : string) {
        const index = this._queries.findIndex( q => q.id === id);

        // Remove at index
        if (index >= 0) {
            this.queries.splice(index, 1);
        }
    }

    toModel() : ProjectDescription {
        return ({
            id : this.id,
            name : this.name,
            description : this.description
        });
    }
}
