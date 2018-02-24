import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Http, Response, Headers } from '@angular/http'

import { ProjectService, Project } from './project.service'
import { SidebarService } from './sidebar.service'
import { ToolbarService } from './toolbar.service'
import { ServerApiService } from '../shared/serverapi.service'

import { ImageService } from './image/image.service'
import { AvailableImage } from './image/available-image.class'

@Component({
  templateUrl: 'templates/settings.html'
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
   * Used for dependency injection.
   */
  constructor(
    private _projectService: ProjectService,
    private _toolbarService: ToolbarService,
    private _sidebarService: SidebarService,
    private _router: Router,
    private _serverApi: ServerApiService,
    private _http: Http,
    private _imageService: ImageService
  ) {
  }

  /**
   * Load the project to access the schema
   */
  ngOnInit() {
    // Ensure sane default state
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();

    // Ensure we are always subsribed to the active project
    let subRef = this._projectService.activeProject
      .subscribe(res => this.project = res);
    this._subscriptionRefs.push(subRef);

    // Wiring up the save button
    this._toolbarService.savingEnabled = true;
    let saveItem = this._toolbarService.saveItem;
    subRef = saveItem.onClick.subscribe((res) => {
      saveItem.isInProgress = true;
      this._projectService.storeProjectDescription(this.project)
        .subscribe(res => saveItem.isInProgress = false);
    });
    this._subscriptionRefs.push(subRef);

    // Wiring up the delete button
    let btnDelete = this._toolbarService.addButton("delete", "Löschen", "trash", "d");
    subRef = btnDelete.onClick.subscribe(res => {
      // Don't delete without asking the user
      if (confirm("Dieses Projekt löschen?")) {
        this._projectService.deleteProject(this.project.slug)
          .subscribe(res => {
            // Go back to title after deleting
            if (res.ok) {
              this._router.navigateByUrl("/");
            }
          });
      }
    });
    this._subscriptionRefs.push(subRef);
  }

  /**
   * Free up subscriptions
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach(ref => ref.unsubscribe());
    this._subscriptionRefs = [];
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
}
