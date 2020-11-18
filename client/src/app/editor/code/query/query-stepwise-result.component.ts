import { Component, Input, SimpleChanges } from "@angular/core";

import {
  SqlStepDescription,
  SqlStepGroupByDescription,
} from "../../../shared/syntaxtree/sql/sql-steps";

import { QueryService, QueryResultRows } from "./query.service";
import { Tree } from "src/app/shared";

@Component({
  templateUrl: "templates/query-stepwise-result.html",
  selector: "query-stepwise-result",
})
export class QueryStepwiseResultComponent {
  constructor(private _queryService: QueryService) {}
  @Input()
  queryResult: QueryResultRows;

  @Input()
  step: SqlStepDescription;

  public groupByResult;

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes["queryResult"] && this.queryResult) {
      if (this.step.description.type == "groupBy") {
        // get rid of table name
        let expr = this.step.description.expressions.map(
          (e) => e.split(".")[1]
        );

        // get indices from columnname
        let indices = [];
        expr.forEach((element) => {
          indices.push(this.queryResult.columns.indexOf(element));
        });

        let corrOrderBy = <SqlStepGroupByDescription>this.step.description;

        this._queryService
          .runArbitraryQuery(
            new Tree(corrOrderBy.correspondingOrderBy).toModel(),
            {}
          )
          .subscribe((res) => {
            if (res instanceof QueryResultRows) {
              this.groupByResult = this.groupByIndices(res.rows, indices);
            }
          });
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
