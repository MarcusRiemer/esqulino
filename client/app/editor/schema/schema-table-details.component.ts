import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'

import { Table } from '../../shared/schema'

import { SchemaService } from '../schema.service'
import { ProjectService, Project } from '../project.service'
import { ToolbarService } from '../toolbar.service'


/**
 * Displays the schema for a list of tables.
 */
@Component({
    templateUrl: 'app/editor/schema/templates/schema-table-details.html',
    selector: "sql-table-details",
    // styleUrls: ['app/editor/schema/style/schema-details.css']
})
export class SchemaTableDetailsComponent implements OnInit, OnDestroy {

    constructor(
        private _schemaService: SchemaService,
        private _projectService: ProjectService,
        private _routeParams: ActivatedRoute,
        private _router: Router,
        private _toolbarService: ToolbarService) {
    }

    /**
     * The currently shown table
     */
    table: Table;

    /**
    * The currently edited project
    */
    private _project: Project;

    /**
     * The entrys inside of the table
     */
    tableData: string[][];

    /**
     * The amount of Rows inside the table;
     */
    private _tableRowAmount: number;

    /**
     * The amount of rows to show
     */
    private _showRowAmount: number = 10;

    /**
     * The index from where to show the table rows
     */
    private _showRowFrom: number = 0;

    /**
     * Subscriptions that need to be released
     */
    private _subscriptionRefs: any[] = [];

    /**
     * True, if creation should be allowed from this component.
     */
    @Input() isChild: boolean = false;
    private dummyData: any;

    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        console.log("Details loading!");
        let subRef = this._routeParams.params.subscribe(params => {
            var tableName = params['tableName'];
            this._projectService.activeProject
                .subscribe(res => {
                    this._project = res;
                    this.table = res.schema.getTable(tableName);
                })
        });
        this._subscriptionRefs.push(subRef);

        //Getting the entries from a table with limit and count
        subRef = this._schemaService.getTableData(this._project, this.table, this._showRowFrom, this._showRowAmount)
            .subscribe(res => { this.tableData = res; });
        this._subscriptionRefs.push(subRef);

        //Calculating the amount of rows inside the table
        subRef = this._schemaService.getTableRowAmount(this._project, this.table)
            .subscribe(res =>{ this._tableRowAmount = res[0];})
        this._subscriptionRefs.push(subRef);

        if (!this.isChild) {
            this._toolbarService.resetItems();
            this._toolbarService.savingEnabled = false;
            let btnCreate = this._toolbarService.addButton("back", "Zurück", "arrow-left", "b");
            subRef = btnCreate.onClick.subscribe((res) => {
                this.backBtn();
            })
            this._subscriptionRefs.push(subRef);
        }

    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach(ref => ref.unsubscribe());
        this._subscriptionRefs = [];
    }

    set showAmount(amount: number | string) {
        amount = +amount;
        this._showRowFrom = 0;
        this._showRowAmount = amount;
        this._schemaService.getTableData(this._project, this.table, this._showRowFrom, this._showRowAmount);
    }

    get showAmount() {
        return (this._showRowAmount);
    }

    nextRowSite() {
        if ((this._showRowFrom + this._showRowAmount) < this._tableRowAmount) {
            this._showRowFrom += this._showRowAmount;
            this._schemaService.getTableData(this._project, this.table, this._showRowFrom, this._showRowAmount);
        }
    }

    prevRowSite() {
        if (this._showRowFrom > 0) {
            if (this._showRowFrom > this._showRowAmount) {
                this._showRowFrom -= this._showRowAmount;
            } else {
                this._showRowFrom = 0;
            }
            this._schemaService.getTableData(this._project, this.table, this._showRowFrom, this._showRowAmount);
        }
    }

    backBtn() {
        console.log("Zurück!");
        //ToDo: Navigates to the Home Screen, instead of one site up.
        this._router.navigate([".."]);
    }
}