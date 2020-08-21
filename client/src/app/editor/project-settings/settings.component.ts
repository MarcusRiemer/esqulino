import { Component } from "@angular/core";
import { Router } from "@angular/router";

import {
  IndividualBlockLanguageDataService,
  ListBlockLanguageDataService,
} from "../../shared/serverdata";
import { PerformDataService } from "../../shared/authorisation/perform-data.service";

import { ProjectService, Project } from "../project.service";
import { SidebarService } from "../sidebar.service";
import { EditorToolbarService } from "../toolbar.service";
import { SelectionListBlockLanguagesGQL } from "../../../generated/graphql";
import { map } from "rxjs/operators";

@Component({
  templateUrl: "templates/settings.html",
})
export class SettingsComponent {
  /**
   * The currently edited project
   */
  public project: Project;

  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];

  /**
   * @return All block languages that could currently be used.
   */
  readonly availableBlockLanguages$ = this._selectBlockLanguagesGQL
    .watch()
    .valueChanges.pipe(map((result) => result.data.blockLanguages.nodes));

  /**
   * Used for dependency injection.
   */
  constructor(
    private _projectService: ProjectService,
    private _toolbarService: EditorToolbarService,
    private _sidebarService: SidebarService,
    private _router: Router,
    private _selectBlockLanguagesGQL: SelectionListBlockLanguagesGQL,
    private _performData: PerformDataService
  ) {}

  /**
   * Load the project to access the schema
   */
  ngOnInit() {
    console.log("Navigated to settings");

    // Ensure sane default state
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();

    // Ensure we are always subscribed to the active project
    let subRef = this._projectService.activeProject.subscribe((res) => {
      this.project = res;
      // Needs permission for saving
      this._toolbarService.saveItem.performDesc = this._performData.project.update(
        res.id
      );
    });
    this._subscriptionRefs.push(subRef);

    // Wiring up the save button
    this._toolbarService.savingEnabled = true;
    let saveItem = this._toolbarService.saveItem;
    subRef = saveItem.onClick.subscribe((_) => {
      saveItem.isInProgress = true;
      this._projectService
        .storeProjectDescription(this.project)
        .subscribe((_) => (saveItem.isInProgress = false));
    });
    this._subscriptionRefs.push(subRef);

    // Wiring up the delete button
    let btnDelete = this._toolbarService.addButton(
      "delete",
      "Löschen",
      "trash",
      "d",
      this._performData.project.delete(this.project.id)
    );
    subRef = btnDelete.onClick.subscribe(async (_) => {
      // Don't delete without asking the user
      if (confirm("Dieses Projekt löschen?")) {
        const res = await this._projectService.deleteProject(this.project.slug);
        // Go back to title after deleting
        if (res) {
          this._router.navigateByUrl("/");
        }
      }
    });
    this._subscriptionRefs.push(subRef);
  }

  /**
   * Free up subscriptions
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach((ref) => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  /**
   * Reference a block language from this project.
   */
  addUsedBlockLanguage(blockLanguageId: string) {
    console.log("bl id: " + blockLanguageId);
    this.project.addUsedBlockLanguage(blockLanguageId);
  }

  /**
   * Remove a block language from this project.
   */
  removeUsedBlockLanguage(blockLanguageId: string) {
    console.log("Removing", blockLanguageId);
    if (!this.project.removeUsedBlockLanguage(blockLanguageId)) {
      alert("Benutzte Programmiersprachen können nicht entfernt werden");
    }
  }

  /**
   * Retrieves the name of the given block language
   */
  resolveBlockLanguageName(blockLanguageId: string) {
    return this._projectService.cachedProject.getBlockLanguage(blockLanguageId);
  }
}
