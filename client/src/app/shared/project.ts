import { BehaviorSubject, Observable } from "rxjs";

import {
  ProjectFullDescription,
  ProjectDescription,
  ProjectSourceDescription,
  ProjectUsesBlockLanguageDescription,
} from "./project.description";
import { Schema } from "./schema/schema";
import { Saveable, SaveStateEvent } from "./interfaces";
import { CodeResource, GrammarDescription } from "./syntaxtree";
import { DatabaseSchemaAdditionalContext } from "./syntaxtree/sql/sql.validator";
import { ResourceReferencesService } from "./resource-references.service";
import { isValidId } from "./util";
import { MultiLangString } from "./multilingual-string.description";

export { ProjectDescription, ProjectFullDescription };

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
};

/**
 * A loaded project with editing capatabilities. This is were all
 * information is lumped together.
 */
export class Project implements Saveable {
  public slug: string;
  public schema: Schema;

  private _id: string;
  private _name: MultiLangString;
  private _description: MultiLangString;

  private _currentDatabase: string;

  private _codeResources: CodeResource[];

  private _indexPageId: string;
  private _projectImageId: string;

  private _sources: ProjectSourceDescription[];

  private _saveRequired = false;

  private _usesBlockLanguages: ProjectUsesBlockLanguageDescription[];

  private _courseTemplate: boolean;

  readonly grammarDescriptions: GrammarDescription[];

  /**
   * Construct a new project and a whole slew of other
   * objects based on the JSON wire format.
   */
  constructor(
    json: ProjectFullDescription,
    readonly resourceReferences: ResourceReferencesService
  ) {
    this.slug = json.slug;
    this._id = json.id;
    this._name = json.name;
    this._description = json.description;
    this._indexPageId = json.indexPageId;
    this._projectImageId = json.preview;
    this._courseTemplate = json.courseTemplate;
    this._sources = json.projectSources ?? []; // Sources may be undefined
    this._usesBlockLanguages = [...json.projectUsesBlockLanguages];
    this._currentDatabase = json.defaultDatabase?.name;
    this.grammarDescriptions = json.grammars;
    this.schema = new Schema(json.defaultDatabase?.schema ?? []);

    // Map all descriptions to their concrete objects
    this._codeResources = (json.codeResources ?? [])
      .map((val) => new CodeResource(val, this.resourceReferences))
      .sort((lhs, rhs) => compareIgnoreCase(lhs, rhs));
  }

  // Fired when the save-state has changed
  private _saveStateChangedEvent = new BehaviorSubject<SaveStateEvent<Project>>(
    {
      resource: this,
      saveRequired: this._saveRequired,
    }
  );

  /**
   * @return The unique ID of this project.
   */
  get id() {
    return this._id;
  }

  /**
   * Checks whether the given identifier identifies this project
   */
  hasSlugOrId(slugOrId: string) {
    if (isValidId(slugOrId)) {
      return this.id == slugOrId;
    } else {
      return this.slug == slugOrId;
    }
  }

  /**
   * @return Project wide data that may or may not be relevant during validation.
   */
  get additionalValidationContext(): DatabaseSchemaAdditionalContext {
    return {
      databaseSchema: this.schema,
    };
  }

  /**
   * @return True if this project utilizes content from third party sources.
   */
  get hasSources(): boolean {
    return this._sources.length > 0;
  }

  /**
   * @return The sources that are associated with this project.
   */
  get sources() {
    return this._sources;
  }

  /**
   * @return True, if this project should be saved
   */
  get isSavingRequired() {
    return this._saveRequired;
  }

  /**
   * Allows subscription to state-changes for the save event.
   */
  get saveStateChanged(): Observable<SaveStateEvent<Project>> {
    return this._saveStateChangedEvent;
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
    // Required internal bookkeeping
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
   * @return The name of this project
   */
  get name() {
    return this._name;
  }

  /**
   * @param value The name of this project.
   */
  set name(value: MultiLangString) {
    this._name = value;
    this.markSaveRequired();
  }

  /**
   * @return The description of this project.
   */
  get description() {
    return this._description;
  }

  /**
   * @return true, if the project a course.
   */
  get courseTemplate() {
    return this._courseTemplate;
  }

  /**
   * @param value The description of this project.
   */
  set description(value: MultiLangString) {
    this._description = value;
    this.markSaveRequired();
  }

  /**
   * @return The name of the currently active database.
   */
  get currentDatabaseName() {
    return this._currentDatabase;
  }

  /**
   * @param value The name of the currently active database.
   */
  set currentDatabaseName(value: string) {
    this._currentDatabase = value;
    this.markSaveRequired();
  }

  /**
   * @return True, if the given block language is used by any resource.
   */
  isBlockLanguageReferenced(blockLanguageId: string) {
    return this._codeResources.some(
      (c) => c.blockLanguageIdPeek == blockLanguageId
    );
  }

  /**
   * @return All block languages as they are used by this project.
   */
  get usesBlockLanguages(): ReadonlyArray<ProjectUsesBlockLanguageDescription> {
    return this._usesBlockLanguages;
  }

  /**
   *
   */
  async addUsedBlockLanguage(blockLanguageId: string, usageId: string) {
    await this.resourceReferences.ensureResources({
      id: blockLanguageId,
      type: "blockLanguage",
    });

    this._usesBlockLanguages.push({
      id: usageId,
      blockLanguageId: blockLanguageId,
    });
  }

  /**
   * Removes the reference to the given block language if it is not in
   * use by any code resource.
   */
  removeUsedBlockLanguage(usedId: string) {
    this._usesBlockLanguages = this._usesBlockLanguages.filter(
      (b) => b.id !== usedId
    );
  }

  /**
   * @return All available code resources, no order guaranteed.
   */
  get codeResources() {
    return this._codeResources;
  }

  /**
   * @return The id of the index page.
   */
  get indexPageId() {
    return this._indexPageId;
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
    return this._projectImageId;
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
    return this._codeResources.find((res) => res.id === id);
  }

  /**
   * @param code A resource that has been fully created already
   */
  addCodeResource(code: CodeResource) {
    this._codeResources.push(code);
  }

  /**
   * Needs to be called after a code resource has been deleted.
   */
  removedCodeResource(code: CodeResource) {
    const index = this._codeResources.findIndex((c) => c.id == code.id);
    if (index >= 0) {
      this._codeResources.splice(index, 1);
    }
  }
}
