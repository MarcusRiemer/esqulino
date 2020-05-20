import { BehaviorSubject, Subject, Observable } from "rxjs";

import { Invalidateable, Saveable, SaveStateEvent } from "./interfaces";

import {
  ApiVersion,
  ApiVersionToken,
  ProjectResourceDescription,
  CURRENT_API_VERSION,
  IdentifiableResourceDescription,
} from "./resource.description";
import { ResourceReferencesService } from "./resource-references.service";

export {
  ProjectResourceDescription,
  ApiVersion,
  ApiVersionToken,
  CURRENT_API_VERSION,
  Invalidateable,
  Saveable,
};

export function speakingResourceName(res: IdentifiableResourceDescription) {
  const name = res["name"];
  if (name) {
    return `"${name}" (${res.id})`;
  } else {
    return res.id;
  }
}

/**
 * Any kind of resource for the esqulino project. Resources
 * always belong to a project and are uniquely identified
 * by an ID.
 */
export abstract class ProjectResource implements Saveable {
  private _id: string;
  private _name: string;

  // Does this resource require saving?
  private _saveRequired = false;

  // Fired when this resource experiences some kind of change
  // that requires the UI to be refreshed.
  private _invalidateEvent = new Subject<ProjectResource>();

  // Fired when the save-state has changed
  private _saveStateChangedEvent = new BehaviorSubject<
    SaveStateEvent<ProjectResource>
  >({
    resource: this,
    saveRequired: this._saveRequired,
  });

  constructor(
    desc: ProjectResourceDescription,
    public resourceReferences: ResourceReferencesService
  ) {
    this._id = desc.id;
    this._name = desc.name;
  }

  /**
   * Convert this resource to it's JSON description
   */
  abstract toModel(): ProjectResourceDescription;

  /**
   * @return The name the user has given to this page
   */
  get name() {
    return this._name;
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
    return this._id;
  }

  /**
   * Called to signal that this resource requires saving. This will
   * also trigger an invalidation.
   */
  markSaveRequired(): void {
    this._saveRequired = true;
    this.fireCurrentSaveState();

    this.invalidate();
  }

  /**
   * Should be called after this resource was saved.
   */
  markSaved(): void {
    this._saveRequired = false;
    this.fireCurrentSaveState();
  }

  /**
   * Fires the current save state as a new save state. Needs to be called manually
   * after the save-state has actually been changed.
   */
  private fireCurrentSaveState() {
    this._saveStateChangedEvent.next({
      resource: this,
      saveRequired: this._saveRequired,
    });
  }

  /**
   * Allows subscription to state-changes for the save event.
   */
  get saveStateChanged(): Observable<SaveStateEvent<ProjectResource>> {
    return this._saveStateChangedEvent;
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
    return this._invalidateEvent;
  }

  /**
   * @return True, if this instance has changes that should be saved.
   */
  get isSavingRequired() {
    return this._saveRequired;
  }
}
