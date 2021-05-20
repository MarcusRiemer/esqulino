import { Component, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";

import {
  AdminListGrammarsGQL,
  AdminListGrammarsQuery,
  AdminListGrammarsQueryVariables,
  DestroyGrammarGQL,
} from "../../../generated/graphql";
import { GraphQLQueryComponent } from "../../shared/table/paginator-table-graphql.component";
import { MatPaginator } from "@angular/material/paginator";
// TODO: Should be beautified and used
type Query = ReturnType<AdminListGrammarsGQL["watch"]>;

type DataKey = Exclude<keyof AdminListGrammarsQuery, "__typename">;

// TODO: Resolve this from the Query type above, requires unpacking
//       a type argument to Observable
type ListItem = AdminListGrammarsQuery[DataKey]["nodes"][0];

type ColumnName = keyof ListItem | "actions";

/**
 *
 */
@Component({
  templateUrl: "./templates/overview-grammar.html",
})
export class OverviewGrammarComponent
  implements
    GraphQLQueryComponent<
      AdminListGrammarsQuery,
      AdminListGrammarsQueryVariables,
      DataKey,
      ColumnName
    >
{
  // Angular Material UI to paginate
  @ViewChild(MatPaginator)
  _paginator: MatPaginator;

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  constructor(
    readonly grammarsGQL: AdminListGrammarsGQL,
    private _destroyGrammarGQL: DestroyGrammarGQL
  ) {}

  typed(doc: any): ListItem {
    return doc as ListItem;
  }

  readonly dataKey: DataKey = "grammars";

  // mat-pagination info
  pageSize: number = 25;

  //Query Object which can be used to refetch data
  //fetchPolicy must be network-only, to get a clean pagination
  readonly query = this.grammarsGQL.watch(
    { first: this.pageSize },
    { notifyOnNetworkStatusChange: true, fetchPolicy: "network-only" }
  );

  displayedColumns: ColumnName[] = ["name", "slug", "id", "actions"];

  async onDeleteGrammar(id: string) {
    await this._destroyGrammarGQL.mutate({ id: id }).toPromise();
    this.query.refetch();
  }

  get queryData() {
    return {
      query: this.query,
      dataKey: this.dataKey,
      displayColumns: this.displayedColumns,
      pageSize: this.pageSize,
      sort: this.sort,
    };
  }
}
