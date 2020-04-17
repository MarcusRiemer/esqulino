import { Component, Input, Output, EventEmitter } from '@angular/core';

import { first } from 'rxjs/operators';

import { Table, ColumnStatus } from '../../shared/schema'

import {
  AddNewColumn, DeleteColumn,
  SwitchColumnOrder, RenameColumn,
  ChangeColumnType, ChangeColumnPrimaryKey,
  ChangeColumnNotNull, ChangeColumnStandardValue,
  ChangeTableName, AddForeignKey, RemoveForeignKey
} from '../../shared/schema/table-commands'

import { SchemaService } from '../schema.service'
import { ProjectService, Project } from '../project.service'
import { ToolbarService } from '../toolbar.service'
import { DragulaService } from 'ng2-dragula'
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';


@Component({
  templateUrl: 'templates/schema-table-visual.html',
  selector: "sql-table-visual"
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

  constructor(
    private _schemaService: SchemaService,
    private _projectService: ProjectService,
    private _toolbarService: ToolbarService,
	private dragulaService: DragulaService,
    ) {
		let dragRef = this.dragulaService.dropModel("rows")
        .subscribe(({ name, el, target, source, sibling, sourceModel, item }) => {
			let newIndex = sourceModel.indexOf(item);
			
			this.commandsHolder.do(new SwitchColumnOrder(this.table, item.index, newIndex));
			console.log(newIndex);
      })
    this._subscriptionRefs.push(dragRef);
   }

  ngOnInit() {
    let subRef = this._projectService.activeProject
      .subscribe(res => {
        this._project = res;
      });
    this._subscriptionRefs.push(subRef);
    
    const toGroups = this.table.columns.map(column => {
      const a = new FormControl(column.not_null);
      return new FormGroup({
        name: new FormControl(column.name, Validators.required),
        type: new FormControl(column.type, Validators.required),
        not_null: new FormControl(column.not_null),
        dflt_value: new FormControl(column.dflt_value)
      });
    });
    this.controls = new FormArray(toGroups);

    let projref = this._projectService.activeProject
            .subscribe(res => {
              this._project = res; this._schemaService.initCurrentlyEdit(res.schema.getTable(this.table.name));
            })
          this._subscriptionRefs.push(projref);

    let btnCreate = this._toolbarService.addButton("save", "Speichern", "floppy-o", "s");
    subRef = btnCreate.onClick.subscribe(_ => {
      this.saveBtn();
    })
    this._subscriptionRefs.push(subRef);
  }

  ngOnDestroy() {
    this._subscriptionRefs.forEach(ref => ref.unsubscribe());
    this._subscriptionRefs = [];
  }
  
  private get commandsHolder() {
    return (this._schemaService.getCurrentlyEditedStack());
  }
  
  saveTempValue(oldValue: string) {
    this._oldValue = oldValue;
  }

  saveBtn() {
      this.commandsHolder.prepareToSend();
      let schemaref = this._schemaService.sendAlterTableCommands(this._project, this.table.name, this.commandsHolder)
        .pipe(first())
        .subscribe(
          _ => {
            this._schemaService.clearCurrentlyEdited();
          },
          /** error => this.showError(error) */ );
      this._subscriptionRefs.push(schemaref);
  }

  changedColumnName(index: number, newValue: string) {
    if (this._oldValue != newValue) {
      this.commandsHolder.do(new RenameColumn(this.table, index, this._oldValue, newValue));
      this._oldValue = "";
    }
  }

  deleteTable() {
    this._schemaService.deleteTable(this._project, this.table)
      .pipe(first())
      .subscribe(res => res, error => this.showError(error));
  }

  showError(error: any) {
    window.alert(`Ein Fehler ist aufgetreten!\nNachricht: ${error.json().errorBody.toString().replace(new RegExp("\\\\", 'g'), '')}`);
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


