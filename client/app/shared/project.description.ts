/// <reference path="./query.model.ts"/>
/// <reference path="./table.ts"/>

import {Model}    from "./query"
import {Table}    from "./table"

/**
 * The properties of a project that can be queried from the
 * server. Only contains publically visible data, not the
 * password or other private information.
 */
export interface ProjectDescription {
    name : string
    description : string
    id : string
    preview? : string

    schema? : Table[]
    queries? : Model.Query[]
}
