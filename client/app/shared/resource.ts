import {Subject}                              from 'rxjs/Subject'
import {Observable}                           from 'rxjs/Observable'

import {Project}                              from './project'
import {
    ApiVersion, ApiVersionToken, ProjectResourceDescription,
    CURRENT_API_VERSION
} from './resource.description'

export {
    ProjectResourceDescription,
    ApiVersion, ApiVersionToken, CURRENT_API_VERSION
}

/**
 * Some changes to resources require updates to the visual representation,
 * which may or may not have altered the serialized model state.
 * 
 * Invalidation *only* makes assumptions about the visual state, to find
 * out whether something should be saved by the user is a different matter
 * which is handled by the `isDirty` property.
 *
 * TODO: Streamline this.
 */
export interface Invalidateable {
    /**
     * Signals that the visual representation of this resource should be updated.
     */
    invalidate() : void;
}

/**
 * Any kind of resource for the esqulino project. Resources
 * always belong to a project and are uniquely identified
 * by an ID.
 */
export abstract class ProjectResource implements ApiVersion {
    private _id : string;
    private _name : string;
    private _project : Project;

    // Fired when this resource experiences some kind of change
    // that requires the UI to be refreshed.
    private _invalidateEvent : Subject<ProjectResource> = new Subject<ProjectResource>();
    
    // Does this resource require saving?
    private _isDirty = false;

    constructor(project : Project, desc : ProjectResourceDescription) {
        this._id = desc.id;
        this._name = desc.name;
        this._project = project;

        // The esqulino client expects exactly matching versions. And because
        // the JSON serialization may have circumvented the type system, we
        // need to ensure we are actually loading something valid.
        if (this.apiVersion != desc.apiVersion as string) {
            throw new Error(`Attempted to load a resource with version ${desc.apiVersion}, current version is ${this.apiVersion}`);
        }
    }

    /**
     * Convert this resource to it's JSON description
     */
    abstract toModel() : ProjectResourceDescription;

    /**
     * @return The API version of this resource
     */
    get apiVersion() : ApiVersionToken {
        return (CURRENT_API_VERSION);
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
     * Called to signal that this resource requires saving. Per default this will
     * also trigger an invalidation.
     */
    markDirty(invalidate = true) : void {
        this._isDirty = true;
        if (invalidate) {
            this.invalidate();
        }
    }

    /**
     * Signals that the visual representation of this resource should be updated.
     */
    invalidate() : void {
        this._invalidateEvent.next(this);
    }

    /**
     * @return An observable that is fired when this resource requires an update
     *         to its visual representation.
     */
    get invalidateEvent() : Observable<ProjectResource> {
        return (this._invalidateEvent);
    }

    /**
     * @return True, if this instance has changes that should be saved..
     */
    get isDirty() {
        return (this._isDirty);
    }

}
