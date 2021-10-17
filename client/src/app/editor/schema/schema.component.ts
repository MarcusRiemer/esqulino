import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";

import { map, flatMap, first, share } from "rxjs/operators";
import { zip } from "rxjs";

import { ServerApiService } from "../../shared";

import { ProjectService, Project } from "../project.service";
import { EditDatabaseSchemaService } from "../edit-database-schema.service";
import { SidebarService } from "../sidebar.service";
import { EditorToolbarService } from "../toolbar.service";

/**
 * A class as entry-point for the representation of a schema
 */
@Component({
  templateUrl: "templates/schema.html",
})
export class SchemaComponent implements OnInit {
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
    private _sanitizer: DomSanitizer,
    private _http: HttpClient,
    private _projectService: ProjectService,
    private _toolbarService: EditorToolbarService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _sidebarService: SidebarService,
    private _schemaService: EditDatabaseSchemaService,
    private _serverApi: ServerApiService
  ) {}

  /**
   * @return True, if this is an empty schema
   */
  get isEmpty() {
    return this.project && this.project.schema.isEmpty;
  }

  /**
   * @return A number that is unique for each state of the database
   *         over the course of the current session.
   */
  readonly schemaRevision = this._schemaService.changeCount;

  /**
   * The name of the schema that is currently edited.
   */
  readonly schemaName = this._route.paramMap.pipe(
    map((p) => p.get("schemaName"))
  );

  /**
   * The URL that may be used to request a schema
   */
  readonly visualSchemaUrl = zip(this.schemaRevision, this.schemaName).pipe(
    map(
      ([rev, name]) =>
        `/api/project/${this.project.id}/db/${name}/visual_schema?format=svg&revision=${rev}`
    )
  );

  /**
   * The SVG DOM of the currently edited schema.
   */
  readonly visualSchemaDom = this.visualSchemaUrl.pipe(
    flatMap((url) => this._http.get(url, { responseType: "text" })),
    first(),
    share(),
    map((svg) =>
      svg.replace(/<svg width="(\d+pt)" height="\d+pt"/, '<svg width="$1"')
    ),
    map((svg) => this._sanitizer.bypassSecurityTrustHtml(svg))
  );

  /**
   * Load the project to access the schema
   */
  ngOnInit() {
    this._sidebarService.hideSidebar();

    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    // Button to show the preview of the currently editing table
    let btnCreate = this._toolbarService.addButton(
      "createTable",
      "Neue Tabelle",
      "table",
      "n"
    );
    let subRef = btnCreate.onClick.subscribe((_) => {
      this._router.navigate(["./create"], { relativeTo: this._route });
    });
    this._subscriptionRefs.push(subRef);

    // Button to switch to data import, only shown if there is
    // a table the data could be imported to
    if (!this.isEmpty) {
      let btnImport = this._toolbarService.addButton(
        "importTable",
        "Daten Importieren",
        "file-text",
        "i"
      );
      subRef = btnImport.onClick.subscribe((_) => {
        this._router.navigate(["./import"], { relativeTo: this._route });
      });
      this._subscriptionRefs.push(subRef);
    }

    // Butto to switch to database import
    let btnUpload = this._toolbarService.addButton(
      "uploadDatabase",
      "Datenbank hochladen",
      "upload",
      "u"
    );
    subRef = btnUpload.onClick.subscribe((_) => {
      this._router.navigate(["./upload"], { relativeTo: this._route });
    });
    this._subscriptionRefs.push(subRef);

    // Butto to switch to database import
    let btnDownload = this._toolbarService.addButton(
      "downloadDatabase",
      "Datenbank herunterladen",
      "download",
      "d"
    );
    subRef = btnDownload.onClick.subscribe((_) => {
      window.location.href = this._serverApi.downloadDatabase(
        this.project.id,
        this.project.currentDatabaseName
      );
    });
    this._subscriptionRefs.push(subRef);

    // Ensure that the active project is always available
    subRef = this._projectService.activeProject.subscribe((res) => {
      this.project = res;
    });
    this._subscriptionRefs.push(subRef);
  }

  ngOnDestroy() {
    this._subscriptionRefs.forEach((ref) => ref.unsubscribe());
    this._subscriptionRefs = [];
  }
}
