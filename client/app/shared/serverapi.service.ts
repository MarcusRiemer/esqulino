import {Injectable}     from 'angular2/core';
import {Http, Response} from 'angular2/http';


/**
 * Instead of constructing URLs on the fly, they should be created using
 * this service. It ensures that the server actually provides the
 * capatabilities to respond to the request, abstracts away the concrete
 * URL to call and can do some basic parameter checks.
 */
@Injectable()
export class ServerApiService {
    private _apiBaseUrl : string

    
    constructor() {
        this._apiBaseUrl = "/api";
    }

    get projectListUri() : string {
        return (`${this._apiBaseUrl}/project`)
    }
}
