import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";

import { map, first } from "rxjs/operators";
import { zip } from "rxjs";

import { Table, ColumnStatus } from "../../shared/schema";

import {
  AddNewColumn,
  DeleteColumn,
  SwitchColumnOrder,
  RenameColumn,
  ChangeColumnType,
  ChangeColumnPrimaryKey,
  ChangeColumnNotNull,
  ChangeColumnStandardValue,
  ChangeTableName,
  AddForeignKey,
  RemoveForeignKey,
} from "../../shared/schema/table-commands";

import { SchemaService } from "../schema.service";
import { ProjectService, Project } from "../project.service";
import { EditorToolbarService } from "../toolbar.service";
import { DragulaService } from "ng2-dragula";
import { FormGroup, FormArray, FormControl, Validators } from "@angular/forms";

@Component({
  templateUrl: "templates/schema-table-visual.html",
  selector: "sql-table-visual",
})
export class SchemaTableVisualComponent {
  @Input() table: Table;

  private _project: Project;

  private _subscriptionRefs: any[] = [];

  @Input() readOnly: boolean;

  controls: FormArray;

  private _oldValue: string;

  editingEnabled: boolean = false;

  dbErrorCode: number = -1;

  public rowList = {};

  public xPos = 0;
  public yPos = 0;
  public width = 0;

  constructor(
    private _http: HttpClient,
    private _schemaService: SchemaService,
    private _projectService: ProjectService,
    private _toolbarService: EditorToolbarService,
    private _route: ActivatedRoute,
    private dragulaService: DragulaService
  ) {}

  @HostBinding("style.position")
  position: string = "absolute";

  @HostBinding("style.left.px")
  get left(): number {
    return this.xPos;
  }

  @HostBinding("style.top.px")
  get top(): number {
    return this.yPos;
  }
  
  public nameLength = 0;
  
  public con = [];

  readonly schemaRevision = this._schemaService.changeCount;

  readonly schemaName = this._route.paramMap.pipe(
    map((p) => p.get("schemaName"))
  );

  readonly visualSchemaUrl = zip(this.schemaRevision, this.schemaName).pipe(
    map(
      ([rev, name]) =>
        `/api/project/${this._project.slug}/db/${name}/visual_schema?format=json&revision=${rev}`
    )
  );

  ngOnInit() {
    let subRef = this._projectService.activeProject.subscribe((res) => {
      this._project = res;
    });
    this._subscriptionRefs.push(subRef);

    const toGroups = this.table.columns.map((column) => {
      const a = new FormControl(column.not_null);
      return new FormGroup({
        name: new FormControl(column.name, Validators.required),
        type: new FormControl(column.type, Validators.required),
        not_null: new FormControl(column.not_null),
        dflt_value: new FormControl(column.dflt_value),
      });
    });
    this.controls = new FormArray(toGroups);

    let projref = this._projectService.activeProject.subscribe((res) => {
      this._project = res;
      this._schemaService.initCurrentlyEdit(
        res.schema.getTable(this.table.name)
      );
    });
    this._subscriptionRefs.push(projref);

    let dragRef = this.dragulaService
      .dropModel(this.table.name)
      .subscribe(({ name, el, target, source, sibling, sourceModel, item }) => {
        let newIndex = sourceModel.indexOf(item);

        this._schemaService.initCurrentlyEdit(
          this._project.schema.getTable(this.table.name)
        );
        this.commandsHolder.do(
          new SwitchColumnOrder(this.table, item.index, newIndex)
        );
        this.saveChanges();
      });
    this._subscriptionRefs.push(dragRef);

    let schemaUrl = this.visualSchemaUrl.subscribe((url) => {
      let visualSchemaText = this._http.get(url, { responseType: "json" });
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
	
	this.getNameLength();
  }

  ngOnDestroy() {
    this._subscriptionRefs.forEach((ref) => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  private get commandsHolder() {
    return this._schemaService.getCurrentlyEditedStack();
  }

  saveTempValue(oldValue: string) {
    this._oldValue = oldValue;
  }

  changedColumnName(index: number, newValue: string) {
    if (this._oldValue != newValue) {
      this._schemaService.initCurrentlyEdit(
        this._project.schema.getTable(this.table.name)
      );

      this.commandsHolder.do(
        new RenameColumn(this.table, index, this._oldValue, newValue)
      );
      this._oldValue = "";

      this.saveChanges();
    }
  }

  changedColumnType(index: number, newValue: string) {
    if (this._oldValue != newValue) {
      this._schemaService.initCurrentlyEdit(
        this._project.schema.getTable(this.table.name)
      );

      this.commandsHolder.do(
        new ChangeColumnType(this.table, index, this._oldValue, newValue)
      );
      this._oldValue = "";

      this.saveChanges();
    }
  }

  async saveChanges() {
    this.commandsHolder.prepareToSend();
    await this._schemaService.sendAlterTableCommands(
      this._project,
      this._schemaService.getCurrentlyEditedTable().name,
      this.commandsHolder
    );

    this._schemaService.clearCurrentlyEdited();
  }

  async deleteTable() {
    try {
      await this._schemaService.deleteTable(this._project, this.table);
    } catch (error) {
      this.showError(error);
    }
  }

  ChangeColumnPrimaryKeyStatus(row: number) {
    this._schemaService.initCurrentlyEdit(
      this._project.schema.getTable(this.table.name)
    );

    this.commandsHolder.do(new ChangeColumnPrimaryKey(this.table, row));

    this.saveChanges();
  }

  changedTableName(newValue: string) {
    if (this._oldValue != newValue) {
      this._schemaService.initCurrentlyEdit(
        this._project.schema.getTable(this.table.name)
      );

      this.commandsHolder.do(
        new ChangeTableName(this.table, this._oldValue, newValue)
      );
      this._oldValue = "";

      this.saveChanges();
    }
  }

  ChangeColumnNotNullStatus(row: number) {
    this._schemaService.initCurrentlyEdit(
      this._project.schema.getTable(this.table.name)
    );

    this.commandsHolder.do(new ChangeColumnNotNull(this.table, row));

    this.saveChanges();
  }

  private parseSchemaText(text: any) {
    let nodes = text.objects;
	let connectors = text.edges;
	let coords = [];

    for (var i = 1; i < nodes.length; i++) {
      if (this.table.name == nodes[i].name) {
        let points = nodes[i].pos;
        let positions = points.split(",");
        console.log(positions);

        this.xPos = +positions[0];
        this.yPos = +positions[1];
        this.width = nodes[i].width;
      }
    }
	
	for (var i = 0; i < connectors.length; i++) {
		this.con[i] = [];
		
		let points = connectors[i].pos.split(" ");
		
		coords = points[0].split(",");
		this.con[i].push({ x: coords[1], y: coords[2] });
		
		for (var p = 2; p < points.length; p++) {
			coords = points[p].split(",");
			this.con[i].push({ x: coords[0], y: coords[1] });
		}
		
		coords = points[1].split(",");
		this.con[i].push({ x: coords[1], y: coords[2] });
	}
	console.log(this.con);
  }
  
  private getNameLength() {
	//forEach(this.table.columns, function(value, key) {
	//	if (value.name.length > this.nameLength){
	//		this.nameLength = value.name.length;
	//	}
	//});
	
	for(var i = 0; i < this.table.columns.length; i++) {
		if (this.table.columns[i].name.length > this.nameLength){
			this.nameLength = this.table.columns[i].name.length;
		}
	}
	console.log(this.nameLength);
  }

  showError(error: any) {
    window.alert(
      `Ein Fehler ist aufgetreten!\nNachricht: ${error
        .json()
        .errorBody.toString()
        .replace(new RegExp("\\\\", "g"), "")}`
    );
  }

  /**
getControl(index: number, field: string): FormControl {
    return this.controls.at(index).get(field) as FormControl;
}

updateField(index: number, field: string) {
    const control = this.getControl(index, field);

    if (control.valid) {
      this.table.columns = this.table.columns.map((e, i) => {
        if (index === i) {
          return {
            ...e,
            [field]: control.value
          }
        }
        return e;
      }) 
    }

  }  */
}
