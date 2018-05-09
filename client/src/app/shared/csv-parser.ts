/**  
 * Splits a String as the Row with text Markers by the delimiter
 * (for example "Religion (ev, kath)" belongs together)
 * Returns an array for the row with String values as columns
 * 
 * @param row the row to split
 * @param delimiter the delimiter by which the row will be splittet (for example , or ;)
 * @param textMarker the textMarker to keep Strings together (for example " or ')
 */
export function splitRowToCols(row: string, delimiter: string, textMarker: string): string[] {
	let res = [];
	if (!row.includes(textMarker)) {
		// Split rows without text Marker directly
		res = row.split(delimiter);
	} 
	else {
		// Split by text Marker
		res = row.split(textMarker);
		// Split by seperator only without text Marker
		res = res.map(splitter => {
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
		// (apply concats empty array as "this" param
		// with all values in the array param)
		res = res.concat.apply([], res)
	}						
	return res;
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