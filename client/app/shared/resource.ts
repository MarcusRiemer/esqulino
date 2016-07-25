import {Project}                              from './project'

/**
 * Any kind of resource for the esqulino project. Resources
 * always belong to a project and are uniquely identified
 * by an ID.
 */
export abstract class ProjectResource {
    private _id : string;
    private _name : string;
    private _project : Project;

    private _isDirty = false;

    constructor(id : string, name : string, project : Project) {
        this._id = id;
        this._name = name;
        this._project = project;
    }

    /**
     * @return The project this resource is associated with. Because the tests
     *         do not always provide a project, this does some sanity checking
     *         that there actually is a project.
     */
    get project() {
        // Give a friendly error message if the project is missing
        if (!this._project) {
            throw new Error(`Project Resource "${this._name}" (${this._id}) has no associated project.`);
        }

        return (this._project);
    }
    
    /**
     * @return The name the user has given to this page
     */
    get name() {
        return (this._name);
    }

    /**
     * @param newName The new name to set
     */
    set name(newName : string) {
        this._name = newName;
        this.markDirty();
    }

    /**
     * @return The unique id for this page
     */
    get id() {
        return (this._id);
    }

    /**
     * Called to signal that this resource requires saving.
     */
    protected markDirty() : void {
        this._isDirty = true;
    }

    /**
     * @return True, if this instance has changes that should be saved..
     */
    get isDirty() {
        return (this._isDirty);
    }

}
