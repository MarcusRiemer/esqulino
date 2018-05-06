import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { first } from 'rxjs/operators';

import { ToolbarService } from '../toolbar.service';
import { SidebarService } from '../sidebar.service';
import { ProjectService } from '../project.service';
import { CodeResourceService } from '../coderesource.service';

/**
 * Host-component for the front-page.
 */
@Component({
  templateUrl: 'templates/create-code-resource.html',
})
export class CreateCodeResourceComponent {

  public resourceName: string;
  public blockLanguageId: string;

  constructor(
    private _toolbarService: ToolbarService,
    private _sidebarService: SidebarService,
    private _projectService: ProjectService,
    private _codeResourceService: CodeResourceService,
    private _router: Router,
  ) { }

  /**
   * Ensures that all sidebars and toolbars are hidden away.
   */
  ngOnInit(): void {
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    this._sidebarService.hideSidebar();
  }

  /**
   * @return The BlockLanguages that are available for creation.
   */
  get availableBlockLanguages() {
    return (this._projectService.cachedProject.projectBlockLanguages);
  }

  /**
   * Actually creates the CodeResource
   */
  createCodeResource() {
    const p = this._projectService.cachedProject;
    const b = p.getBlockLanguage(this.blockLanguageId);

    console.log("Block", b);

    this._codeResourceService.createCodeResource(p, this.resourceName, this.blockLanguageId, b.defaultProgrammingLanguageId)
      .pipe(first())
      .subscribe(res => {
        p.addCodeResource(res);
        console.log("Hurra!")
      });
  }
}
