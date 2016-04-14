import {Table}                   from '../shared/table'
import {Query, Model, loadQuery} from '../shared/query'
import {ProjectDescription}      from '../shared/project.description'

/**
 * A project with editing capatabilities.
 */
export class Project {
    public id : string;
    public name : string;
    public description : string;
    public schema : Table[];

    private _queries : Query[];

    /**
     * Construct a new project and a whole slew of other
     * objects based on the JSON wire format.
     */
    constructor(json : ProjectDescription) {
        this.id = json.id;
        this.name = json.name;
        this.description = json.description;
        this.schema = json.schema;

        // Map all abstract queries to concrete query objects
        this._queries = json.queries.map( val => {
            return (loadQuery(this.schema, val));
        });
    }

    /**
     * @return All available queries, with no guaranteed order.
     */
    get queries() {
        return (this._queries);
    }

    /**
     * @return A single query identified by it's ID
     */
    getQueryById(id : string) : Query {
        return (this._queries.find(item => {
            return (item.id == id);
        }));
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
