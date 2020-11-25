import { Component, Input, SimpleChanges } from "@angular/core";

import {
  SqlStepConditionFilterDescription,
  SqlStepDescription,
} from "../../../shared/syntaxtree/sql/sql-steps";

import { QueryResultRows } from "./query.service";

@Component({
  templateUrl: "templates/query-stepwise-result.html",
  selector: "query-stepwise-result",
})
export class QueryStepwiseResultComponent {
  constructor() {}
  @Input()
  queryResult: QueryResultRows;

  @Input()
  step: SqlStepDescription;

  /*@Input()
  groupByStepResult: QueryResultRows;*/

  @Input()
  prevResult: QueryResultRows;

  //grouped data sets of a group by step, taken from a order by
  public groupByRows;

  //a subset of all rows at a condition filter step
  public filterRows: string[][];

  public showFilterResult = false;

  //column indices that are marked in the preview table
  public indicesToMark: number[];

  //max value for the number of rows to be displayed for a condition filter
  private static readonly FILTER_ROWS_MAX = 15;

  //max value for the number of rows to be displayed for a each group
  private static readonly GROUP_ENTRIES_TO_SHOW_MAX = 15;

  /**
   * evaluates the current step type and creates the required data structure for the display
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges) {
    //perform a grouping of data sets for a group by
    if (changes["prevResult"]) {
      if (this.step.description.type == "groupBy") {
        this.filterRows = undefined;

        let indices = [];
        this.step.description.expressions.forEach((element) => {
          indices.push(this.queryResult.columns.indexOf(element));
        });

        this.groupByRows = this.groupByIndices(this.prevResult.rows, indices);

        // create the indices that should be marked for a on, using and where step
      } else if (
        ["on", "using", "where"].includes(this.step.description.type)
      ) {
        this.filterRows = this.prevResult.rows.slice(
          0,
          QueryStepwiseResultComponent.FILTER_ROWS_MAX
        );

        // append a '...'-row if further rows follow
        if (this.filterRows.length < this.prevResult.rows.length) {
          this.filterRows.push(this.prevResult.rows[0].map((r) => "..."));
        }

        let desc = <SqlStepConditionFilterDescription>this.step.description;
        // using constraint requires special treatment
        // if on the left-hand side of the join-operatorm more than one column
        // matches the using name, it takes first matching column
        if (this.step.description.type == "using") {
          this.indicesToMark = [];
          this.indicesToMark.push(
            this.prevResult.columns
              .map((c) => c.split(".")[1])
              .indexOf(desc.columnNames[0])
          );
          this.indicesToMark.push(
            this.prevResult.columns.indexOf(desc.columnNames[1])
          );
        } else {
          this.indicesToMark = this.getIndicesToMark(
            desc.columnNames,
            this.prevResult.columns
          );
        }
        this.showFilterResult = true;
      } else {
        this.groupByRows = undefined;
        this.filterRows = undefined;
      }
    }
  }

  /**
   * get unique indices for all appearances for given column names
   * @param namesToLocate
   * @param columnsToLookAt
   */
  private getIndicesToMark(namesToLocate: string[], columnsToLookAt: string[]) {
    return [
      ...new Set(
        namesToLocate
          .map((e) => {
            let pos = -1;
            let idx = [];
            while ((pos = columnsToLookAt.indexOf(e, pos + 1)) >= 0) {
              idx.push(pos);
            }
            return idx;
          })
          .flat()
      ),
    ];
  }

  /**
   * Performs a grouping of data sets for a group by
   * @param result
   * @param indices
   */
  private groupByIndices(resultRows: string[][], indices: number[]) {
    return [
      ...Object.values(
        resultRows.reduce((acc, curr) => {
          //according group by value for each element
          const group = JSON.stringify(indices.map((i) => curr[i] || null));

          if (!acc[group]) {
            acc[group] = [];
          }
          // add to the limit of the selected maximum
          if (
            acc[group].length <
            QueryStepwiseResultComponent.GROUP_ENTRIES_TO_SHOW_MAX
          ) {
            acc[group].push(curr);
          } else if (
            acc[group].length ==
            QueryStepwiseResultComponent.GROUP_ENTRIES_TO_SHOW_MAX
          ) {
            // append a '...'-row if further rows follow
            acc[group].push(curr.map((c) => "..."));
          }

          return acc;
        }, {})
      ),
    ];
  }
}
