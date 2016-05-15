import {Injectable}     from '@angular/core';
import {Http, Response} from '@angular/http';


/**
 * The format of error messages the server might return.
 */
export interface RequestErrorDescription {
    message : string;
}

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

    /**
     * Retrieves the URL that is used to list all public projects.
     */
    getProjectListUrl() : string {
        return (`${this._apiBaseUrl}/project`)
    }

    /**
     * Retrieves the URL that uniquely describes a project.
     */
    getProjectUrl(projectId : string) : string {
        return (`/api/project/${projectId}`);
    }

    /**
     * Retrieves an URL that can be used to run requests
     * where the ID is transfered as part of the body.
     */
    getQueryUrl(projectId : string) : string {
        return (`/api/project/${projectId}/query/`);
    }

    /**
     * Retrieves an URL that can be used to run requests
     * where the ID is transferred as part of the request string.
     */
    getQuerySpecificUrl(projectId : string, queryId : string) : string {
        return (`/api/project/${projectId}/query/${queryId}`);
    }

    /**
     * Formats an URL that can be used to run a specific query on the
     * server.
     */
    getSpecificRunQueryUrl(projectId : string, queryId : string) : string {
        return (`/api/project/${projectId}/query/${queryId}/run`);
    }

    /**
     * Retrieves the URL that is used to run a query against a certain project.
     */
    getRunQueryUrl(projectId : string) : string {
        return (`/api/project/${projectId}/query/run`);
    }

    /**
     * Retrieves an URL that can be used to create pages.
     */
    getPageUrl(projectId : string) : string {
        return (`/api/project/${projectId}/page/`);
    }

    /**
     * Retrieves an URL that can be used to create pages.
     */
    getPageSpecificUrl(projectId : string, queryId : string) : string {
        return (`/api/project/${projectId}/page/${queryId}`);
    }
}
