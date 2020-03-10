import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { first, switchMap, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';

import { EditorToolbarService } from '../toolbar.service';
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
    private _toolbarService: EditorToolbarService,
    private _sidebarService: SidebarService,
    private _projectService: ProjectService,
    private _codeResourceService: CodeResourceService,
    private _router: Router,
    private _route: ActivatedRoute,
  ) { }

  /**
   * Ensures that all sidebars and toolbars are hidden away.
   */
  ngOnInit(): void {
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    this._sidebarService.hideSidebar();

    // Possibly pre-select the first block language
    this.availableBlockLanguages$.pipe(
      first()
    ).subscribe(b => {
      if (b.length > 0) {
        this.blockLanguageId = b[0].id;
      };
    });
  }

  /**
   * @return The BlockLanguages that are available for creation.
   */
  readonly availableBlockLanguages$ = this._projectService.activeProject.pipe(
    switchMap(p => of(p.projectBlockLanguages))
  );

  /**
   * Actually creates the CodeResource
   */
  createCodeResource() {
    const p = this._projectService.cachedProject;
    const b = p.getBlockLanguage(this.blockLanguageId);

    const toReturn = this._codeResourceService.createCodeResource(
      p, this.resourceName, this.blockLanguageId, b.defaultProgrammingLanguageId
    ).pipe(
      first()
    );

    toReturn.subscribe(res => {
      p.addCodeResource(res);

      this._router.navigate([res.id], { relativeTo: this._route.parent });
    });

    return toReturn.toPromise();
  }
}
