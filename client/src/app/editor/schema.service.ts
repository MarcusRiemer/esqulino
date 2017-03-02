import { Injectable }                               from '@angular/core'
import { Http, Response, Headers, RequestOptions }  from '@angular/http'

import { BehaviorSubject }                          from 'rxjs/BehaviorSubject'
import { AsyncSubject }                             from 'rxjs/AsyncSubject'
import { Observable }                               from 'rxjs/Observable'

import { ServerApiService }                         from '../shared/serverapi.service'
import { KeyValuePairs, encodeUriParameters }       from '../shared/util'

import { Project }                                  from './project.service'
import { Table, Column}                             from '../shared/schema/'
import {TableCommandHolder}                         from '../shared/schema/table-commands'

/**
 * Service to hold, get und send data from a schema.
 */
@Injectable()
export class SchemaService {
    /**
     * @param _http Used to do HTTP requests
     * @param _server Used to figure out paths for HTTP requests
     */
    constructor(
        private _http: Http,
        private _server: ServerApiService
    ) {
    }


    /**
     * Function to get table entries from a table with limit and offset
     * @param project - the current project
     * @param table - the table to get the entries from
     * @param from - the index to start getting the entries from
     * @param amount - the amount of entries to get
     */
    getTableData(project: Project, table: Table, from: number, amount: number) {
        const url = this._server.getTableEntriesUrl(project.id, project.currentDatabaseName, table.name, from, amount);

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        const toReturn = this._http.get(url, options)
            .map((res) => {
                return res.json();
            })
            .catch((res) => this.handleError(res));

        return (toReturn);
    }

    /**
     * Function to get the amount of entries inside a table
     * @param project - the current project
     * @param table - the table to get the entries from
     */
    getTableRowAmount(project: Project, table: Table) {
        const url = this._server.getTableEntriesCountUrl(project.id,project.currentDatabaseName, table.name, );

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        const toReturn = this._http.get(url, options)
            .map((res) => {
                return res.json();
            })
            .catch((res) => this.handleError(res));

        return (toReturn);
    }

    /**
     * Function to save a newly created table inside the database
     * @param project - the current project
     * @param table - the table to create inside the database
     */
    saveNewTable(project : Project, table : Table) : Observable<Table>{
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        const url = this._server.getCreateTableUrl(project.id, project.currentDatabaseName);

        const body = JSON.stringify(table.toModel());

        const toReturn = this._http.post(url, body, options) 
            .map( (res) => {
                project.schema.tables.push(table);
                return table;
            })
            .catch(this.handleError);
        return(toReturn);
    }

    /**
     * Function send table commands to alter a table
     * @param project - the current project
     * @param table - the table alter
     */
    sendAlterTableCommands(project : Project, tableName : string, commandHolder : TableCommandHolder) : Observable<Table>{
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        const url = this._server.getTableAlterUrl(project.id, project.currentDatabaseName, tableName);

        const body = JSON.stringify(commandHolder.toModel());

        const toReturn = this._http.post(url, body, options)
            .catch(this.handleError);
        return(toReturn);
    }

    /**
     * Function to delete a table inside the database
     * @param project - the current project
     * @param table - the table to delete
     */
    deleteTable(project : Project, table : Table) : Observable<Table>{
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        const url = this._server.getDropTableUrl(project.id, project.currentDatabaseName, table.name);

        const toReturn = this._http.delete(url, options) 
            .map( (res) => {
                return table;
            })
            .catch(this.handleError);
        return(toReturn);
    }


    private handleError(error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error);
    }

}
