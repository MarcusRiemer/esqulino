import { Component } from '@angular/core'

import { ProjectService, Project } from './project.service'
import { SidebarService } from './sidebar.service'
import { ToolbarService } from './toolbar.service'
import { QueryService } from './query.service'
import { PageService } from './page.service'

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
    private _queryService: QueryService,
    private _pageService: PageService,
    private _toolbarService: ToolbarService,
    private _sidebarService: SidebarService
  ) {
    this._sidebarService.hideSidebar();
  }

  /**
   * Load the project to access the schema
   */
  ngOnInit() {
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = true;


    let saveItem = this._toolbarService.saveItem;
    let subRef = saveItem.onClick.subscribe((res) => {
      saveItem.isInProgress = true;
      this._projectService.storeProjectDescription(this.project)
        .subscribe(res => saveItem.isInProgress = false);
    });

    this._subscriptionRefs.push(subRef);


    subRef = this._projectService.activeProject
      .subscribe(res => this.project = res);

    this._subscriptionRefs.push(subRef); 2
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
