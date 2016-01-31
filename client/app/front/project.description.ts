/**
 * The properties of a project that can be queried from the
 * server. Only contains publically visible data, not the
 * password or other private information.
 */
export interface ProjectDescription {
    name : string;
    description : string;
    id : string;
}
