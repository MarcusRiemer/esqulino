import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs'
import { tap, flatMap } from 'rxjs/operators';

import { CodeResource, NodeLocation, Tree } from '../shared/syntaxtree';

import { ProjectService } from './project.service';
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

  private _executionLocation = new BehaviorSubject<NodeLocation>(undefined);

  constructor(
    private _sidebarService: SidebarService,
    private _projectService: ProjectService,
  ) {
    // Things that need to happen every time the resource changes
    this._codeResource
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
  }

  /**
   * Allows to change the resource that is currently displayed.
   *
   * @remarks This is meant to be updated in conjunction with the URL.
   */
  _changeCurrentResource(codeResourceId: string) {
    // Knowing when resources change is handy for debugging
    console.log(`Current resource ID changed to: ${codeResourceId}`);

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
  readonly currentResource: Observable<CodeResource> = this._codeResource;

  /**
   * Informs interested components about the tree behind the current resource
   */
  readonly currentTree: Observable<Tree> = this._codeResource.pipe(
    flatMap(c => c.syntaxTree)
  );

  /**
   *
   */
  readonly currentExecutionLocation: Observable<NodeLocation> = this._executionLocation;

  /**
   * The currently loaded resource
   */
  get peekResource() {
    return (this._codeResource.value);
  }

  /**
   * Broadcasts a new execution location.
   */
  setCurrentExecutionLocation(loc?: NodeLocation) {
    this._executionLocation.next(loc);
  }
}
