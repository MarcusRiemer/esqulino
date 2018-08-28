import { Component, OnInit } from '@angular/core';
import * as Parser from '../../shared/csv-parser';

/**
 * Displays the schema for a list of tables.
 */
@Component({
  templateUrl: 'templates/schema-table-import.html',
  selector: "sql-table-import"
})
export class SchemaTableImportComponent implements OnInit {
  fileData:any; // object as a string
  parse:Parser.CsvParseResult | Parser.CsvParseError;
  header:string[];
  table:string[][];
  errors:Parser.ValidationError[];

  constructor() {
    console.log("constructor ran");

  }

  ngOnInit() {
    console.log("ngOnInit ran");

  }

  changeListener($event): void {
    this.handleDataUpload($event.target);    
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
      console.warn(e.message)
    }
  }


  parseProcess = () => {
    this.parse = Parser.convertCSVStringToArray(this.fileData, [','], '"');

    if (this.parse.type === 'parseResult') {      
      this.header = (<Parser.CsvParseResult> this.parse).header;
      this.table = (<Parser.CsvParseResult> this.parse).table;
      console.log('header: ', this.header);
      console.log('table: ', this.table);
    } else {
      // TODO: Error handling
    }

  }

}

  /* ----- Frontend ----- */
  
  // Route in schema
  // Add to Module
  // Write Component

  // Upload Button
  // Settings
  // Preview Below

  // Bootstrap style error line for Error with information
  // Show only the first 20 lines if file to large and no parsing error occured