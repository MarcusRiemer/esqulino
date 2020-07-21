import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { BehaviorSubject, Observable, zip } from "rxjs";
import { tap, catchError, first, map } from "rxjs/operators";

import { ServerApiService } from "../shared";

import { Project, ProjectService } from "./project.service";
import { Table, Schema } from "../shared/schema/";
import {
  RawTableDataDescription,
  TableDescription,
} from "../shared/schema/schema.description";
import { TableCommandHolder } from "../shared/schema/table-commands";

interface CurrentlyEdited {
  table?: Table;
  stack?: TableCommandHolder;
}

export interface TableData {
	xPos: number;
	yPos: number;
	width: number;
}

export interface SchemaData {
  tableData: {[tableName: string]: TableData};
  connectors: string[];
  height: number;
  completed: boolean;
}

/**
 * Service to hold, get and send data from a schema.
 */
@Injectable()
export class SchemaService {
  /**
   * The table that is currently edited.
   */
  private _currentlyEdited: CurrentlyEdited = undefined;

  /**
   * If a HTTP request is in progress, this is it.
   */
  private _httpRequest: Observable<RawTableDataDescription>;

  /**
   * Counts the number of changes that have been made to the current
   * schema in the current session.
   */
  private _changeCount = new BehaviorSubject(0);
  
  private _schemaData : SchemaData = { 
	tableData: {},
	connectors: [],
	height: 0,
	completed: false
  };

  /**
   * @param _http Used to do HTTP requests
   * @param _server Used to figure out paths for HTTP requests
   */
  constructor(
    private _http: HttpClient,
    private _projectService: ProjectService,
    private _server: ServerApiService
  ) {}

  /**
   * Set a new table as a currently edited table.
   */
  initCurrentlyEdit(table: Table) {
    let desc = table.toModel();
    this._currentlyEdited = {};
    this._currentlyEdited.table = new Table(
      desc,
      desc.columns,
      desc.foreign_keys
    );
    this._currentlyEdited.stack = new TableCommandHolder(
      this._currentlyEdited.table
    );
  }

  get currentSchema() {
    return this._projectService.cachedProject.schema;
  }

  get currentDatabaseName() {
    return this._projectService.cachedProject.currentDatabaseName;
  }

  /**
   * @return The table that is currently being edited.
   */
  getCurrentlyEditedTable(): Table {
    return this._currentlyEdited.table;
  }

  /**
   * @return The change stack that describes changes to the
   *         currently edited table.
   */
  getCurrentlyEditedStack(): TableCommandHolder {
    return this._currentlyEdited.stack;
  }

  /**
   * Retrieves the state of the currently edited table.
   */
  getCurrentlyEdited(): CurrentlyEdited {
    return this._currentlyEdited;
  }

  clearCurrentlyEdited() {
    this._currentlyEdited = undefined;
  }

  /**
   * The number of changes that have been made to the schema in the current
   * session.
   */
  get changeCount(): Observable<number> {
    return this._changeCount;
  }

  /**
   * Should be called after any change to the schema. This number is used
   * as a "sort of" version to decide whether the server should be asked
   * again for a updated representation of the schema.
   */
  private incrementChangeCount() {
    this._changeCount.next(this._changeCount.value + 1);
  }

  /**
   * Function to get table entries from a table with limit and offset
   * @param project - the current project
   * @param table - the table to get the entries from
   * @param from - the index to start getting the entries from
   * @param amount - the amount of entries to get
   */
  getTableData(
    project: Project,
    table: Table,
    from: number,
    amount: number
  ): Observable<RawTableDataDescription> {
    const url = this._server.getTableEntriesUrl(
      project.slug,
      project.currentDatabaseName,
      table.name,
      from,
      amount
    );

    this._httpRequest = this._http.get<RawTableDataDescription>(url, {
      headers: { "Content-Type": "application/json" },
    });

    return this._httpRequest;
  }

  /**
   * Function to get the amount of entries inside a table
   * @param project - the current project
   * @param table - the table to get the entries from
   */
  getTableRowAmount(project: Project, table: Table): Observable<number> {
    const url = this._server.getTableEntriesCountUrl(
      project.slug,
      project.currentDatabaseName,
      table.name
    );

    const toReturn = this._http
      .get<number>(url, { headers: { "Content-Type": "application/json" } })
      .pipe(catchError((res) => this.handleError(res)));

    return toReturn;
  }
  
  getSchemaData(project: Project): SchemaData {
	  let visualSchemaUrl = zip(this._changeCount, project.currentDatabaseName).pipe(
		map(
		  ([rev, name]) =>
			`/api/project/${project.slug}/db/${name}/visual_schema?format=svg&revision=${rev}`
		)
	  );
	  
	  let schemaUrl = visualSchemaUrl.subscribe((url) => {
		  let visualSchemaText = this._http.get(url, { responseType: "text" });
		  let schemaRef = visualSchemaText.subscribe(
			(data) => {
				this.parseSchemaText(data, project);
			},
			this.handleError,
			() => {
				this._schemaData.completed = true;
			}
		  );
	  });
	  
	  return this._schemaData;
  }
  
  private parseSchemaText(text: any, project: Project): void {
	
    let parser = new DOMParser();
    let svgDom = parser.parseFromString(text, "image/svg+xml");

    let nodes = svgDom.getElementById("graph0").getElementsByTagName("g");
	this._schemaData.height = +svgDom.children[0].getAttribute("height").split("p")[0];

    for (var i = 0; i < nodes.length; i++) {
      let children = nodes[i].children;
		if (nodes[i].classList[0] == "node") {
			let points = children[children.length - 1]
			  .getAttribute("points")
			  .split(" ");
			let positions = points[1].split(",");
			
			let index = 0;
			for(var i2 = 0; i2 < project.schema.tables.length; i2++) {
				if( project.schema.tables[i2].name == nodes[i].classList[1] ) {
					index = i2;
				}
			}

			let tableValues : TableData = {
				xPos : 0,
				yPos : 0,
				width : 0
			}
			tableValues.xPos = +positions[0];
			tableValues.yPos = +positions[1] + this._schemaData.height;
			tableValues.width = +points[2].split(",")[0] - +positions[0];
			//this._schemaData.tableData[index] = tableValues;
			this._schemaData.tableData[nodes[i].classList[1]] = tableValues;
		}
	
		let path = nodes[i].children[1].getAttribute("d");
		if (path) {
			this._schemaData.connectors[i] = path;
		}
	}
  }

  /**
   * Function to save a newly created table inside the database
   * @param project - the current project
   * @param table - the table to create inside the database
   */
  async saveNewTable(project: Project, table: Table): Promise<void> {
    const url = this._server.getCreateTableUrl(
      project.slug,
      project.currentDatabaseName
    );
    const body = JSON.stringify(table.toModel());

    const toReturn = this._http
      .post<void>(url, body, {
        headers: { "Content-Type": "application/json" },
      })
      .pipe(
        first(),
        tap(async () => {
          this.incrementChangeCount();
          await this._projectService.setActiveProject(project.slug, true);
          this.clearCurrentlyEdited();
        }),
        catchError(this.handleError)
      );
    return toReturn.toPromise();
  }

  /**
   * Function send table commands to alter a table
   * @param project - the current project
   * @param table - the table alter
   */
  async sendAlterTableCommands(
    project: Project,
    tableName: string,
    commandHolder: TableCommandHolder
  ): Promise<void> {
    const url = this._server.getTableAlterUrl(
      project.slug,
      project.currentDatabaseName,
      tableName
    );

    const body = JSON.stringify(commandHolder.toModel());

    const toReturn = this._http
      .post<void>(url, body, {
        headers: { "Content-Type": "application/json" },
      })
      .pipe(
        first(),
        catchError(this.handleError),
        tap(async () => {
          this.incrementChangeCount();
          await this._projectService.setActiveProject(project.slug, true);
          this.clearCurrentlyEdited();
        })
      );
    return toReturn.toPromise();
  }

  /**
   * Function to delete a table inside the database
   * @param project - the current project
   * @param table - the table to delete
   */
  async deleteTable(project: Project, table: Table): Promise<void> {
    const url = this._server.getDropTableUrl(
      project.slug,
      project.currentDatabaseName,
      table.name
    );

    const toReturn = this._http
      .delete<void>(url, { headers: { "Content-Type": "application/json" } })
      .pipe(
        first(),
        tap(async () => {
          this.incrementChangeCount();
          await this._projectService.setActiveProject(project.slug, true);
        }),
        catchError(this.handleError)
      );
    return toReturn.toPromise();
  }

  /**
   * React to a new schema that was sent by the server.
   */
  onSchemaUpdated(newSchema: TableDescription[]) {
    this._projectService.cachedProject.schema = new Schema(newSchema);
    this.incrementChangeCount();
  }

  private handleError(error: Response) {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error.json());
	console.error(error);
    return Observable.throw(error);
  }
}
