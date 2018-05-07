/**  
 * Splits a String as the Row with text Markers by the delimiter
 * (for example "Religion (ev, kath)" belongs together)
 * Returns an array for the row with String values as columns
 * 
 * @param row The row to split
 * @param delimiter the delimiter by which the row will be splittet (for example , or ;)
 * @param textMarker the textMarker to keep Strings together (for example " or ')
 */
export function splitRow(row: string, delimiter: string, textMarker: string): string[] {
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