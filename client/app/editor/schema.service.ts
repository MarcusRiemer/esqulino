import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http'

import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { AsyncSubject } from 'rxjs/AsyncSubject'
import { Observable } from 'rxjs/Observable'

import { ServerApiService } from '../shared/serverapi.service'
import { KeyValuePairs, encodeUriParameters } from '../shared/util'

import { Project } from './project.service'
import { Table, Column} from '../shared/schema'





/**
 * Provides means to communicate with a server that can store or run
 * pages.
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

    getTableData(table: Table, from: number, amount: number) {
        let data: string[] = []
        let dataCol: string[][];
        dataCol = [];
        let anz = from;
        for (var i = 0; i < table.columns.length; i++) {
            for (var j = anz; j < (anz + amount); j++) {
                data.push(j.toString());
            }
            anz = anz + amount;
            dataCol.push(data);
            data = [];
        }
        return (dataCol);
    }

    /**
     * Function to get table entries from a table with limit and offset 
     * (Currently not working!! body has the 2d-array)
     */
    getTableDataDummy(project: Project, table: Table, from: number, amount: number) {
        const url = this._server.getTableEntriesUrl(project.id, table.name, from, amount);

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        const toReturn = this._http.get(url, options)
            .map((res) => {
                let body = res.json();
                return body;
            });
        return (toReturn);
    }

    getTableRowAmount(table: Table): number {
        return (100);
    }


    private handleError(error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error);
    }

}
