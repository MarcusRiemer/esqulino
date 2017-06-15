import {Injectable,PLATFORM_ID, Inject}        from '@angular/core'
import {isPlatformBrowser, isPlatformServer}   from '@angular/common'
import {Http, Response}                        from '@angular/http';

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
 *
 * TODO: Cleanup code so that these methods rely on each other instead
 *       of constructing the same base-url over and over again.
 */
@Injectable()
export class ServerApiService {
    private _apiBaseUrl : string

    public constructor(@Inject(PLATFORM_ID) private _platformId: Object) {
        this._apiBaseUrl = "/api";
       	if (isPlatformServer(this._platformId)) {
           this._apiBaseUrl = "http://www.blattwerkzeug.de" + this._apiBaseUrl;
	}
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
        return (`${this._apiBaseUrl}/project/${projectId}`);
    }

    /**
     * Retrieves an URL that can be used to run requests
     * where the ID is transfered as part of the body.
     */
    getQueryUrl(projectId : string) : string {
        return (`${this._apiBaseUrl}/project/${projectId}/query/`);
    }

    /**
     * Retrieves an URL that can be used to run requests
     * where the ID is transferred as part of the request string.
     */
    getQuerySpecificUrl(projectId : string, queryId : string) : string {
        return (`${this._apiBaseUrl}/project/${projectId}/query/${queryId}`);
    }

    /**
     * Formats an URL that can be used to run a specific query on the
     * server.
     */
    getSpecificRunQueryUrl(projectId : string, queryId : string) : string {
        return (`${this._apiBaseUrl}/project/${projectId}/query/${queryId}/run`);
    }

    /**
     * Retrieves the URL that is used to run an arbitrary
     * query against a certain project. This may not be allowed by the
     * server if the client is not authorized.
     */
    getRunQueryUrl(projectId : string) : string {
        return (`${this._apiBaseUrl}/project/${projectId}/query/run`);
    }

    /**
     * Retrieves an URL that can be used to create pages.
     *
     * @projectId The ID of the project
     */
    getPageUrl(projectId : string) : string {
        return (`${this._apiBaseUrl}/project/${projectId}/page`);
    }

    /**
     * Retrieves an URL that can be used to access specific pages.
     *
     * @projectId The ID of the project
     * @pageId The ID of the page. Omitted if undefined.
     */
    getPageSpecificUrl(projectId : string, pageId : string) : string {
        if (!pageId) {
            return (this.getPageUrl(projectId));
        } else {
            return (`${this.getPageUrl(projectId)}/${pageId}`);
        }
    }

    /**
     * Retrieves an URL that can be used to render specific pages.
     *
     * @projectId The ID of the project
     * @pageId The ID of the query
     */
    getPageRenderUrl(projectId : string, pageId : string) : string {
        return (this.getPageSpecificUrl(projectId, pageId) + "/render/");
    }

    /**
     * Retrieves an URL that can be used to render arbitrary pages.
     *
     * @projectId The ID of the project
     */
    getArbitraryRenderUrl(projectId : string) : string {
        return (this.getProjectUrl(projectId) + "/render");
    }

    /**
     * Retrieves an URL that can be used to get entries
     * of a table.
     *
     * @projectId The ID of the project
     * @tableName The name of the table
     * @from The first entry to get
     * @amount The amount of entries to get
     */
    getTableEntriesUrl(projectId : string, database_id : string, tableName: string, from : number, amount: number) : string {
        return (this.getProjectUrl(projectId) + `/db/${database_id}/rows/${tableName}/${from}/${amount}`);
    }

    /**
     * Retrieves an URL that can be used to get the amount of 
     * entries inside a table.
     *
     * @projectId The ID of the project
     * @tableName The name of the table
     */
    getTableEntriesCountUrl(projectId : string, database_id : string, tableName: string) : string {
        return (this.getProjectUrl(projectId) + `/db/${database_id}/count/${tableName}`);
    }

    /**
     * Retrieves an URL that can be used to post a TableDescription
     * to create a corresponding table.
     *
     * @projectId The ID of the project
     * @database_id The name of the database
     */
    getCreateTableUrl(projectId : string, database_id : string) : string {
        return (this.getProjectUrl(projectId) + `/db/${database_id}/create`);
    }

    /**
     * Retrieves an URL that can be used to drop a Table
     * inside the database.
     *
     * @projectId The ID of the project
     * @tableName The name of the table
     * @database_id The name of the database
     */
    getDropTableUrl(projectId : string, database_id : string, tableName: string) : string {
        return (this.getProjectUrl(projectId) + `/db/${database_id}/drop/${tableName}`);
    }

    /**
     * Retrieves an URL that can be used to alter a Table
     * inside the database, by sending an array of TableCommands.
     *
     * @projectId The ID of the project
     * @tableName The name of the table to alter
     * @database_id The name of the database
     */
    getTableAlterUrl(projectId : string, database_id : string, tableName: string) : string {
        return (this.getProjectUrl(projectId) + `/db/${database_id}/alter/${tableName}`);
    }
}
