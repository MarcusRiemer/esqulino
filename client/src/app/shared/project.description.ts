import { Model } from "./query"
import { TableDescription } from "./schema"
import { PageDescription } from "./page/page.description"
import {
  ApiVersion, ApiVersionToken, CURRENT_API_VERSION
} from "./resource.description"

export { ApiVersion, ApiVersionToken, CURRENT_API_VERSION }

/**
 * The name of the project. May only contain characters that do not
 * mean any trouble in URLs.
 * @pattern ^[a-z0-9\-]{4,}$
 */
export type ProjectId = string;

/**
 * The name of the project. May only contain more or less friendly
 * characters.
 * @pattern ^[a-z0-9 \-_]{4,}$
 */
export type ProjectName = string;

/**
 * The name of a user for a specific project.
 * @pattern ^[a-z0-9\-_]{4,}$
 */
export type ProjectUserName = string;

/**
 * The password of a user for a specific project.
 * @minlength 4
 */
export type ProjectUserPassword = string;

/**
 * Regular expressions to test various project properties for validity.
 * These must correspond to the regexes used in the type definitions
 * above.
 */
export const StringValidator = {
  ProjectId: /^[a-z0-9\-]{4,}$/,
  ProjectName: /^[a-z0-9 \-_]{4,}$/,
  ProjectUserName: /^[a-z0-9\-_]{4,}$/,
  ProjectUserPassword: /^.{4,}$/
};

/**
 * The properties of a project that can be queried from the
 * server when asking for all available projecs.
 * 
 * This is a stripped down version of all possibly
 * existing project properties that is used to list available
 * projects.
 */
export interface ProjectListDescription extends ApiVersion {
  id: ProjectId
  name: ProjectName
  description: string
  preview?: string,
  indexPageId?: string
}

/**
 * Describes a database that could possibly be used.
 */
export interface AvailableDatabaseDescription {
  type: string
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
  schema?: TableDescription[]
  availableDatabases?: { [id: string]: AvailableDatabaseDescription }
  activeDatabase?: string
  queries?: Model.QueryDescription[]
  pages?: PageDescription[]
}

/**
 * These things can be provided when updating the project itself.
 */
export interface ProjectUpdateDescription extends ApiVersion {
  name: ProjectName
  description: string
  preview?: string
  indexPageId?: string
}

/**
 * These parameters are required to create a new project.
 */
export interface ProjectCreationDescription extends ApiVersion {
  id: ProjectId
  name: ProjectName

  admin: {
    /**
     * @minlength 4
     */
    name: string

    /**
     * @minlength 4
     */
    password: string
  }
  dbType: "sqlite3"
  basedOn?: string
}
