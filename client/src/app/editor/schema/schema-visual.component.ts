import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";

import { map } from "rxjs/operators";

import { ServerApiService } from "../../shared";

import { ProjectService, Project } from "../project.service";
import { SchemaService } from "../schema.service";
import { SidebarService } from "../sidebar.service";
import { EditorToolbarService } from "../toolbar.service";

@Component({
  templateUrl: "templates/schema-visual.html",
})
export class SchemaVisualComponent implements OnInit {
  public project: Project;

  private _subscriptionRefs: any[] = [];

  constructor(
    private _sanitizer: DomSanitizer,
    private _projectService: ProjectService,
    private _toolbarService: EditorToolbarService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _sidebarService: SidebarService,
    private _schemaService: SchemaService,
    private _serverApi: ServerApiService
  ) {}

  /**
   * @return True, if this is an empty schema
   */
  get isEmpty() {
    return this.project && this.project.schema.isEmpty;
  }

  public schemaData;

  readonly schemaName = this._route.paramMap.pipe(
    map((p) => p.get("schemaName"))
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

    this._toolbarService.savingEnabled = false;

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
	
	this.schemaData = this._schemaService.getSchemaData(this.project);
  }

  private get commandsHolder() {
    return this._schemaService.getCurrentlyEditedStack();
  }

  ngOnDestroy() {
    this._subscriptionRefs.forEach((ref) => ref.unsubscribe());
    this._subscriptionRefs = [];
  }
}
