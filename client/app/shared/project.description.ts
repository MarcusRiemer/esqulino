import {Model}               from "./query"
import {TableDescription}    from "./schema.description"

/**
 * The properties of a project that can be queried from the
 * server when asking for all available projecs.
 * 
 * This is a stripped down version of all possibly
 * existing project properties that is used to list available
 * projects.
 */
export interface ProjectListDescription {
    name : string
    description : string
    id : string
    preview? : string
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
    queries? : Model.QueryDescription[]
}
