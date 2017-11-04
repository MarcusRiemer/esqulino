import { Subject } from 'rxjs/Subject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

import {
  Invalidateable, Saveable, SaveStateEvent
} from './interfaces'
import { Project } from './project'
import {
  ApiVersion, ApiVersionToken, ProjectResourceDescription,
  CURRENT_API_VERSION
} from './resource.description'

export {
  ProjectResourceDescription,
  ApiVersion, ApiVersionToken, CURRENT_API_VERSION,
  Invalidateable, Saveable
}

/**
 * Any kind of resource for the esqulino project. Resources
 * always belong to a project and are uniquely identified
 * by an ID.
 */
export abstract class ProjectResource implements ApiVersion, Saveable {
  private _id: string;
  private _name: string;
  private _project: Project;

  // Does this resource require saving?
  private _saveRequired = false;

  // Fired when this resource experiences some kind of change
  // that requires the UI to be refreshed.
  private _invalidateEvent = new Subject<ProjectResource>();

  // Fired when the save-state has changed
  private _saveStateChangedEvent = new BehaviorSubject<SaveStateEvent<ProjectResource>>({
    resource: this,
    saveRequired: this._saveRequired
  });

  constructor(desc: ProjectResourceDescription, project: Project) {
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
  abstract toModel(): ProjectResourceDescription;

  /**
   * @return The API version of this resource
   */
  get apiVersion(): ApiVersionToken {
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
      throw new Error(`Project Resource "${this._name}" (id: ${this._id}) has no associated project.`);
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
  set name(newName: string) {
    this._name = newName;
    this.markSaveRequired();
  }

  /**
   * @return The unique id for this page
   */
  get id() {
    return (this._id);
  }

  /**
   * Called to signal that this resource requires saving. This will
   * also trigger an invalidation.
   */
  markSaveRequired(): void {
    this._saveRequired = true;
    this.fireCurrentSaveState();

    this.invalidate();
    console.log(`Resource "${this.id}" now requires saving`);
  }

  /**
   * Should be called after this resource was saved.
   */
  markSaved(): void {
    this._saveRequired = false;
    this.fireCurrentSaveState();

    console.log(`Resource "${this.id}" was saved!`);
  }

  /**
   * Fires the current save state as a new save state. Needs to be called manually
   * after the save-state has actually been changed.
   */
  private fireCurrentSaveState() {
    this._saveStateChangedEvent.next({
      resource: this,
      saveRequired: this._saveRequired
    });
  }

  /**
   * Allows subscription to state-changes for the save event.
   */
  get saveStateChanged(): Observable<SaveStateEvent<ProjectResource>> {
    return (this._saveStateChangedEvent);
  }

  /**
   * Signals that the visual representation of this resource should be updated.
   */
  invalidate(): void {
    this._invalidateEvent.next(this);
  }

  /**
   * @return An observable that is fired when this resource requires an update
   *         to its visual representation.
   */
  get invalidateEvent(): Observable<ProjectResource> {
    return (this._invalidateEvent);
  }

  /**
   * @return True, if this instance has changes that should be saved.
   */
  get isSavingRequired() {
    return (this._saveRequired);
  }

}
