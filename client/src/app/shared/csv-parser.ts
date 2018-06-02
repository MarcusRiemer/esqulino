import { SplitInterpolation } from "@angular/compiler";

/*
	To Fix:

	  Bug: No Content before and after Marker

	  Escaping: write for \"  only " out instead of using it as marker
	  e.g. 1, Montag, “Religion (\”ev\”, \”kath\”)”

*/

/* ----- Interfaces ----- */

/**
 * The Parse Result of the CSV File
 * First Line will always be handled as header
 */
export interface CsvParseResult {
	type: "parseResult",
	header: string[],
	table: string[][];
}

/**
 * The Parse Errors of the CSV File
 * Consist of only one String Array which contains all Error Messages
 */
export interface CsvParseError {
	type: "parseError",
	errors: ValidationError[];
}

/* --- Helper --- */

/**
 * A row consists of an array of columns as strings
 */
export interface RowData {
	type: "row",
	data: string[];
}

/* --- Error --- */

/**
 * Error Interface for wrong column count.
 * Used when the column count of a row 
 * doesn't match the column count of the first line
 * (as described in information)
 * Contains column count of the faulty row as count and
 * column count of the first row as expected
 */
export interface ErrorWrongColumnCount {
	type: "wrongColumnCount",
	information: "Expected column count to match with first line",
	count: number,
	expected: number
}

/**
 * Error Interface for not closed Markers.
 * Used when a Marker like " or ' gets opened in a row but not closed
 * Contains the string fragment beginning at the open tag till the end of the row
 */
export interface ErrorMarkerNotClosed {
	type: "markerNotClosed",
	information: "The selected marker was opened but not closed in line",
	fragment: string
}

/**
 * Error Data Type consisting of all errors
 */
export type ErrorData =
	ErrorWrongColumnCount |
	ErrorMarkerNotClosed;

/**
 * Core data about the error. In every case the user will be confronted
 * with the error code as well as the line of the error.
 * The column of the error can be added optionally.
 */
interface ValidationError {
	line: number;
	column?: number; // Really needed? Marker is always last col
	data: ErrorData;
}

/* ----- Functions ----- */

/**  
 * Splits a String into an array of strings by its linebreaks
 * The linebreaks have to be equal for the whole string 
 * (for example (only \n or only \r and not one line \n and the other \r))
 * Return an array with string values as rows
 * @param dataString the String to split
 */
export function splitStringToRows(dataString: string): string[] {
	let splitter = "";
	let rows = [];
	
	// identify line breaks
	if (dataString.includes("\r\n")) {
		// split by both
		splitter = "\r\n";
	}
	else if (dataString.includes("\n")) {
		// split only by carriage return
		splitter = "\n";
	}
	else if (dataString.includes("\r")) {
		// split only by line feed
		splitter = "\r";
	}
    
    // split only when splitter available
    if (splitter) {
        rows = dataString.split(splitter);
    }
    else {
        rows.push(dataString);
    }
    
    // get Columns for each row and save Data global
    return rows;        			
}

/**  
 * Splits a String as the Row with text Markers by the delimiter
 * (for example "Religion (ev, kath)" belongs together)
 * Returns an array for the row with String values as columns as RowData
 * or the corresponding ErrorData
 * @param row the row to split
 * @param delimiter the delimiter by which the row will be splittet (for example , or ;)
 * @param textMarker the textMarker to keep Strings together (for example " or ')
 * @param expectedColCount col Count of the Header which is expected to fit
 * 						   0 = this is the header	
 */
export function splitRowToCols(row: string, delimiter: string, textMarker: string, expectedColCount: number): RowData | ErrorData {
	let splitResult = [];
	let markerCount = 0;
	let colCount = 1;

	// Global regex for unescaped markers
	// uses negative lookbehind: e.g. (?<!Y)X matches X that is not preceded by a Y
	// 4 x backslash = 2 x for standard backslash escaping + 2 x for the RegExp Object
	let unescapedMarkerRegex = new RegExp("(?<!\\\\)" + textMarker, "g");
	let markerCollector = row.match(unescapedMarkerRegex);

	// If row contains textMarkers, count them
	if (markerCollector) {
		markerCount = markerCollector.length;
	}
		
	// Error if uneven unescaped number of text markers 
	if (markerCount % 2 === 1) {
		let fragments = row.split(textMarker);
		let fragment = fragments[fragments.length-1];
		return ({
			type: "markerNotClosed",
			information: "The selected marker was opened but not closed in line",
			fragment: fragment
		});
	}

	// Ignore delimiter inside unescaped text markers
	// use variables in /"[^"]+"|[^,]+/g;
	// TODO: Consider only unescaped
	let delOutsideMarkerRegex = new RegExp(textMarker + 
									"[^" + textMarker + "]+" 
										 + textMarker + 
								   "|[^" + delimiter + "]+" , "g");
	
	splitResult = row.match(delOutsideMarkerRegex);

	// splitResult = row.split(delimiter);

	// console.log(splitResult);

	// let newResult = [];

	if (splitResult) {

	// 	let newIndex = 0;
		
	// 	let colBundle = "";

	// 	while (newIndex < splitResult.length) {
	// 		if (splitResult[newIndex].match(unescapedMarkerRegex)) {
	// 			colBundle = splitResult[newIndex];
	// 			newIndex++;
	// 			while ((newIndex < splitResult.length) &&(!splitResult[newIndex].match(unescapedMarkerRegex))) {
	// 				colBundle += splitResult[newIndex];
	// 				newIndex++;
	// 			}
	// 			if (newIndex < splitResult.length) {
	// 				colBundle += splitResult[newIndex].substring(0, splitResult[newIndex].indexOf(unescapedMarkerRegex));
	// 				splitResult[newIndex] = splitResult[newIndex].substring(splitResult[newIndex].indexOf(unescapedMarkerRegex), splitResult[newIndex].length);
	// 			}
	// 			console.log("colBunde: " + colBundle);
	// 			newResult.push(colBundle);
	// 			colBundle = "";
	// 		}
	// 		else {
	// 			console.log("newPush: " + splitResult[newIndex]);
	// 			newResult.push(splitResult[newIndex]);
	// 			newIndex++;
	// 		}
			
	// 	}

		colCount = splitResult.length;
	}

	// Check if column count matches with header or if this is the header	
	if ((expectedColCount === colCount) || (expectedColCount === 0)) {
		// clean up the result
		splitResult = splitResult.map(col => {
			// Get rid of unescaped Marker
			col = col.replace(unescapedMarkerRegex, '');
			// Write out escaped Markers
			col = col.replace('\\' + textMarker, textMarker);
			return col;
		})
		return ({
			type: "row",
			data: splitResult
		});				
	}	
	else {
		return ({
			type: "wrongColumnCount",
			information: "Expected column count to match with first line",
			count: colCount,
			expected: expectedColCount
		});	
	}
}

/**  
 * If the parse process was successful:
 * Return the CsvParseResult with header and table that consists of Rows and Columns
 * If the parse process has at least one error:
 * Return the CsvParseError which contains every lines with error
 * Special Case: 
 * If error already in header only this error will be returned
 * @param csvString the whole string as CSV data
 * @param delimiter the delimiter by which each row will be splittet into cols (for example , or ;)
 * @param textMarker the textMarker to keep Strings together (for example " or ')
 */
export function convertCSVStringToArray(csvString: string, delimiter: string, textMarker: string) : CsvParseResult | CsvParseError {
	// The result if parse process is successful
	let headerData: string[] = [];
	let tableData: string[][] = [];
	// The error if at least one error occurs
	let errors: ValidationError[] = []; 

	// Split CSV Data Rows
	let plainRows = splitStringToRows(csvString);

	// Parse first row for header data
	let tryHeaderParsing = splitRowToCols(plainRows[0], delimiter, textMarker, 0);

	// Parse successful?
	if (tryHeaderParsing.type === "row") {
		headerData = tryHeaderParsing.data;
	}
	// In case of parse error return the error directly
	else if ((tryHeaderParsing.type === "wrongColumnCount") ||
			 (tryHeaderParsing.type === "markerNotClosed")) {
		return ({
			type: "parseError",
			errors: [{
				line: 1,				
				data: tryHeaderParsing
			}]
		});
	}
			
	// Iterate through every row starting from the second
	for(var i=1; i < plainRows.length; i++) {
		// Parse next row
		var currentRow = splitRowToCols(plainRows[i], delimiter, textMarker, headerData.length);

		// Push to result or errors
		if (currentRow.type === "row") {
			tableData.push(currentRow.data);
		}
		else if ((currentRow.type === "wrongColumnCount") ||
				 (currentRow.type === "markerNotClosed")) {					
			errors.push({
				line: i + 1, // The first line is the header				
				data: currentRow
			});			
		}
	}

	// Ignore error for the last row if empty
	if (plainRows[plainRows.length-1] === "") {
		errors.pop();	
	}

	// Return parse result or errors
	if (errors.length) {
		return ({
			type: "parseError",
			errors: errors
		});
	}
	else {
		return ({
			type: "parseResult",
			header: headerData,
			table: tableData
		}) ;
	}
}

/**
 * Converts the data of rows and cols into a JSON Object and returns it.
 * The header will be used as the key for each data and the other
 * rows as according values.
 * @param data the data as a two dymensional array of rows and cols
 * @param header the header row if available, otherwise an empty array
 * @param useHeader true, if the header data should be used,
 *                  false, if the first data row should be used as header
 */
export function convertArraysToJSON(data: string[][], header: string[], useHeader:boolean) {
    let resultObject = {};
    let currentDataObject = {};
	let arrayOfDataObjects = [];	
    let headerData = [];    
	let rowIndex = 0;
	let colIndex = 0;

	if (useHeader) {
		headerData = header;
	}
	else {
        // use first row as header
        headerData = data[0];
        // start reading data at second row
		rowIndex = 1;
	}
    
    // iterate through each row
	for(rowIndex; rowIndex < data.length; rowIndex++) {
        // new object for every row
        currentDataObject = {};
        // iterate through each col
		for(colIndex = 0; colIndex < data[rowIndex].length; colIndex++){
			currentDataObject[headerData[colIndex]] = data[rowIndex][colIndex];
		}
		arrayOfDataObjects.push(currentDataObject);
	}

    resultObject['rows'] = arrayOfDataObjects;
	return resultObject;
}