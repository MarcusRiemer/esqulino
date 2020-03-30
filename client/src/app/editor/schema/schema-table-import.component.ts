import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";

import { MatSnackBar } from "@angular/material/snack-bar";

import * as Parser from "../../shared/csv-parser";
import { Table } from "../../shared/schema";
import { ServerApiService } from "../../shared";
import { ResponseTabularInsertDescription } from "../../shared/schema/schema.description";

import { ProjectService } from "../project.service";
import { EditorToolbarService } from "../toolbar.service";

import { first } from "rxjs/operators";

/**
 * Wizard-like UI to import CSV data into a table.
 */
@Component({
  templateUrl: "templates/schema-table-import.html",
})
export class SchemaTableImportComponent implements OnInit {
  // file object as a string
  fileData: any;

  // parsed data from file
  parse: Parser.CsvParseResult | Parser.CsvParseError;
  errors: Parser.ValidationError[];

  // schema with the available tables
  schemaTables: Table[];
  // extracted table and col names of the schema
  tableNames: string[];
  colNamesForTables: string[][];

  // the currently selected Table
  selectedTable: Table;
  // name needed for ngModel in select
  selectedTableName: string;

  // parse result or own definition
  csvHeader: string[];
  // parse result
  csvTable: string[][];

  // contains the header index for each column of the table
  // when nothing is selected the index will be -1
  selectedHeaderIndex: number[];

  // contains all currently used Delimiters
  currentDelimiters: string[];

  disableSelection: boolean;
  disableHeadlineSelection: boolean;
  disableButton: boolean;

  headlineUsage: "file" | "own";
  textMarker: '"' | "'";

  uploadError: any = "";

  /* ----- Initializations ----- */

  // used for dependency injection
  constructor(
    private _projectService: ProjectService,
    private _toolbarService: EditorToolbarService,
    private _serverApi: ServerApiService,
    private _http: HttpClient,
    private _route: ActivatedRoute,
    private _snackbar: MatSnackBar
  ) {}

  // used for inits
  ngOnInit() {
    // There are no toolbar items associated with this wizard-like component
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    this.disableSelection = true;
    this.disableHeadlineSelection = true;
    this.disableButton = true;

    this.headlineUsage = "file";
    this.textMarker = '"';

    this.selectedHeaderIndex = [];

    this.currentDelimiters = [];
    this.toggleDelimiter(",");

    // Get tables for schema
    this.schemaTables = this._projectService.cachedProject.schema["tables"];

    // Init first table
    this.selectedTable = this.schemaTables[0];
    this.selectedTableName = this.selectedTable["name"];

    // Extract table and col names of the schema
    this.tableNames = this.schemaTables.map((table) => table["name"]);
    this.colNamesForTables = [];
    this.schemaTables.forEach((table) => {
      this.colNamesForTables.push(this.extractColNames(table));
    });
  }

  /* ----- Helper Function ----- */

  // returns an array that contains
  // only the column names of a given table
  extractColNames(table: Table): string[] {
    return table["columns"].map((col) => col["name"]);
  }

  /* ----- Component behaviour ----- */

  // change selected table and selected headline cols
  // and handles button enabling table is selected
  changeTable(name: string) {
    // Filter the wanted table by the name from ngModel in select
    this.selectedTable = this.schemaTables.filter(
      (table) => name === table["name"]
    )[0];
    // Select the matching headline col for each table col or empty
    this.selectedHeaderIndex = Parser.getMatchingCols(
      this.extractColNames(this.selectedTable),
      this.csvHeader
    );
    this.disableButton = this.noMappingValueSelected(this.selectedHeaderIndex);
  }

  // ng Model for selected Header Index uses strings for the indices
  // this functions casts the string directly to a number (needed for comparison)
  // and handles button enabling after mapping col is selected
  changeColumn(index: number) {
    this.selectedHeaderIndex[index] = +this.selectedHeaderIndex[index];
    this.disableButton = this.noMappingValueSelected(this.selectedHeaderIndex);
  }

  // returns true if no mapping value is selected (for button disabling)
  noMappingValueSelected(values: number[]): boolean {
    return values.filter((index) => index !== -1).length === 0;
  }

  // returns true if the col index (of the csv parse result) is currently selected for mapping
  colSelected(index: number): boolean {
    return this.selectedHeaderIndex.includes(+index);
  }

  // Does the actual mapping and sends a request to the server
  importTable() {
    const uploadData = Parser.getMappingResult(
      this.extractColNames(this.selectedTable),
      this.selectedHeaderIndex,
      this.csvTable
    );

    const projectId = this._projectService.cachedProject.id;
    const schemaName = this._route.snapshot.paramMap.get("schemaName");
    const tableName = this.selectedTableName;
    const url = this._serverApi.uploadTabularData(
      projectId,
      schemaName,
      tableName
    );

    this._http
      .post(url, uploadData)
      .pipe(first())
      .subscribe(
        (res: ResponseTabularInsertDescription) =>
          this._snackbar.open(
            `Tabelle "${tableName}": ${res.numInsertedRows} Zeilen eingefügt, ${res.numTotalRows} Zeilen insgesamt.`,
            null,
            {
              duration: 5000,
            }
          ),
        (err) => alert(JSON.stringify(err))
      );
  }

  // needed for defining independent own headlines
  // tracks which items are added or removed
  // by returning the unique identifier (index) for this item
  trackByFn(index: any) {
    return index;
  }

  /* ----- Toggles ----- */

  // use own headline definitions or the first row from the file
  toggleHeadlineUsage() {
    if (this.headlineUsage == "own") {
      // copy header instead of reference
      let headerCopy = this.csvHeader.slice();
      // set header copy as first table line
      this.csvTable.unshift(headerCopy);
      // empty current header
      this.csvHeader = [];
      // use length of first table row
      this.csvHeader.length = this.csvTable[0].length;
      // disable other selections
      this.disableSelection = true;
    } else if (this.headlineUsage === "file") {
      // set first table row as header
      this.csvHeader = this.csvTable.shift();
      // enable other selections
      this.disableSelection = false;
    }
    // reset selected mapping values and enable / disable import button
    this.selectedHeaderIndex = Parser.getMatchingCols(
      this.extractColNames(this.selectedTable),
      this.csvHeader
    );
    this.disableButton = this.noMappingValueSelected(this.selectedHeaderIndex);
  }

  // add or remove a given delimiter to the current delimiter selections
  // and restart the parse process
  toggleDelimiter(delimiter: string) {
    if (this.currentDelimiters.includes(delimiter)) {
      this.currentDelimiters.splice(
        this.currentDelimiters.indexOf(delimiter),
        1
      );
    } else {
      this.currentDelimiters.push(delimiter);
    }
    if (this.fileData) {
      this.parseProcess();
    }
  }

  // add or remove semicolon delimiter
  toggleSemicolon() {
    this.toggleDelimiter(";");
  }

  // add or remove comma delimiter
  toggleComma() {
    this.toggleDelimiter(",");
  }

  // add or remove space delimiter
  toggleSpace() {
    this.toggleDelimiter(" ");
  }

  // add or remove tab delimiter
  toggleTab() {
    this.toggleDelimiter("  ");
  }

  // restart the parse process after markers changed
  changeMarker() {
    if (this.fileData) {
      this.parseProcess();
    }
  }

  /* ----- File Handling ----- */

  // listen for file change
  changeListener(event) {
    this.handleDataUpload(event.target);
  }

  // start file reading process
  async handleDataUpload(event) {
    const file = event.files[0];

    try {
      // Wait until the File is read
      this.fileData = await this.readUploadedFileAsText(file);
      this.parseProcess();
    } catch (e) {
      console.warn(e.message);
    }
  }

  // file reading process
  readUploadedFileAsText(inputFile) {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result);
      };
      temporaryFileReader.readAsText(inputFile);
    });
  }

  // parse process when file is read or delimiters or markers have changed
  parseProcess() {
    this.parse = Parser.convertCSVStringToArray(
      this.fileData,
      this.currentDelimiters,
      this.textMarker
    );

    if (this.parse.type === "parseResult") {
      this.csvHeader = (<Parser.CsvParseResult>this.parse).header;
      this.csvTable = (<Parser.CsvParseResult>this.parse).table;

      this.disableHeadlineSelection = false;

      this.selectedTableName = Parser.getMostSuitableTableName(
        this.csvHeader,
        this.tableNames,
        this.colNamesForTables
      );
      this.selectedTable = this.schemaTables.filter(
        (table) => table["name"] === this.selectedTableName
      )[0];

      // use change table function for selected Header Index and disable Button status
      this.changeTable(this.selectedTableName);
    } else if (this.parse.type === "parseError") {
      this.errors = (<Parser.CsvParseError>this.parse).errors;
      this.disableHeadlineSelection = true;
    }

    this.disableSelection = false;
  }
}
