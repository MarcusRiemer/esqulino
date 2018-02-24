import { Subject } from 'rxjs/Subject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

import { LanguageService } from './language.service'
import { BlockLanguageDescription } from './block/block-language.description'

import {
  ProjectDescription, AvailableDatabaseDescription, ProjectSourceDescription,
  ProjectUpdateDescription, ProjectUsesBlockLanguageDescription,
  ApiVersion, ApiVersionToken, CURRENT_API_VERSION
} from './project.description'
import { Schema } from './schema/schema'
import { Invalidateable, Saveable, SaveStateEvent } from './interfaces'
import { CodeResource } from './syntaxtree'

export { ProjectDescription }

/**
 * Compares two named things in a case-insensitive manner.
 */
const compareIgnoreCase = (lhs: { name: string }, rhs: { name: string }) => {
  const cmpLhs = lhs.name.toUpperCase();
  const cmpRhs = rhs.name.toUpperCase();

  if (cmpLhs < cmpRhs) {
    return -1;
  } else if (cmpLhs > cmpRhs) {
    return 1;
  } else {
    return 0;
  }
}

/**
 * A loaded project with editing capatabilities. This is were all
 * information is lumped together.
 */
export class Project implements ApiVersion, Saveable {
  public slug: string;
  public schema: Schema;

  private _id: string;
  private _name: string;
  private _description: string;

  private _currentDatabase: string;
  private _availableDatabases: { [id: string]: AvailableDatabaseDescription };

  private _codeResources: CodeResource[];

  private _indexPageId: string;
  private _projectImageId: string;
  private _version: ApiVersionToken;

  private _sources: ProjectSourceDescription[];

  private _saveRequired = false;

  private _projectBlockLanguages: BlockLanguageDescription[];
  private _usesBlockLanguages: ProjectUsesBlockLanguageDescription[];

  /**
   * Construct a new project and a whole slew of other
   * objects based on the JSON wire format.
   */
  constructor(
    json: ProjectDescription,
    private _languageService: LanguageService
  ) {
    this.slug = json.slug;
    this._id = json.id;
    this._name = json.name;
    this._description = json.description;
    this._indexPageId = json.indexPageId;
    this._currentDatabase = json.activeDatabase;
    this._availableDatabases = json.availableDatabases;
    this._projectImageId = json.preview;
    this._sources = json.sources || [] // Sources may be undefined
    this._projectBlockLanguages = json.blockLanguages;
    this._usesBlockLanguages = json.projectUsesBlockLanguages;
    this.schema = new Schema(json.schema);

    if (json.apiVersion as string != this.apiVersion) {
      throw new Error(`Attempted to load a project "${json.slug}" with version ${json.apiVersion}, current version is ${this.apiVersion}`);
    }

    // Map all descriptions to their concrete objects
    this._codeResources = (json.codeResources || [])
      .map(val => new CodeResource(val, this))
      .sort((lhs, rhs) => compareIgnoreCase(lhs, rhs));
  }

  /**
   * @return The unique ID of this project.
   */
  get id() {
    return (this._id);
  }

  // Fired when the save-state has changed
  private _saveStateChangedEvent = new BehaviorSubject<SaveStateEvent<Project>>({
    resource: this,
    saveRequired: this._saveRequired
  });


  /**
   * @return The version of this project
   */
  get apiVersion(): ApiVersionToken {
    return (CURRENT_API_VERSION);
  }

  /**
   * @return True if this project utilizes content from third party sources.
   */
  get hasSources(): boolean {
    return (this._sources.length > 0);
  }

  get sources() {
    return (this._sources);
  }

  /**
   * @return True, if this project should be saved
   */
  get isSavingRequired() {
    return (this._saveRequired);
  }

  /**
   * Allows subscription to state-changes for the save event.
   */
  get saveStateChanged(): Observable<SaveStateEvent<Project>> {
    return (this._saveStateChangedEvent);
  }

  /**
   * Signals that this project should be saved.
   */
  markSaveRequired() {
    this._saveRequired = true;
    this.fireCurrentSaveState();
  }

  /**
   * Signals that this project has been saved.
   */
  markSaved() {
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
      saveRequired: this._saveRequired
    });
  }

  /**
   * @return The name of this project
   */
  get name() {
    return (this._name);
  }

  /**
   * @param value The name of this project.
   */
  set name(value: string) {
    this._name = value;
    this.markSaveRequired();
  }

  /**
   * @return The description of this project.
   */
  get description() {
    return (this._description);
  }

  /**
   * @param value The description of this project.
   */
  set description(value: string) {
    this._description = value;
    this.markSaveRequired();
  }

  /**
   * @return The name of the currently active database.
   */
  get currentDatabaseName() {
    return (this._currentDatabase);
  }

  /**
   * @param value The name of the currently active database.
   */
  set currentDatabaseName(value: string) {
    this._currentDatabase = value;
    this.markSaveRequired();
  }

  /**
   * @return Names of all databases that are available to this project
   */
  get availableDatabaseNames() {
    if (this._availableDatabases) {
      return (Object.keys(this._availableDatabases));
    } else {
      return ([]);
    }
  }

  /**
   * @return All block languages that are available as part of this project.
   */
  get projectBlockLanguages() {
    return (this._projectBlockLanguages);
  }

  /**
   * @return True, if the given block language is used by any resource.
   */
  isBlockLanguageReferenced(blockLanguageId: string) {
    return (this._codeResources.some(c => c.blockLanguageIdPeek == blockLanguageId));
  }

  /**
   * Removes the reference to the given block language if it is not in
   * use by any code resource.
   */
  removeUsedBlockLanguage(blockLanguageId: string) {
    // Is the language referenced?
    if (this.isBlockLanguageReferenced(blockLanguageId)) {
      // If it is: Don't change anything
      return (false);
    } else {
      // It isn't: Lets remove it
      this._usesBlockLanguages = this._usesBlockLanguages.filter(b => b.blockLanguageId !== blockLanguageId);
      this._projectBlockLanguages = this._projectBlockLanguages.filter(b => b.id !== blockLanguageId);
      this.markSaveRequired();
      return (true);
    }
  }

  /**
   * @return All available code resources, no order guaranteed.
   */
  get codeResources() {
    return (this._codeResources);
  }

  /**
   * @return The id of the index page.
   */
  get indexPageId() {
    return (this._indexPageId);
  }

  /**
   * @param newId The id of the index page.
   */
  set indexPageId(newId: string) {
    this._indexPageId = newId;
    this.markSaveRequired();
  }

  /**
   * @return The id of the project image
   */
  get projectImageId() {
    return (this._projectImageId);
  }

  /**
   * @param newId The id of the project image
   */
  set projectImageId(newId: string) {
    if (this._projectImageId != newId) {
      this._projectImageId = newId;
      this.markSaveRequired();
    }
  }

  /**
   * @param id A single code resource identified by it's ID
   */
  getCodeResourceById(id: string) {
    return (this._codeResources.find(res => res.id === id));
  }

  /**
   * @param id The id for a certain language
   */
  getLanguageById(id: string) {
    return (this._languageService.getLanguage(id));
  }

  /**
   * @param id_or_slug The id or slug for a certain languageModel
   */
  getBlockLanguage(id_or_slug: string) {
    const localLanguage = this._projectBlockLanguages.find(l => l.id === id_or_slug || l.slug === id_or_slug);
    if (localLanguage) {
      return (this._languageService.getLocalBlockLanguage(localLanguage.slug));
    } else {
      return (undefined);
    }
  }

  /**
   * @return An object that the server can use to update the stored data.
   */
  toUpdateRequest(): ProjectUpdateDescription {
    const toReturn: ProjectUpdateDescription = {
      name: this.name,
      apiVersion: this.apiVersion,
      description: this.description,
      activeDatabase: this._currentDatabase
    };

    if (this._indexPageId) {
      toReturn.indexPageId = this.indexPageId;
    }

    if (this._projectImageId) {
      toReturn.preview = this._projectImageId;
    }

    return (toReturn);
  }
}
