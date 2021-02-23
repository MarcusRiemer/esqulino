import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { filter, first, switchMap } from "rxjs/operators";
import { of } from "rxjs";

import { PerformDataService } from "../../shared/authorisation/perform-data.service";

import { EditorToolbarService } from "../toolbar.service";
import { SidebarService } from "../sidebar.service";
import { ProjectService } from "../project.service";
import { CodeResourceService } from "../coderesource.service";

/**
 * Host-component for the front-page.
 */
@Component({
  templateUrl: "templates/create-code-resource.html",
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
    private _performData: PerformDataService
  ) {}

  /**
   * Ensures that all sidebars and toolbars are hidden away.
   */
  ngOnInit(): void {
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    this._sidebarService.hideSidebar();

    // Possibly pre-select the first block language
    this.availableBlockLanguages$.pipe(first()).subscribe((b) => {
      if (b.length > 0) {
        this.blockLanguageId = b[0].id;
      }
    });
  }

  /**
   * These permissions are required to add a code resource
   */
  readonly createCodeResourcePermission = this._performData.project.update(
    this._projectService.cachedProject.id
  );

  /**
   * @return The BlockLanguages that are available for creation.
   */
  readonly availableBlockLanguages$ = this._projectService.activeProject.pipe(
    filter((p) => !!p),
    switchMap((p) => of(p.projectBlockLanguages))
  );

  /**
   * Actually creates the CodeResource
   */
  async createCodeResource() {
    const p = this._projectService.cachedProject;
    const b = p.getBlockLanguage(this.blockLanguageId);

    const res = await this._codeResourceService
      .createCodeResource(
        p,
        this.resourceName,
        this.blockLanguageId,
        b.defaultProgrammingLanguageId
      )
      .pipe(first())
      .toPromise();

    p.addCodeResource(res);
    this._router.navigate([res.id], { relativeTo: this._route.parent });

    return res;
  }
}
