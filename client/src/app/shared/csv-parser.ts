import { SplitInterpolation } from "@angular/compiler";

/*
	To Fix:

	  Bug: No Content before and after Marker

	  Escaping: (write \") out instead of using it as marker
	  e.g. 1, Montag, “Religion (\”ev\”, \”kath\”)”

	Error Handling:

	  error if col count does not match for every row

	  Start and don't end smth (like ")
	  e.g. 1, Montag, “Religion (end of Line without closing ")

	Use Interface:

	  Return Interface Error OR Interface RequestTabularInsertDescription
	  OR-type ( CsvResult \| CsvParseError)

	  Only useable in typscript
	  => use advanced types for js translation
	  https://www.typescriptlang.org/docs/handbook/advanced-types.html

	  Error Interface: Array of Strings with ErrorMessages
	  Data Interface: Two Dimensional Array of String with Rows and Cols
					  (Header independentent as first Line)

	Unclear:

	  To much whitespace between cols = error?
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

	// Count not escaped markers with global Regex
	// and negative lookbehind: e.g. (?<!Y)X matches X that is not preceded by a Y
	// use replace to use the variable in the regex
	// pass an increment function to the replace function to count the occurrence
	// TODO
	// first try: markerCount = (row.match(new RegExp('?<!/\\//textMarker/', 'g')) || []).length;
	
	// Error if uneven unescaped number of text markers 
	/* TODO after markerCount is set
	if (markerCount % 2 === 0) {
		let fragments = row.split(textMarker);
		let fragment = fragments[fragments.length-1];
		return ({
			type: "markerNotClosed",
			information: "The selected marker was opened but not closed in line",
			fragment: fragment
		});
	}
	*/

	if (!row.includes(textMarker)) {
		// Split rows without text Marker directly
		splitResult = row.split(delimiter);
	} 
	else {
		// Split by text Marker
		splitResult = row.split(textMarker);
		// Split by seperator only without text Marker
		splitResult = splitResult.map(splitter => {
			// Remove delimiter at the end and split
			if (splitter.endsWith(delimiter)) {
			 splitter = splitter.slice(0, -1).split(delimiter);
			}
			// Remove delimiter at the start and split
			else if (splitter.startsWith(delimiter)){
				splitter = splitter.replace(delimiter, "").split(delimiter);
			}
			// Otherwise don't split
			return splitter;
		});
		// Concat the subArrays back into one Array
		splitResult = [].concat(...splitResult);		
	}		
	
	// Check if column count matches with header or if this is the header	
	if ((expectedColCount === splitResult.length) || (expectedColCount === 0)) {
		return ({
			type: "row",
			data: splitResult
		});				
	}
	else {
		return ({
			type: "wrongColumnCount",
			information: "Expected column count to match with first line",
			count: splitResult.length,
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
	let tableData: string[][] = [[]];
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
	for(let i=1; i < plainRows.length; i++) {
		// Parse next row
		let currentRow = splitRowToCols(plainRows[i], delimiter, textMarker, headerData.length);

		// Push to result or errors
		if (currentRow.type === "row") {
			tableData[i-1] = currentRow.data;
		}
		else if ((currentRow.type === "wrongColumnCount") ||
				 (currentRow.type === "markerNotClosed")) {
			errors.push({ // TODO: Problem first line empty
				line: i,				
				data: currentRow
			});			
		}
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