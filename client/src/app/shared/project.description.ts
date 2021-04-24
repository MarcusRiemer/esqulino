import { MultiLangString } from "./multilingual-string.description";

import { TableDescription } from "./schema/schema.description";
import { GrammarDescription } from "./syntaxtree/grammar.description";
import { CodeResourceDescription } from "./syntaxtree/coderesource.description";
import { BlockLanguageDescription } from "./block/block-language.description";

/**
 * The url-friendly name of the project. May only contain characters that do not
 * mean any trouble in URLs.
 * @pattern ^[a-z0-9\-]{4,}$
 */
export type ProjectSlug = string;

/**
 * The name of the project. May only contain more or less friendly
 * characters.
 * @pattern ^[a-zA-Z0-9 \-_\?äöüÄÖÜß:]{4,}$
 */
export type ProjectName = MultiLangString;

/**
 * The name of a user for a specific project.
 * @pattern ^[a-zA-Z0-9\-_]{4,}$
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
  ProjectSlug: /^[a-z0-9\-]{4,}$/,
  ProjectName: /^[a-zA-Z0-9 \-_\?äöüÄÖÜß]{4,}$/,
};

/**
 * Describes a database that could possibly be used.
 */
export interface AvailableDatabaseDescription {
  type: string;
}

/**
 * Some projects are based on external sources, especially regarding
 * the data in the databases. These references may be used to
 * correctly acknowledge such sources.
 */
export interface ProjectSourceDescription {
  id: string;
  title: string;
  kind: "data";
  url: string;
  readOnly: boolean;

  /**
   * Date & time this resource was created
   */
  createdAt?: string;

  /**
   * Date & time this resource was updated the last time
   */
  updatedAt?: string;
}

/**
 * The properties of a project that can be queried from the
 * server when asking for all available projects.
 *
 * This is a stripped down version of all possibly
 * existing project properties that is used to list available
 * projects.
 */
export interface ProjectListDescription {
  id: string;
  slug?: ProjectSlug;
  name: ProjectName;
  public?: boolean;
  description: MultiLangString;
  preview?: string;
  indexPageId?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

/**
 * The "shallow" properties of a project that do not contain any
 * complicated standalone resources.
 */
export interface ProjectDescription extends ProjectListDescription {
  projectUsesBlockLanguages: ProjectUsesBlockLanguageDescription[];
  grammars: GrammarDescription[];
  projectSources: ProjectSourceDescription[];
}

/**
 * The properties of a project that can be queried from the
 * server when asking for a specific project. This description contains
 * everything that is needed in the normal editor workflow.
 */
export interface ProjectFullDescription extends ProjectDescription {
  codeResources: CodeResourceDescription[];
  defaultDatabase?: {
    id: string;
    name: string;
    schema: TableDescription[];
  };
}

/**
 * A block language that is used by this project.
 */
export interface ProjectUsesBlockLanguageDescription {
  id: string;
  blockLanguageId: string;
}

export function isProjectUsesBlockLanguageDescription(
  value: unknown
): value is ProjectUsesBlockLanguageDescription {
  return (
    typeof value === "object" && "id" in value && "blockLanguageId" in value
  );
}

export type ProjectUpdateUsedBlockLanguage =
  | { blockLanguageId: string }
  | { id: string; _destroy: boolean };

/**
 * These things can be provided when updating the project itself.
 */
export interface ProjectUpdateDescription {
  name?: ProjectName;
  description?: MultiLangString;
  activeDatabase?: string;
  preview?: string;
  indexPageId?: string;
  projectUsesBlockLanguages?: ProjectUpdateUsedBlockLanguage[];
}

/**
 * These parameters are required to create a new project.
 */
export interface ProjectCreationRequest {
  slug: ProjectSlug;
  name: ProjectName;
}
