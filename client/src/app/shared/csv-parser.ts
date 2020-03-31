import { RequestTabularInsertDescription } from "./schema/schema.description";

/* ----- Interfaces ----- */

/**
 * The Parse Result of the CSV File
 * First Line will always be handled as header
 */
export interface CsvParseResult {
  type: "parseResult";
  header: string[];
  table: string[][];
}

/**
 * The Parse Errors of the CSV File
 * Consist of only one String Array which contains all Error Messages
 */
export interface CsvParseError {
  type: "parseError";
  errors: ValidationError[];
}

/* --- Helper --- */

/**
 * A row consists of an array of columns as strings
 */
export interface RowData {
  type: "row";
  data?: string[];
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
  type: "wrongColumnCount";
  information?: string; // "Expected column count to match with first line"
  count?: number;
  expected?: number;
}

/**
 * Error Interface for not closed Markers.
 * Used when a Marker like " or ' gets opened in a row but not closed
 * Contains the string fragment beginning at the open tag till the end of the row
 */
export interface ErrorMarkerNotClosed {
  type: "markerNotClosed";
  information?: string; // "The selected marker was opened but not closed in line",
  fragment?: string;
}

/**
 * Error Data Type consisting of all errors
 */
export type ErrorData = ErrorWrongColumnCount | ErrorMarkerNotClosed;

/**
 * Core data about the error. In every case the user will be confronted
 * with the error code as well as the line of the error.
 */
export interface ValidationError {
  line: number;
  data: ErrorData;
}

/* ----- Functions ----- */

/* --- Helper Functions --- */

/*  The following 2 functions serve as workaround 
	for the lookbehind regex which is not yet supported by firefox */

/**
 * Returns all positions of unescaped delimiters or markers as array of numbers
 * @param row the row to search for unescaped delimiters or markers
 * @param delimiters array of delimiters or markers
 */
function lookbehindPositions(row: string, delimiters: string[]): number[] {
  let result = [];
  for (let i = 0; i < row.length; i++) {
    // unescaped char found
    if (delimiters.includes(row[i]) && row[i - 1] !== "\\") {
      // add index to result
      result.push(i);
    }
  }
  return result;
}

/**
 * Returns a modified string with escaped unescaped delimiters or markers
 * @param row the row to search for unescaped delimiters or markers
 * @param delimiters array of delimiters or markers
 * @pre only one option allowed
 */
function lookbehindModifications(row: string, delimiters: string[]): string {
  let result = "";
  for (let i = 0; i < row.length; i++) {
    // unescaped char found
    if (delimiters.includes(row[i]) && row[i - 1] !== "\\") {
      // escape the char for the new result string
      result += "\\" + row[i];
    } else {
      result += row[i];
    }
  }
  return result;
}

/**
 * Removes unescaped markers and writes out escaped markers and delimiters
 * Returns the final parse result column
 * @param col the column for the end result
 * @param delimiters array of all delimiter
 * @param textMarker the marker
 */
function getResultColumn(
  col: string,
  delimiters: string[],
  textMarker: string
): string {
  // Use Regex for global replaces
  let escapedMarkerRegex = new RegExp("\\\\" + textMarker, "g");
  // Write out escaped Markers
  col = col.replace(escapedMarkerRegex, textMarker);
  // Write out all escaped Delimiters
  delimiters.forEach((delimiter) => {
    // Global regex for the specific delimiter
    let escapedDelimiterRegex = new RegExp("\\\\" + delimiter, "g");
    col = col.replace(escapedDelimiterRegex, delimiter);
  });
  return col;
}

/**
 * Splits row into colums by all delimiters and returns columns as an array of strings
 * @param row the row to split
 * @param delimiters the delimiters for the splits
 */
function splitByDelimiters(row: string, delimiters: string[]): string[] {
  let splitResult = [];
  // get positions of all delimiters
  let splitPositions = lookbehindPositions(row, delimiters);

  // delimiters available?
  if (splitPositions.length) {
    // split from row begin to first delimiter
    splitResult.push(row.substring(0, splitPositions[0]));
    // delimiter splits
    for (let i = 0; i < splitPositions.length - 1; i++) {
      splitResult.push(
        row.substring(splitPositions[i] + 1, splitPositions[i + 1])
      );
    }
    // split from last delimiter to the end of the row
    splitResult.push(
      row.substring(splitPositions[splitPositions.length - 1] + 1, row.length)
    );
  } else {
    // No splits necessary > use complete row
    splitResult.push(row);
  }
  return splitResult;
}

/** Escapes all Delimiters between two unescaped Markers
 *  Returns a string with the escaped Delimiters
 * @param row the row with unescaped Delimiters between Markers
 * @param delimiter the delimiter to escape (for example , or ;)
 * @param textMarker the marker where the delimiters will be escaped (for example " or ')
 */
export function escapeDelimitersBetweenMarkers(
  row: string,
  delimiters: string[],
  textMarker: string
): string {
  let positions = lookbehindPositions(row, [textMarker]);

  // Markers left?
  if (positions.length) {
    // Hint: Markers are included in the positions
    let nextStartPos = positions[0];
    let nextEndPos = positions[1];
    let nextPart = "";

    // Marker at beginning?
    if (nextStartPos === 0) {
      // Substring from the first character after the first marker
      // to the char before the next Marker
      // (2nd param not included in substring function)
      nextPart = row.substring(nextStartPos + 1, nextEndPos);

      // escape delimiters inside nextPart
      nextPart = lookbehindModifications(nextPart, delimiters);

      // Skip the Marker for the next Step
      nextEndPos++;
    } else {
      // Unedited next Part
      nextPart = row.substring(0, nextStartPos);
      // Start next step with marker
      nextEndPos = nextStartPos;
    }
    // return the next Part + next Step
    return (
      nextPart +
      escapeDelimitersBetweenMarkers(
        row.substring(nextEndPos),
        delimiters,
        textMarker
      )
    );
  } else {
    // return the rest
    return row;
  }
}

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
  } else if (dataString.includes("\n")) {
    // split only by carriage return
    splitter = "\n";
  } else if (dataString.includes("\r")) {
    // split only by line feed
    splitter = "\r";
  }

  // split only when splitter available
  if (splitter) {
    rows = dataString.split(splitter);
  } else {
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
export function splitRowToCols(
  row: string,
  delimiters: string[],
  textMarker: string,
  expectedColCount: number
): RowData | ErrorData {
  let splitResult = [];
  let colCount = 1;

  // Count unescaped Markers
  let markerCount = lookbehindPositions(row, [textMarker]).length;

  // Error if uneven number of unescaped Markers (marker not closed)
  if (markerCount % 2 === 1) {
    let fragments = row.split(textMarker);
    let fragment = fragments[fragments.length - 1];
    return {
      type: "markerNotClosed",
      information: "The selected marker was opened but not closed",
      fragment: fragment,
    };
  }

  // Escape Delimiters inside unescaped Markers
  if (markerCount) {
    row = escapeDelimitersBetweenMarkers(row, delimiters, textMarker);
  }

  // Split row to columns by delimiters
  splitResult = splitByDelimiters(row, delimiters);
  colCount = splitResult.length;

  // Check if column count matches with header or if this is the header
  if (expectedColCount === colCount || expectedColCount === 0) {
    // clean up the result
    splitResult = splitResult.map((col) => {
      return getResultColumn(col, delimiters, textMarker);
    });
    return {
      type: "row",
      data: splitResult,
    };
  } else {
    return {
      type: "wrongColumnCount",
      information: "Expected column count to match with first line in file",
      count: colCount,
      expected: expectedColCount,
    };
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
export function convertCSVStringToArray(
  csvString: string,
  delimiters: string[],
  textMarker: string
): CsvParseResult | CsvParseError {
  // The result if parse process is successful
  let headerData: string[] = [];
  let tableData: string[][] = [];
  // The error if at least one error occurs
  let errors: ValidationError[] = [];

  // Split CSV Data Rows
  let plainRows = splitStringToRows(csvString);

  // Parse first row for header data
  let tryHeaderParsing = splitRowToCols(
    plainRows[0],
    delimiters,
    textMarker,
    0
  );

  // Parse successful?
  if (tryHeaderParsing.type === "row") {
    headerData = (<RowData>tryHeaderParsing).data;
  }
  // In case of parse error return the error directly
  else if (
    tryHeaderParsing.type === "wrongColumnCount" ||
    tryHeaderParsing.type === "markerNotClosed"
  ) {
    return {
      type: "parseError",
      errors: [
        {
          line: 1,
          data: tryHeaderParsing,
        },
      ],
    };
  }

  // Iterate through every row starting from the second
  for (var i = 1; i < plainRows.length; i++) {
    // Parse next row
    var currentRow = splitRowToCols(
      plainRows[i],
      delimiters,
      textMarker,
      headerData.length
    );

    // Push to result or errors
    if (currentRow.type === "row") {
      tableData.push((<RowData>currentRow).data);
    } else if (
      currentRow.type === "wrongColumnCount" ||
      currentRow.type === "markerNotClosed"
    ) {
      errors.push({
        line: i + 1, // The first line is the header
        data: currentRow,
      });
    }
  }

  // Ignore error for the last row if empty
  if (plainRows[plainRows.length - 1] === "") {
    errors.pop();
  }

  // Return parse result or errors
  if (errors.length) {
    return {
      type: "parseError",
      errors: errors,
    };
  } else {
    return {
      type: "parseResult",
      header: headerData,
      table: tableData,
    };
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
export function convertArraysToJSON(
  data: string[][],
  header: string[],
  useHeader: boolean
) {
  let resultObject = {};
  let currentDataObject = {};
  let arrayOfDataObjects = [];
  let headerData = [];
  let rowIndex = 0;
  let colIndex = 0;

  if (useHeader) {
    headerData = header;
  } else {
    // use first row as header
    headerData = data[0];
    // start reading data at second row
    rowIndex = 1;
  }

  // iterate through each row
  for (rowIndex; rowIndex < data.length; rowIndex++) {
    // new object for every row
    currentDataObject = {};
    // iterate through each col
    for (colIndex = 0; colIndex < data[rowIndex].length; colIndex++) {
      currentDataObject[headerData[colIndex]] = data[rowIndex][colIndex];
    }
    arrayOfDataObjects.push(currentDataObject);
  }

  resultObject["rows"] = arrayOfDataObjects;
  return resultObject;
}

/* ----- Component Helper Functions ----- */

/**
 * Counts the matching column names from a table and a headline
 * @param headline the parsed or self defined headline
 * @param colNames the names of the cols of a table
 */
export function countMatchingNames(
  headline: string[],
  colNames: string[]
): number {
  let counter = 0;

  // iterate through table columns
  for (let i = 0; i < colNames.length; i++) {
    // filter matching headline col names with table col
    let matchingNames = headline.filter((col) => col === colNames[i]);
    // at least one match found
    if (matchingNames.length) {
      counter++;
    }
  }

  return counter;
}

/**
 * Returns the name of the most suitable table for a given headline
 * which is the table with the most count of matching names
 * or the first table if no matching name
 * @param headline the parsed or self defined headline
 * @param tableNames all table names of the current schema
 * @param colNamesForTables all colNames for all tables
 */
export function getMostSuitableTableName(
  headline: string[],
  tableNames: string[],
  colNamesForTables: string[][]
): string {
  let result: string = tableNames[0];
  let maxMatches: number = 0;

  // check each table for more matches than current max
  for (let i = 0; i < tableNames.length; i++) {
    let matchCount = this.countMatchingNames(headline, colNamesForTables[i]);
    if (matchCount > maxMatches) {
      result = tableNames[i];
      maxMatches = matchCount;
    }
  }

  return result;
}

/**
 * Returns the best matching selected Header array
 * which contains the header index for each column of the table
 * when nothing is selected the index will be -1
 * chooses the first appearance for name duplicates
 * @param colNames the names of the cols of a table
 * @param headline the parsed headline cols to map
 */

export function getMatchingCols(
  colNames: string[],
  headline: string[]
): number[] {
  let result: number[] = [];

  for (let i = 0; i < colNames.length; i++) {
    // save index of the first occurance or -1 when no occurance
    result[i] = headline.indexOf(
      headline.filter((col) => col === colNames[i])[0]
    );
  }

  return result;
}

/**
 * Returns the mapping result as RequestTabularInsertDescription
 * @param colNames the names of the cols of a table
 * @param headerIndex the header index for each column of the table
 * @param table the table data from the csv file
 */
export function getMappingResult(
  colNames: string[],
  headerIndex: number[],
  table: string[][]
): RequestTabularInsertDescription {
  let result: RequestTabularInsertDescription = { columnNames: [], data: [[]] };
  let columnNames: string[] = [];
  let data: string[][] = [];
  let neededIndex: number[] = [];

  for (let i = 0; i < colNames.length; i++) {
    if (headerIndex[i] !== -1) {
      let columnName = colNames[i];
      columnNames.push(columnName);
      neededIndex.push(headerIndex[i]);
    }
  }

  if (columnNames.length) {
    for (let i = 0; i < table.length; i++) {
      let newRow: string[] = [];
      neededIndex.forEach((index) => newRow.push(table[i][index]));
      data.push(newRow);
    }
  }

  result.columnNames = columnNames;
  result.data = data;

  return result;
}
