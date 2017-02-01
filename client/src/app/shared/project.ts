import {Subject}                              from 'rxjs/Subject'
import {BehaviorSubject}                      from 'rxjs/BehaviorSubject'
import {Observable}                           from 'rxjs/Observable'

import {Schema}                               from './schema/schema'
import {
    Invalidateable, Saveable, SaveStateEvent
} from './interfaces'
import {Query, Model, loadQuery}              from './query'
import {
    ProjectDescription, ApiVersion, ApiVersionToken, CURRENT_API_VERSION
} from './project.description'

import {Page}                                 from './page/page'

export {ProjectDescription}

/**
 * Compares two named things in a case-insensitive manner.
 */
const compareIgnoreCase = (lhs : { name : string }, rhs : { name : string }) => {
    const cmpLhs = lhs.name.toUpperCase();
    const cmpRhs = rhs.name.toUpperCase();

    if (cmpLhs < cmpRhs) {
        return -1;
    } else if (cmpLhs > cmpRhs) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * A loaded project with editing capatabilities. This is were all
 * information is lumped together.
 */
export class Project implements ApiVersion, Saveable {
    public id : string;
    public schema : Schema;

    private _name : string;
    private _description : string;

    private _currentDatabase : string;
    private _availableDatabases : string[];

    private _queries : Query[]
    private _pages : Page[]
    private _indexPageId : string
    private _version : ApiVersionToken

    private _saveRequired = false;

    // Fired when the save-state has changed
    private _saveStateChangedEvent = new BehaviorSubject<SaveStateEvent<Project>>({
        resource : this,
        saveRequired : this._saveRequired
    });
    
    /**
     * Construct a new project and a whole slew of other
     * objects based on the JSON wire format.
     */
    constructor(json : ProjectDescription) {
        this.id = json.id;
        this._name = json.name;
        this._description = json.description;
        this._indexPageId = json.indexPageId;
        this._currentDatabase = json.database;
        this._availableDatabases = json.availableDatabases;
        
        this.schema = new Schema(json.schema);

        if (json.apiVersion as string != this.apiVersion) {
            throw new Error(`Attempted to load a project with version ${json.apiVersion}, current version is ${this.apiVersion}`);
        }

        // Map all abstract queries to concrete query objects
        this._queries = json.queries
            .map( val => loadQuery(val, this.schema, this) )
            .sort((lhs, rhs) => compareIgnoreCase(lhs, rhs));
        this._pages = json.pages
            .map( val => new Page(val, this) )
            .sort((lhs, rhs) => compareIgnoreCase(lhs, rhs));
    }

    /**
     * @return The version of this project
     */
    get apiVersion() : ApiVersionToken {
        return (CURRENT_API_VERSION);
    }

    /**
     * @return True, if this project should be saved
     */
    get isSavingRequired() {
        return (this._saveRequired);
    }

    /**
     * Allows subscription to state-changes for the save event.
     */
    get saveStateChanged() : Observable<SaveStateEvent<Project>> {
        return (this._saveStateChangedEvent);
    }

    /**
     * Signals that this project should be saved.
     */
    markSaveRequired() {
        this._saveRequired = true;
        this.fireCurrentSaveState();
    }

    /**
     * Signals that this project has been saved.
     */
    markSaved() {
        this._saveRequired = false;
        this.fireCurrentSaveState();
    }

        /**
     * Fires the current save state as a new save state. Needs to be called manually
     * after the save-state has actually been changed.
     */
    private fireCurrentSaveState() {
        this._saveStateChangedEvent.next({
            resource : this,
            saveRequired : this._saveRequired
        });
    }

    /**
     * @return The name of this project
     */
    get name() {
        return (this._name);
    }

    /**
     * @param value The name of this project.
     */
    set name(value : string) {
        this._name = value;
        this.markSaveRequired();
    }

    /**
     * @return The description of this project.
     */
    get description() {
        return (this._description);
    }

    /**
     * @param value The description of this project.
     */
    set description(value : string) {
        this._description = value;
        this.markSaveRequired();
    }

    /**
     * @return The name of the currently active database.
     */
    get currentDatabaseName() {
        return (this._currentDatabase);
    }

    /**
     * @param value The name of the currently active database.
     */
    set currentDatabaseName(value : string) {
        this._currentDatabase = value;
        this.markSaveRequired();
    }

    /**
     * @return Names of all databases that are available to this project
     */
    get availableDatabaseNames() {
        if (this._availableDatabases) {
            return (this._availableDatabases);
        } else {
            return ([]);
        }
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
        this.markSaveRequired();
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
        this._queries.sort((lhs, rhs) => compareIgnoreCase(lhs, rhs));
    }

    /**
     * @param id A single query identified by it's ID
     */
    removeQueryById(id : string) {
        const index = this._queries.findIndex( q => q.id === id);

        // Remove at index
        if (index >= 0) {
            this.queries.splice(index, 1);
        } else {
            throw new Error(`Could not remove query with unknown id "${id}"`);
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

        this._pages.sort((lhs, rhs) => compareIgnoreCase(lhs, rhs));
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
        const toReturn : ProjectDescription = {
            id : this.id,
            name : this.name,
            apiVersion : this.apiVersion,
            description : this.description,
            indexPageId : this.indexPageId,
        };

        if (this._currentDatabase) {
            toReturn.database = this._currentDatabase;
        }

        return (toReturn);
    }
}