import {Model}               from "./query"
import {TableDescription}    from "./schema"
import {PageDescription}     from "./page/page.description"
import {
    ApiVersion, ApiVersionToken, CURRENT_API_VERSION
} from "./resource.description"

export {ApiVersion, ApiVersionToken, CURRENT_API_VERSION}

/**
 * The properties of a project that can be queried from the
 * server when asking for all available projecs.
 * 
 * This is a stripped down version of all possibly
 * existing project properties that is used to list available
 * projects.
 */
export interface ProjectListDescription extends ApiVersion {
    name : string
    description : string
    id : string
    preview? : string,
    indexPageId? : string
}


/**
 * The properties of a project that can be queried from the
 * server when asking for a specific project.
 *
 * Only contains publically visible data, not the
 * password or other private information.
 *
 */
export interface ProjectDescription extends ProjectListDescription {
    schema? : TableDescription[]
    availableDatabases? : string[]
    database? : string    
    queries? : Model.QueryDescription[]
    pages? : PageDescription[]
}
