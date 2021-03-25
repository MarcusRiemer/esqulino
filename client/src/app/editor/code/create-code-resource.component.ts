import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { filter, first, map } from "rxjs/operators";

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
  selector: "create-code-resource",
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
  readonly createCodeResourcePermission$ = this._projectService.activeProject.pipe(
    map((p) => this._performData.project.update(p.id))
  );

  /**
   * @return The BlockLanguages that are available for creation.
   */
  readonly availableBlockLanguages$ = this._projectService.activeProject.pipe(
    filter((p) => !!p),
    map((p) =>
      p.usesBlockLanguages.map((u) => ({
        id: u.blockLanguageId,
        type: "blockLanguage",
      }))
    )
  );

  /**
   * Actually creates the CodeResource
   */
  async createCodeResource() {
    const p = this._projectService.cachedProject;
    const b = await p.resourceReferences.getBlockLanguage(
      this.blockLanguageId,
      "throw"
    );

    const res = await this._codeResourceService.createCodeResource(
      p,
      this.resourceName,
      this.blockLanguageId,
      b.defaultProgrammingLanguageId
    );

    p.addCodeResource(res);
    this._router.navigate([res.id], { relativeTo: this._route.parent });

    return res;
  }
}
