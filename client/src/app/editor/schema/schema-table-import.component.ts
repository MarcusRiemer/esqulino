import { Component, OnInit } from '@angular/core';
import * as Parser from '../../shared/csv-parser';
import { ProjectService, Project } from '../project.service'
import { Table } from '../../shared/schema';

/**
 * Displays the schema for a list of tables.
 */
@Component({
  templateUrl: 'templates/schema-table-import.html',
  selector: "sql-table-import"
})
export class SchemaTableImportComponent implements OnInit {
  // File Object as a string
  fileData: any;
    
  // parsed Data from file
  parse: Parser.CsvParseResult | Parser.CsvParseError;
  errors: Parser.ValidationError[];
  
  // Schema with the available tables
  schemaTables: Table[];
  selectedTable: Table;
  // Name needed for ngModel in select
  selectedTableName: string;

  // parse result or own definition
  header: string[];  
  // parse result
  table: string[][];

  // contains the selected header to map from the file
  // for every table column (empty =  don't map)
  selectedHeader: string[];

  // Contains all currently used Delimiters
  currentDelimiters: string[];

  disableSelection: boolean;
  disableHeadlineSelection: boolean;

  headlineUsage: "file" | "own";
  textMarker: '"' | "'";

  /**
   * Used for dependency injection.
   */
  constructor(
    private _projectService: ProjectService,
  ) {
  }

  ngOnInit() {
    this.disableSelection = true;
    this.disableHeadlineSelection = true;

    this.headlineUsage = "file";
    this.textMarker = '"';

    this.selectedHeader = [];

    this.currentDelimiters = [];
    this.toggleDelimiter(',');

    // Get tables for schema
    this.schemaTables = this._projectService.cachedProject.schema['tables'];
    // Init first table
    this.selectedTable = this.schemaTables[0];
    this.selectedTableName = this.selectedTable['name'];
  }

  changeListener(event): void {
    this.handleDataUpload(event.target);
  }

  readUploadedFileAsText = (inputFile) => {
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
  };

  handleDataUpload = async (event) => {
    const file = event.files[0];

    try {
      // Wait until the File is read
      this.fileData = await this.readUploadedFileAsText(file);
      this.parseProcess();

    } catch (e) {
      console.warn(e.message);
    }
  }

  parseProcess = () => {
    this.parse = Parser.convertCSVStringToArray(this.fileData, this.currentDelimiters, this.textMarker);

    if (this.parse.type === 'parseResult') {
      this.header = (<Parser.CsvParseResult>this.parse).header;
      this.table = (<Parser.CsvParseResult>this.parse).table;

      this.disableHeadlineSelection = false;

      this.selectedTable = this.getMostSuitableTable(this.header, this.schemaTables);      
      this.selectedTableName = this.selectedTable['name'];
      this.selectMatchingCols();
    } 
    else if (this.parse.type === 'parseError') {
      this.errors = (<Parser.CsvParseError>this.parse).errors;
      this.disableHeadlineSelection = true;
    }

    this.disableSelection = false;
  }

  // Select the matching headline col for each table col or empty
  selectMatchingCols() {
      for(let i = 0; i < this.selectedTable['columns'].length; i++) {      
        this.selectedHeader[i] = this.header.filter(col => col === this.selectedTable['columns'][i].name)[0];
        if(!this.selectedHeader[i]) {
          this.selectedHeader[i] = "empty";
        }          
      }
  }

  // change selected table and selected headline cols
  changeTable() {
    // Filter the wanted table by the name from ngModel in select
    this.selectedTable = (this.schemaTables.filter(table => this.selectedTableName === table['name']))[0];
    // Select the matching headline col for each table col or empty
    this.selectMatchingCols();
  }

  // returns true if the col is currently selected for mapping
  colSelected(index: number) {
    return this.selectedHeader.includes(this.header[index]);
  }

  save() {
    // TODO
    console.log("selected table: ", this.selectedTable);
    console.log("header: ", this.header);
    console.log("table: ", this.table);

    // "columnNames" => ['key', 'value'],
    // "data" => [
    // ['1', 'eins'],


    // gehe alle selectedTableColumns durch
    this.selectedTable['columns'].forEach(col => console.log(col.name));
      // prüfen, ob name jeweils in used index Zeile vorhanden
      // next TODO: greife dafür aufs select zu

      // Wenn doppelte oder fehlende
        // direkt Fehlermeldung

        // sonst push namen in columnNames array

        // WENN die typen der spalte stimmen
          // hole die spalte anhand der gemappten headline und pushe auf data array 
          //  sonst Fehlermeldung

    // gebe objekt mit columnNames und data aus
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  /* ----- Toggles ----- */

  toggleHeadlineUsage() {
    if (this.headlineUsage == "own") {
      // copy header instead of reference
      let headerCopy = this.header.slice();
      // set header copy as first table line  
      this.table.unshift(headerCopy);
      // empty current header
      this.header = [];
      // use length of first table row
      this.header.length = this.table[0].length;
    } else if (this.headlineUsage === "file") {
      // set first table row as header
      this.header = this.table.shift();
    }
  }

  toggleDelimiter(delimiter: string) {
    if (this.currentDelimiters.includes(delimiter)) {
      this.currentDelimiters.splice(this.currentDelimiters.indexOf(delimiter), 1);
    } else {
      this.currentDelimiters.push(delimiter);

    }
    if (this.fileData) {
      this.parseProcess();
    }
  }

  toggleSemicolon() {
    this.toggleDelimiter(';');
  }

  toggleComma() {
    this.toggleDelimiter(',');
  }

  toggleSpace() {
    this.toggleDelimiter(' ');
  }

  toggleTab() {
    this.toggleDelimiter('  ');
  }

  changeMarker() {
    if (this.fileData) {
      this.parseProcess();
    }
  }

  /* ----- To outsource ----- */

  // count the matching column names from a table and a headline
  countMatchingNames(headline: string[], table: Table): number {
    let counter = 0;

    // iterate through table columns
    for(let i = 0; i < table['columns'].length; i++) {      
      // filter matching headline col names with table col
      let matchingNames = headline.filter(col => col === table['columns'][i].name);
      // at least one match found
      if(matchingNames.length) {
        counter++;
      }          
    } 

    return counter;
  }

  // Get the most suitable table for a given headline
  // returns the table with the most count of matching names
  // return the first table if no matching name
  getMostSuitableTable(headline: string[], tables: Table[]) : Table {
    let resultTable: Table = tables[0];
    let maxMatches: number = 0;

    // check each table for more matches than current max
    tables.forEach(table => {
      let matches = this.countMatchingNames(headline, table);      
      if (matches > maxMatches) {
        resultTable = table;
        maxMatches = matches;
      }
    });

    return resultTable;
  }

}