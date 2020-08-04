import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  OnInit,
} from "@angular/core";

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

import { SchemaService, TableData } from "../schema.service";
import { ProjectService, Project } from "../project.service";
import { EditorToolbarService } from "../toolbar.service";
import { DragulaService } from "ng2-dragula";

/**
 * Class for displaying individual tables
 */
@Component({
  templateUrl: "templates/schema-table-visual.html",
  selector: "sql-table-visual",
})
export class SchemaTableVisualComponent implements OnInit {
  /**
   * The table that is currently displayed.
   */
  @Input() table: Table;

  /**
   * The currently edited project
   */
  private _project: Project;

  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];

  private _oldValue: string;

  /**
   * Position and width of the table
   */
  @Input() data: TableData;

  /**
   * Constructor for dependency injection
   */
  constructor(
    private _schemaService: SchemaService,
    private _projectService: ProjectService,
    private _toolbarService: EditorToolbarService,
    private dragulaService: DragulaService
  ) {}

  /**
   * Configuring styles from the data input
   */
  @HostBinding("style.position")
  position: string = "absolute";

  @HostBinding("style.left.px")
  get left(): number {
    return this.data.xPos;
  }

  @HostBinding("style.top.px")
  get top(): number {
    return this.data.yPos;
  }

  @HostBinding("style.width.px")
  get tableWidth(): number {
    return this.data.width;
  }

  /**
   * Number of letters in the table name
   */
  public nameLength = 0;

  ngOnInit() {
    let subRef = this._projectService.activeProject.subscribe((res) => {
      this._project = res;
    });
    this._subscriptionRefs.push(subRef);

    let projref = this._projectService.activeProject.subscribe((res) => {
      this._project = res;
    });
    this._subscriptionRefs.push(projref);

    let dragRef = this.dragulaService
      .dropModel("tables")
      .subscribe(({ name, el, target, source, sibling, sourceModel, item }) => {
        if (
          source.id == this.table.name &&
          this._schemaService.getCurrentlyEdited() == undefined
        ) {
          if (source.id == target.id) {
            let newIndex = sourceModel.indexOf(item);

            this._schemaService.initCurrentlyEdit(this.table);
            this.commandsHolder.do(
              new SwitchColumnOrder(this.table, item.index, newIndex)
            );

            this.saveChanges();
          } else {
            if (
              this.table.columnIsForeignKeyOfTable(item.name) == undefined &&
              sibling
            ) {
              let targetTable = this._project.schema.getTable(target.id)
                .columns;

              if (
                this._schemaService.isSiblingType(
                  item.type,
                  sibling,
                  targetTable
                )
              ) {
                this._schemaService.initCurrentlyEdit(this.table);
                let siblingName = sibling.children[1].firstElementChild.getAttribute(
                  "ng-reflect-model"
                );

                this.commandsHolder.do(
                  new AddForeignKey(this.table, item.index, {
                    references: [
                      {
                        to_table: target.id,
                        from_column: item.name,
                        to_column: siblingName,
                      },
                    ],
                  })
                );

                this.saveChanges();
              }
            }
          }
        }
      });
    this._subscriptionRefs.push(dragRef);

    this.getNameLength();
  }

  /**
   * Unsubscribe from active subscribtions
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach((ref) => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  private get commandsHolder() {
    return this._schemaService.getCurrentlyEditedStack();
  }

  /**
   * Save current input value
   */
  saveTempValue(oldValue: string) {
    this._oldValue = oldValue;
  }

  changedColumnName(index: number, newValue: string) {
    if (
      this._oldValue != newValue &&
      this._schemaService.getCurrentlyEdited() == undefined
    ) {
      this._schemaService.initCurrentlyEdit(this.table);

      this.commandsHolder.do(
        new RenameColumn(this.table, index, this._oldValue, newValue)
      );
      this._oldValue = "";

      this.saveChanges();
    }
  }

  changedColumnType(index: number, newValue: string) {
    if (
      this._oldValue != newValue &&
      this._schemaService.getCurrentlyEdited() == undefined
    ) {
      this._schemaService.initCurrentlyEdit(this.table);

      this.commandsHolder.do(
        new ChangeColumnType(this.table, index, this._oldValue, newValue)
      );
      this._oldValue = "";

      this.saveChanges();
    }
  }

  /**
   * Function to save changes into the database
   */
  async saveChanges() {
    this.commandsHolder.prepareToSend();
    await this._schemaService.sendAlterTableCommands(
      this._project,
      this.table.name,
      this.commandsHolder
    );

    this._schemaService.clearCurrentlyEdited();
  }

  ChangeColumnPrimaryKeyStatus(row: number) {
    if (this._schemaService.getCurrentlyEdited() == undefined) {
      this._schemaService.initCurrentlyEdit(this.table);

      this.commandsHolder.do(new ChangeColumnPrimaryKey(this.table, row));

      this.saveChanges();
    }
  }

  changedTableName(newValue: string) {
    if (
      this._oldValue != newValue &&
      this._schemaService.getCurrentlyEdited() == undefined
    ) {
      this._schemaService.initCurrentlyEdit(this.table);

      this.commandsHolder.do(
        new ChangeTableName(this.table, this._oldValue, newValue)
      );
      this._oldValue = "";

      this.saveChanges();
    }
  }

  private getNameLength() {
    for (var i = 0; i < this.table.columns.length; i++) {
      if (this.table.columns[i].name.length > this.nameLength) {
        this.nameLength = this.table.columns[i].name.length;
      }
    }
  }

  /**
   * Function to show error alerts
   */
  showError(error: any) {
    window.alert(
      `Ein Fehler ist aufgetreten!\nNachricht: ${error
        .json()
        .errorBody.toString()
        .replace(new RegExp("\\\\", "g"), "")}`
    );
  }
}
