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

  @Input()
  groupByStepResult: QueryResultRows;

  @Input()
  prevResult: QueryResultRows;

  public groupByRows;

  public filterRows;

  readonly maxfilterRows = 15;

  public showFilterResult = false;

  public indicesToMark: number[];

  readonly maxGroupEntriesToShow = 5;

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes["groupByStepResult"] &&
      this.step.description.type == "groupBy"
    ) {
      this.filterRows = undefined;
      // get rid of table name
      let expr = this.step.description.expressions.map((e) => e.split(".")[1]);

      // get indices from columnname !!!dangerous - columnname might be from an other table
      let indices = [];
      expr.forEach((element) => {
        indices.push(this.queryResult.columns.indexOf(element));
      });

      this.groupByRows = this.groupByIndices(
        this.groupByStepResult.rows,
        indices
      );
    } else if (
      changes["prevResult"] &&
      ["on", "using", "where"].includes(this.step.description.type) &&
      this.prevResult
    ) {
      // console.log("changes condition");
      this.filterRows = this.prevResult.rows.slice(0, this.maxfilterRows);
      if (this.filterRows.length < this.prevResult.rows.length) {
        this.filterRows.push(this.prevResult.rows[0].map((r) => "..."));
      }
      // console.log(this.filterRows);
      let desc = <SqlStepConditionFilterDescription>this.step.description;
      // the using join constraint requires special treatment
      // takes first matching column of the dataset on the left-hand side of the join-operator
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

  getIndicesToMark(namesToLocate: string[], columnsToLookAt: string[]) {
    console.log("namesToLocate: ", namesToLocate);
    console.log("columnsToLookAt: ", columnsToLookAt);
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

  groupByIndices(result: string[][], indices: number[]) {
    return [
      ...Object.values(
        result.reduce((acc, curr) => {
          const group = JSON.stringify(indices.map((x) => curr[x] || null));

          if (!acc[group]) {
            acc[group] = [];
          }
          if (acc[group].length < this.maxGroupEntriesToShow) {
            acc[group].push(curr);
          } else if (acc[group].length == this.maxGroupEntriesToShow) {
            acc[group].push(curr.map((c) => "..."));
          }

          return acc;
        }, {})
      ),
    ];
  }
}
