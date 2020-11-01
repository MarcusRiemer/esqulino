import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "tableSortingPipe",
})

/**
 * Pipe for the testcase table for RegEx-Lang.
 * Sorts the table rows based on a supplied string in "sortDirection"#
 *
 * TODO hier lassen? verschieben? in code.module.ts regustrieren oder wo anders?
 */
export class TableSortPipe implements PipeTransform {
  transform(rows, sortDirection) {
    const sorted = rows.sort((a, b) => {
      if (sortDirection == "asc") {
        return b.result;
      } else if (sortDirection == "desc") {
        return a.result;
      } else {
        return 0;
      }
    });

    return sorted.slice(0);
  }
}
