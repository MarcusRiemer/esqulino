import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'

import {
  assertValidResourceName, isValidResourceName
} from '../../shared/util'

import { ProjectService, Project } from '../project.service'
import { SidebarService } from '../sidebar.service'
import { ToolbarService } from '../toolbar.service'
import { PageService } from '../page.service'

@Component({
  templateUrl: 'templates/create.html'
})
export class PageCreateComponent implements OnInit, OnDestroy {
  private _project: Project;

  public pageName: string;

  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];

  constructor(
    private _projectService: ProjectService,
    private _toolbarService: ToolbarService,
    private _sidebarService: SidebarService,
    private _pageService: PageService,
    private _router: Router
  ) {
  }

  /**
   * Load the project to access the schema
   */
  ngOnInit() {
    this._sidebarService.hideSidebar();

    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    let subRef = this._projectService.activeProject
      .subscribe(res => this._project = res);

    this._subscriptionRefs.push(subRef);

    // Actually allow creation
    let btnCreate = this._toolbarService.addButton("create", "Erstellen", "plus", "n");
    subRef = btnCreate.onClick.subscribe((res) => {
      if (this.isValid) {
        const res = this._pageService.createPage(this._project, this.pageName);

        res.subscribe(page => {
          console.log(`New page ${page.id}`);
          this._router.navigate(["/editor", this._project.id, "page", page.id]);
        });
      }
    });

    this._subscriptionRefs.push(subRef);
  }

  ngOnDestroy() {
    this._subscriptionRefs.forEach(ref => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  /**
   * @return True, if the currently proposed name is valid
   */
  public isNameValid(name: string) {
    return (isValidResourceName(name) && this._project && !this._project.hasPageByName(name));
  }

  public get isValid() {
    return (this.isNameValid(this.pageName));
  }


}
