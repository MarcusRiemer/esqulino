import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Http, Response, Headers } from '@angular/http'

import { ProjectService, Project } from './project.service'
import { SidebarService } from './sidebar.service'
import { ToolbarService } from './toolbar.service'
import { QueryService } from './query.service'
import { PageService } from './page.service'
import { ServerApiService } from '../shared/serverapi.service'

import { AvailableImage, ImageService } from './image/image.service'

@Component({
  templateUrl: 'templates/settings.html'
})
export class SettingsComponent {
  /**
   * The currently edited project
   */
  public project: Project;

  /**
   * The project defined images
   */
  private _imageList: AvailableImage[]

  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];

  /**
   * Used for dependency injection.
   */
  constructor(
    private _projectService: ProjectService,
    private _queryService: QueryService,
    private _pageService: PageService,
    private _toolbarService: ToolbarService,
    private _sidebarService: SidebarService,
    private _router: Router,
    private _serverApi: ServerApiService,
    private _http: Http,
    private _imageService: ImageService
  ) {
  }

/*  refreshCache() {
    const projectId = this._projectService.cachedProject.id;

    this._http.get(this._serverApi.getImageListUrl(projectId))
      .map(res => res.json() as AvailableImage[])
      .subscribe(res => {
        this._imageList = res;
      });
  }*/

  get images() {
    return (this._imageService.images);
    //return (this._imageList);
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
        this._projectService.deleteProject(this.project.id)
          .subscribe(res => {
            // Go back to title after deleting
            if (res.ok) {
              this._router.navigateByUrl("/");
            }
          });
      }
    });
    this._subscriptionRefs.push(subRef);
    this._imageService.loadImageList(this._projectService.cachedProject.id);
    //this.reloadCache();
  }

  ngOnDestroy() {
    this._subscriptionRefs.forEach(ref => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  /**
   * The user has decided to delete a query.
   */
  onQueryDelete(queryId: string) {
    this._queryService.deleteQuery(this.project, queryId);
  }

  /**
   * The user has decided to delete a page.
   */
  onPageDelete(pageid: string) {
    this._pageService.deletePage(this.project, pageid);
  }
}
