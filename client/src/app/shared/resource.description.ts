/**
 * It would be nicer if versions could be numbers, but Typescript has no
 * concept of union types for numbers.
 */
export type ApiVersionToken = "1" | "2" | "3" | "4";

/**
 * The version this state of the client is currently using.
 */
export const CURRENT_API_VERSION: ApiVersionToken = "4";

/**
 * esqulinos data format carries an explicit, global version instead
 * of going with an implicit schema declared version for each resource. This
 * makes updates a little tedious (each saved resource needs to be touched,
 * at least to update the version flag) but should solve annoying implicit
 * incompatabilities.
 *
 */
export interface ApiVersion {
  /**
   * These API versions are merely a number, no need to overcomplicate things.
   * If versions differ, any implementing the API is free to specify
   * version ranges it works with.
   */
  apiVersion: ApiVersionToken;
}

/**
 * A resource that is uniquely identifiable.
 */
export interface IdentifiableResourceDescription {
  /**
   * An internal ID, possibly a GUID, to uniquely identify a resource.
   * These IDs must *never* change and should be UUIDs, so that they are
   * globally unique.
   */
  id: string;
}

/**
 * The minimum set of properties any project related resources needs.
 */
export interface ProjectResourceDescription
  extends IdentifiableResourceDescription {
  /**
   * The user-chosen name of this resource. This property is free to change.
   */
  name: string;

  /**
   * Date & time this resource was created
   */
  createdAt?: string;

  /**
   * Date & time this resource was updated the last time
   */
  updatedAt?: string;
}
