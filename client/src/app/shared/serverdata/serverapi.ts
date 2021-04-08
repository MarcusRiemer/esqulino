/**
 * Instead of constructing URLs on the fly, they should be created using
 * this service. It ensures that the server actually provides the
 * capatabilities to respond to the request, abstracts away the concrete
 * URL to call and can do some basic parameter checks.
 *
 * This file is manually kept in sync with the rails route definitions
 * at `server/config/routes.rb`.
 *
 * TODO: Once the GraphQL migration is complete, this file is irrelevant.
 */
export class ServerApi {
  protected static BASE_HOST = "http://www.blattwerkzeug.de";

  public constructor(protected _apiBaseUrl: string) {}

  /**
   * Retrieves the URL that is used to sign in
   */
  getSignInUrl(provider: string): string {
    return `${this._apiBaseUrl}/auth/${provider}`;
  }

  /**
   * Retrieves the URL that is used to sign in with password
   */
  getUserDataUrl(): string {
    return `${this._apiBaseUrl}/user`;
  }

  /**
   * Retrieves the URL that is used to list all linked identities
   */
  getUserIdentitiesUrl(): string {
    return `${this._apiBaseUrl}/identities`;
  }

  /**
   * Retrieves the URL that is used to list all available providers
   */
  getProvidersUrl(): string {
    return `${this._apiBaseUrl}/identities/list`;
  }

  /**
   * Retrieves the URL that is used to sign out
   */
  getSignOutUrl(): string {
    return `${this._apiBaseUrl}/auth/sign_out`;
  }

  /**
   * Retrieves the URL that is used to check ui elements
   */
  getMayPerformUrl(): string {
    return `${this._apiBaseUrl}/user/may_perform`;
  }

  /**
   * Retrieves a specific schema
   */
  individualJsonSchemaUrl(name: string): string {
    return `${this._apiBaseUrl}/json_schema/${name}`;
  }

  /**
   * Retrieves the full description of a specific block language.
   */
  individualBlockLanguageUrl(id: string): string {
    return `${this._apiBaseUrl}/block_languages/${id}`;
  }

  /**
   * Retrieves the URL that accepts uploaded databases
   */
  uploadDatabase(projectId: string, dbId: string) {
    return `${this._apiBaseUrl}/project/${projectId}/db/${dbId}/upload`;
  }

  /**
   * Retrieves the URL that allows database download
   */
  downloadDatabase(projectId: string, dbId: string) {
    return `${this._apiBaseUrl}/project/${projectId}/db/${dbId}/download`;
  }

  /**
   * Retrieves the URL that accepts data that is uploaded to databases
   */
  uploadTabularData(projectId: string, dbId: string, dbTable: string) {
    return `${this._apiBaseUrl}/project/${projectId}/db/${dbId}/data/${dbTable}/bulk-insert`;
  }

  /**
   * Retrieves the full description of a specific grammar.
   *
   * @param idOrSlug The slug or the ID of the grammar in question.
   */
  individualGrammarUrl(idOrSlug: string) {
    return `${this._apiBaseUrl}/grammars/${idOrSlug}`;
  }

  /**
   * Retrieves code resources that may be visualized for a grammar code gallery.
   */
  individualGrammarCodeResourceGallery(id: string) {
    return `${this.individualGrammarUrl(id)}/code_resources_gallery`;
  }

  /**
   * Retrieves the URL that uniquely describes a project.
   */
  getProjectUrl(projectId: string): string {
    return `${this._apiBaseUrl}/project/${projectId}`;
  }

  /**
   * The base URL for all operations on code resources
   */
  getCodeResourceBaseUrl(projectId: string): string {
    return this.getProjectUrl(projectId) + "/code_resources";
  }

  /**
   * Retrieves the URL to access code resources
   */
  getCodeResourceUrl(projectId: string, codeResourceId: string): string {
    return this.getCodeResourceBaseUrl(projectId) + `/${codeResourceId}`;
  }

  /**
   * Retrieves the URL to clone code resources
   */
  getCodeResourceCloneUrl(projectId: string, codeResourceId: string): string {
    return this.getCodeResourceBaseUrl(projectId) + `/${codeResourceId}/clone`;
  }

  /**
   * Retrieves an URL that can be used to run requests
   * where the ID is transfered as part of the body.
   */
  getQueryUrl(projectId: string): string {
    return `${this._apiBaseUrl}/project/${projectId}/query/`;
  }

  /**
   * Retrieves an URL that can be used to run requests
   * where the ID is transferred as part of the request string.
   */
  getQuerySpecificUrl(projectId: string, queryId: string): string {
    return `${this._apiBaseUrl}/project/${projectId}/query/${queryId}`;
  }

  /**
   * Formats an URL that can be used to run a specific query on the
   * server.
   */
  getSpecificRunQueryUrl(projectId: string, queryId: string): string {
    return `${this._apiBaseUrl}/project/${projectId}/query/${queryId}/run`;
  }

  /**
   * Retrieves the URL that is used to run an arbitrary
   * query against a certain project. This may not be allowed by the
   * server if the client is not authorized.
   */
  getRunQueryUrl(projectId: string): string {
    return `${this._apiBaseUrl}/project/${projectId}/query/run`;
  }

  /**
   * Retrieves the URL that is used to run simulate the effects of an INSERT
   * query against a certain project.
   */
  getSimulateInsertUrl(projectId: string): string {
    return `${this._apiBaseUrl}/project/${projectId}/query/simulate/insert`;
  }

  /**
   * Retrieves the URL that is used to run simulate the effects of an DELETE
   * query against a certain project.
   */
  getSimulateDeleteUrl(projectId: string): string {
    return `${this._apiBaseUrl}/project/${projectId}/query/simulate/delete`;
  }

  /**
   * Retrieves an URL that can be used to create pages.
   *
   * @projectId The ID of the project
   */
  getPageUrl(projectId: string): string {
    return `${this._apiBaseUrl}/project/${projectId}/page`;
  }

  /**
   * Retrieves an URL that can be used to access specific pages.
   *
   * @projectId The ID of the project
   * @pageId The ID of the page. Omitted if undefined.
   */
  getPageSpecificUrl(projectId: string, pageId: string): string {
    if (!pageId) {
      return this.getPageUrl(projectId);
    } else {
      return `${this.getPageUrl(projectId)}/${pageId}`;
    }
  }

  /**
   * Retrieves an URL that can be used to render specific pages.
   *
   * @projectId The ID of the project
   * @pageId The ID of the query
   */
  getPageRenderUrl(projectId: string, pageId: string): string {
    return this.getPageSpecificUrl(projectId, pageId) + "/render/";
  }

  /**
   * Retrieves an URL that can be used to render arbitrary pages.
   *
   * @projectId The ID of the project
   */
  getArbitraryRenderUrl(projectId: string): string {
    return this.getProjectUrl(projectId) + "/page/render";
  }

  /**
   * Retrieves the URL that can be used to upload new images.
   *
   * @projectId The ID of the project
   */
  getImageUploadUrl(projectId: string): string {
    return this.getProjectUrl(projectId) + "/image";
  }

  getImageListUrl(projectId: string): string {
    return this.getProjectUrl(projectId) + "/image";
  }

  getImageMetadataUrl(projectId: string, imageId: string): string {
    return this.getProjectUrl(projectId) + "/image/" + imageId + "/metadata";
  }

  getImageUrl(projectId: string, imageId: string): string {
    return this.getProjectUrl(projectId) + "/image/" + imageId;
  }

  getImageDeleteUrl(projectId: string, imageId: string): string {
    return this.getProjectUrl(projectId) + "/image/" + imageId;
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
  getTableEntriesUrl(
    projectId: string,
    database_id: string,
    tableName: string,
    from: number,
    amount: number
  ): string {
    return (
      this.getProjectUrl(projectId) +
      `/db/${database_id}/rows/${tableName}/${from}/${amount}`
    );
  }

  /**
   * Retrieves an URL that can be used to get the amount of
   * entries inside a table.
   *
   * @projectId The ID of the project
   * @tableName The name of the table
   */
  getTableEntriesCountUrl(
    projectId: string,
    database_id: string,
    tableName: string
  ): string {
    return (
      this.getProjectUrl(projectId) + `/db/${database_id}/count/${tableName}`
    );
  }

  /**
   * Retrieves an URL that can be used to post a TableDescription
   * to create a corresponding table.
   *
   * @projectId The ID of the project
   * @database_id The name of the database
   */
  getCreateTableUrl(projectId: string, database_id: string): string {
    return this.getProjectUrl(projectId) + `/db/${database_id}/create`;
  }

  /**
   * Retrieves an URL that can be used to drop a Table
   * inside the database.
   *
   * @projectId The ID of the project
   * @tableName The name of the table
   * @database_id The name of the database
   */
  getDropTableUrl(
    projectId: string,
    database_id: string,
    tableName: string
  ): string {
    return (
      this.getProjectUrl(projectId) + `/db/${database_id}/drop/${tableName}`
    );
  }

  /**
   * Retrieves an URL that can be used to alter a Table
   * inside the database, by sending an array of TableCommands.
   *
   * @projectId The ID of the project
   * @tableName The name of the table to alter
   * @database_id The name of the database
   */
  getTableAlterUrl(
    projectId: string,
    database_id: string,
    tableName: string
  ): string {
    return (
      this.getProjectUrl(projectId) + `/db/${database_id}/alter/${tableName}`
    );
  }
}
