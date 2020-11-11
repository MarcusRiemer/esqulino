import { Component, Input } from "@angular/core";

import { SqlStepDescription } from "../../../shared/syntaxtree/sql/sql-steps";

import { QueryResult } from "./query.service";

@Component({
  templateUrl: "templates/query-stepwise-result.html",
  selector: "query-stepwise-result",
})
export class QueryStepwiseResultComponent {
  @Input()
  queryResult: QueryResult;

  @Input()
  step: SqlStepDescription;
}
