/**
 * The properties of a project that can be queried from the
 * server. Only contains publically visible data, not the
 * password or other private information.
 */
export interface ProjectDescription {
    name : string;
    description : string;
}

/**
 * A single project in greater detail, including means of
 * manipulating it.
 */
export class Project {
    constructor(public name:string) {

    }
}
