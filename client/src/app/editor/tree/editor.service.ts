import { BehaviorSubject, Observable } from 'rxjs'

import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { CodeResource } from '../../shared/syntaxtree';

import { ProjectService, Project } from '../project.service';
import { SidebarService } from '../sidebar.service';

import { TreeSidebarComponent } from './tree.sidebar';

/**
 * This service represents a single code resource that is currently beeing
 * edited. It is meant to be instanciated by every tree editor
 * to be available in all components of that editor.
 *
 * It glues together the actual resource that is beeing edited and ensures
 * that updates to that resource are validated and compiled.
 */
@Injectable()
export class TreeEditorService {
  /**
   * The resource that is currently edited.
   */
  private _codeResource = new BehaviorSubject<CodeResource>(undefined);


  constructor(
    private _sidebarService: SidebarService,
    private _routeParams: ActivatedRoute,
    private _projectService: ProjectService,
  ) {
    // Listen for changes in the current route to extract the resource
    this._routeParams.params.subscribe(params => {
      // Ensure the referenced resource exists
      const codeResourceId = params['resourceId'];
      if (!codeResourceId) {
        throw new Error(`Invalid code resource: "${codeResourceId}"`);
      }

      // Assign the resource
      const resource = this._projectService.cachedProject.getCodeResourceById(codeResourceId);
      this._codeResource.next(resource);
    });
  }

  /**
   * Things that need to happen every time the resource changes
   */
  private readonly onResourceChange = this._codeResource
    .distinctUntilChanged()
    .filter(r => !!r)
    .do(r => {
      console.log("New resource!", r);
      // Show the new sidebar
      this._sidebarService.showSingleSidebar(TreeSidebarComponent.SIDEBAR_IDENTIFIER, r);
    })
    .subscribe();

  get currentResource(): Observable<CodeResource> {
    return (this._codeResource);
  }

  get peekResource() {
    return (this._codeResource.value);
  }
}
