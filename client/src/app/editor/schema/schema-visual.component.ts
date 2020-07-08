import { Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";

import { map, flatMap, first, share } from "rxjs/operators";
import { zip } from "rxjs";

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
    private _http: HttpClient,
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

  public con = [];

  readonly schemaRevision = this._schemaService.changeCount;

  readonly schemaName = this._route.paramMap.pipe(
    map((p) => p.get("schemaName"))
  );

  readonly visualSchemaUrl = zip(this.schemaRevision, this.schemaName).pipe(
    map(
      ([rev, name]) =>
        `/api/project/${this.project.slug}/db/${name}/visual_schema?format=svg&revision=${rev}`
    )
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

    let schemaUrl = this.visualSchemaUrl.subscribe((url) => {
      let visualSchemaText = this._http.get(url, { responseType: "text" });
      let schemaRef = visualSchemaText.subscribe(
        (data) => {
          this.parseSchemaText(data);
          console.log(data);
        },
        (error) => {
          console.log(error);
        }
      );
    });
  }

  private get commandsHolder() {
    return this._schemaService.getCurrentlyEditedStack();
  }

  private parseSchemaText(text: any) {
    // let connectors = text.edges;
    // let coords = [];

    // for (var i = 0; i < connectors.length; i++) {
    // this.con[i] = [];

    // let points = connectors[i].pos.split(" ");

    // coords = points[0].split(",");
    // this.con[i].push({ x: coords[1], y: coords[2] });

    // for (var p = 2; p < points.length; p++) {
    // coords = points[p].split(",");
    // this.con[i].push({ x: coords[0], y: coords[1] });
    // }

    // coords = points[1].split(",");
    // this.con[i].push({ x: coords[1], y: coords[2] });
    // }

    let coords = [];
    let parser = new DOMParser();
    let svgDom = parser.parseFromString(text, "image/svg+xml");

    let nodes = svgDom.getElementById("graph0").getElementsByTagName("g");

    for (var i = 0; i < nodes.length; i++) {
      let path = nodes[i].children[1].getAttribute("d");
      if (path) {
        console.log(path);
        this.con[i] = path;
      }
    }
  }

  ngOnDestroy() {
    this._subscriptionRefs.forEach((ref) => ref.unsubscribe());
    this._subscriptionRefs = [];
  }
}
