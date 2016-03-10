import {Table}              from '../shared/table'
import {Query}              from '../shared/query'
import {ProjectDescription} from '../shared/project.description'

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
            return (new Query(this.schema, val)); 
        });
    }

    public get queries() {
        return (this._queries);
    }
}
