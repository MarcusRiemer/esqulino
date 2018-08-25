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
  row:string[];

  constructor() {
    console.log("constructor ran");

  }

  ngOnInit() {
    console.log("ngOnInit ran");

    this.row = Parser.splitStringToRows('Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag');

    console.log(this.row);
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