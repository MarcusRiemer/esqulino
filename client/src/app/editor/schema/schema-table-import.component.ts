import { Component, OnInit } from '@angular/core';
import * as Parser from '../../shared/csv-parser';
import { ProjectService, Project } from '../project.service'
import { Table } from '../../shared/schema';
import { Column } from '../../shared/schema/column';



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
  selectedTableColumns: Column[];
  selectedTableName: string;

  // parse result or own definition
  header: string[];  
  // parse result
  table: string[][];

  // use index for mapping
  // (init when header length available)
  useHeaderIndex: boolean[];

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

    this.useHeaderIndex = [];

    this.currentDelimiters = [];
    this.toggleDelimiter(',');

    this.selectedTableColumns = [];
    this.selectedTableName = "";
    this.schemaTables = this._projectService.cachedProject.schema['tables'];
    
    console.log("schema Tables: ", this.schemaTables);

    this.schemaTables.forEach(function(table) {
      console.log(table['_columns'].length);
    });

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

      // Init use header Index for the length of the header      
      for(let i = 0; i < this.header.length; i++) {
        this.useHeaderIndex.push(false);
      }

      this.mapColumns(this.header, this.getMostSuitableTable(this.header, this.schemaTables));      

      this.changeTable();
    } 
    else if (this.parse.type === 'parseError') {
      this.errors = (<Parser.CsvParseError>this.parse).errors;
      this.disableHeadlineSelection = true;
    }

    this.disableSelection = false;
  }

  mapColumns(headline: string[], table) {
    console.log("map Columns table ", table);
    this.selectedTableName = table._name;
    this.selectedTableColumns = table['_columns'];

    console.log("this.selectedTableName: ",this.selectedTableName);
    console.log("this.selectedTableColumns ", this.selectedTableColumns);
  }

  // Get the most suitable table for a given headline
  // (only measured by the length)
  // returns the first identical length or the closest lesser length
  getMostSuitableTable(headline: string[], tables) {
    let lengthFilter = [];

    // Use the first with identical length
    lengthFilter = tables.filter(table => table['columns'].length === headline.length)[0];
 
    // When no identical length availabe 
    if (!lengthFilter) {
      //check for anything with lesser length
      lengthFilter = tables.filter(table => table['columns'].length < headline.length);

      // when more then one with lesser length
      if (lengthFilter.length > 1) {
        // use the max value (the closest length)
        lengthFilter = lengthFilter.reduce((prev, current) => (prev['columns'].length > current['columns'].length) ? prev : current);
      }
      else {
        // use the one lesser result
        lengthFilter = lengthFilter[0];
      }
    } // else return empty

    return lengthFilter;
  }


  changeTable() {
    // Filter the columns of the wanted table (not multiple tables)
    this.selectedTableColumns = (this.schemaTables.filter(table => this.selectedTableName === table['_name']))[0]['_columns'];

    //Activate the count of table columns
    for (let i = 0; i < this.useHeaderIndex.length; i++) {
      if (i < this.selectedTableColumns.length){
        this.useHeaderIndex[i] = true;
      }
      else {
        this.useHeaderIndex[i] = false;
      }      
    }    
  }


  trackByFn(index: any, item: any) {
    return index;
  }

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

  save() {
    // TODO
  }
}