import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { map } from "rxjs/operators";

import { ServerApiService } from "../../shared";

import { ProjectService, Project } from "../project.service";
import { SchemaService, SchemaData } from "../schema.service";
import { SidebarService } from "../sidebar.service";
import { EditorToolbarService } from "../toolbar.service";
import { DragulaService } from "ng2-dragula";

/**
 * Class for displaying the general schema
 */
@Component({
  templateUrl: "templates/schema-visual.html",
})
export class SchemaVisualComponent implements OnInit {
  /**
   * The currently edited project
   */
  public _project: Project;

  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];

  /**
   * Constructor for dependency injection.
   */
  constructor(
    private _projectService: ProjectService,
    private _toolbarService: EditorToolbarService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _sidebarService: SidebarService,
    private _schemaService: SchemaService,
    private _serverApi: ServerApiService,
    private dragulaService: DragulaService
  ) {
    dragulaService.createGroup("tables", {
      copy: (el, source) => {
        return false;
      },
      accepts: (el, target, source, sibling) => {
        let elName = el.children[1].firstElementChild.getAttribute(
          "ng-reflect-model"
        );
        let elType = el.children[2].firstElementChild.getAttribute(
          "ng-reflect-model"
        );
        let sourceTable = this._project.schema.getTable(source.id);
        let targetTable = this._project.schema.getTable(target.id).columns;

        if (target.id == source.id) {
          return true;
        } else if (sibling) {
          return (
            sourceTable.columnIsForeignKeyOfTable(elName) == undefined &&
            _schemaService.isSiblingType(elType, sibling, targetTable)
          );
        } else {
          return false;
        }
      },
    });
  }

  /**
   * @return True, if this is an empty schema
   */
  get isEmpty() {
    return this._project && this._project.schema.isEmpty;
  }

  public schemaData: SchemaData;

  /**
   * The name of the currently viewed schema.
   */
  readonly schemaName = this._route.paramMap.pipe(
    map((p) => p.get("schemaName"))
  );

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
      this._router.navigate(["../create"], { relativeTo: this._route });
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
        this._router.navigate(["../import"], { relativeTo: this._route });
      });
      this._subscriptionRefs.push(subRef);
    }

    // Button to switch to database import
    let btnUpload = this._toolbarService.addButton(
      "uploadDatabase",
      "Datenbank hochladen",
      "upload",
      "u"
    );
    subRef = btnUpload.onClick.subscribe((_) => {
      this._router.navigate(["../upload"], { relativeTo: this._route });
    });
    this._subscriptionRefs.push(subRef);

    // Button to switch to database import
    let btnDownload = this._toolbarService.addButton(
      "downloadDatabase",
      "Datenbank herunterladen",
      "download",
      "d"
    );
    subRef = btnDownload.onClick.subscribe((_) => {
      window.location.href = this._serverApi.downloadDatabase(
        this._project.id,
        this._project.currentDatabaseName
      );
    });
    this._subscriptionRefs.push(subRef);

    // Ensure that the active project is always available
    subRef = this._projectService.activeProject.subscribe((res) => {
      this._project = res;
    });
    this._subscriptionRefs.push(subRef);

    //Load the schema data
    this.schemaData = this._schemaService.getSchemaData(this._project);
  }

  /**
   * Unsubscribe from active subscribtions
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach((ref) => ref.unsubscribe());
    this._subscriptionRefs = [];
  }
}
