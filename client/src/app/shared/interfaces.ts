import { Observable } from "rxjs";

/**
 * Some changes to resources require updates to the visual representation,
 * which may or may not have altered the serialized model state.
 *
 * Invalidation *only* makes assumptions about the visual state, to find
 * out whether something should be saved by the user is a different matter
 * which is handled by the `Saveable` interface. And if there is no notion
 * about "Saveability", the `ModelObservable` interface provides means to
 * convey the change of an internal state.
 */
export interface Invalidateable {
  /**
   * Signals that the visual representation of this resource should be updated.
   */
  invalidate(): void;
}

/**
 * If changes are not of a purely visual aspect but did alter some persistant
 * internal model, this is the interface to implement.
 */
export interface ModelObservable<T> {
  /**
   * Fired when something about this model has changed.
   */
  modelChanged: Observable<T>;
}

/**
 * The event that is fired if the save-state for something has changed.
 */
export interface SaveStateEvent<T extends Saveable> {
  // The new state
  saveRequired: boolean;

  // The affected resource
  resource: T;
}

/**
 * Something that sometimes requires a save. At the fundamental level this
 * interface effectively wraps an observable boolean.
 */
export interface Saveable {
  /**
   * Called to signal that this resource requires saving. Per default this should
   * also trigger an invalidation, at least if the concept of "Invalidation" is
   * known to the implementing class.
   */
  markSaveRequired(): void;

  /**
   * Must be called after this resource was saved.
   */
  markSaved(): void;

  /**
   * Fired when the saving state has changed.
   */
  saveStateChanged: Observable<SaveStateEvent<Saveable>>;
}

/**
 * @return True, if the given object implements saveable.
 */
export function isSaveable(obj: any): obj is Saveable {
  return obj && !!obj.markSaveRequired;
}
