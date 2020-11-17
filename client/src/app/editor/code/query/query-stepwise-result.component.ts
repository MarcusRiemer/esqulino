import { Component, Input, SimpleChanges } from "@angular/core";

import { SqlStepDescription } from "../../../shared/syntaxtree/sql/sql-steps";

import { QueryResult, QueryResultRows } from "./query.service";
import { EACCES } from "constants";

@Component({
  templateUrl: "templates/query-stepwise-result.html",
  selector: "query-stepwise-result",
})
export class QueryStepwiseResultComponent {
  @Input()
  queryResult: QueryResultRows;

  @Input()
  step: SqlStepDescription;

  public groupByResult;

  ngOnInit() {
    //console.log("result log on init !!!");
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["step"]) {
      //console.log("changes", changes);

      let result = this.queryResult;

      if (this.step.description.type == "groupBy") {
        // TODO work with related orderBy clause
          /*
        let orderByStep = <SqlStepGroupByDescription>this.step.description;
        let result = orderByStep.groupByEntriesDescription;
        let expressions = this.step.description.expressions;*/
        let expressions = this.step.description.expressions;

        // get rid of table name
        let expr = expressions.map((e) => e.split(".")[1]);

        // get indices from columnname
        let indices = [];
        expr.forEach((element) => {
          indices.push(result.columns.indexOf(element));
        });

        this.groupByResult = this.groupByIndices(result.rows, indices);
        /*console.log("expressions: ", expressions);
        console.log("expr: ", expr);
        console.log("columns: ", result.columns);
        console.log("indexes: ", indices);
        console.log(this.groupByResult); */
      } else if (this.groupByResult) {
        this.groupByResult = undefined;
      }
    }
  }

  groupByIndices(result: string[][], indices: number[]) {
    return [
      ...Object.values(
        result.reduce((acc, curr) => {
          const group = JSON.stringify(indices.map((x) => curr[x] || null));

          if (!acc[group]) {
            acc[group] = [];
          }
          acc[group].push(curr);
          return acc;
        }, {})
      ),
    ];
  }
}
