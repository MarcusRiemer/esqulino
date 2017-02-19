import { Injectable }                               from '@angular/core'
import { Http, Response, Headers, RequestOptions }  from '@angular/http'

import { BehaviorSubject }                          from 'rxjs/BehaviorSubject'
import { AsyncSubject }                             from 'rxjs/AsyncSubject'
import { Observable }                               from 'rxjs/Observable'

import { ServerApiService }                         from '../shared/serverapi.service'
import { KeyValuePairs, encodeUriParameters }       from '../shared/util'

import { Project }                                  from './project.service'
import { Table, Column }                            from '../shared/schema/'

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


    private handleError(error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error);
    }

}
