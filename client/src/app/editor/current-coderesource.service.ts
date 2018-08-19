import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs'
import { tap } from 'rxjs/operators';

import { CodeResource } from '../shared/syntaxtree';

import { ProjectService, Project } from './project.service';
import { SidebarService } from './sidebar.service';

// TODO: Promote the new sidebar system
import { CodeSidebarComponent } from './code/code.sidebar'

/**
 * This service represents a single code resource that is currently beeing
 * edited. It glues together the actual resource that is beeing edited and
 * enables components like the validator and the compiler to automatically
 * do their work.
 */
@Injectable()
export class CurrentCodeResourceService {
  /**
   * The resource that is currently edited.
   */
  private _codeResource = new BehaviorSubject<CodeResource>(undefined);

  constructor(
    private _sidebarService: SidebarService,
    private _activatedRoute: ActivatedRoute,
    private _projectService: ProjectService,
  ) {
  }

  /**
   * Things that need to happen every time the resource changes
   */
  private readonly onResourceChange = this._codeResource
    .pipe(
      tap(r => {
        if (r) {
          // Show the new sidebar
          console.log("Sidebar change because of current code resource");
          this._sidebarService.showSingleSidebar(CodeSidebarComponent.SIDEBAR_IDENTIFIER, r);
        }
      })
    )
    .subscribe();

  currentResourceChanged(codeResourceId: string) {
    // Knowing when resources change is handy for debugging
    console.log(`New resource ID: ${codeResourceId}`);

    // Check whether the referenced resource exists
    if (codeResourceId) {
      // Yes, we resolve the actual resource
      const resource = this._projectService.cachedProject.getCodeResourceById(codeResourceId);
      console.log(`Set new resource "${resource.name}" (${codeResourceId})`);
      this._codeResource.next(resource);
    } else {
      // No, we inform everybody that there is no resource
      this._codeResource.next(undefined);
    }
  }

  /**
   * Informs interested components about the current resource.
   */
  get currentResource(): Observable<CodeResource> {
    return (this._codeResource);
  }

  get peekResource() {
    return (this._codeResource.value);
  }
}
