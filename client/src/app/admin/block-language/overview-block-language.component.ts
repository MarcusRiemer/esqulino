import { Component, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import {
  AdminListBlockLanguagesGQL,
  AdminListBlockLanguagesQuery,
  AdminListBlockLanguagesQueryVariables,
  DestroyBlockLanguageGQL,
} from "../../../generated/graphql";
import { GraphQLQueryComponent } from "../../shared/table/paginator-table-graphql.component";

type DataKey = Exclude<keyof AdminListBlockLanguagesQuery, "__typename">;

// TODO: Resolve this from the Query type above, requires unpacking
//       a type argument to Observable
type ListItem = AdminListBlockLanguagesQuery[DataKey]["nodes"][0];

type ColumnName = keyof ListItem | "actions";

/**
 *
 */
@Component({
  templateUrl: "./templates/overview-block-language.html",
})
export class OverviewBlockLanguageComponent
  implements
    GraphQLQueryComponent<
      AdminListBlockLanguagesQuery,
      AdminListBlockLanguagesQueryVariables,
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
    readonly blockLanguagesGQL: AdminListBlockLanguagesGQL,
    private _destroyBlockLanguage: DestroyBlockLanguageGQL
  ) {}

  typed(doc: any): ListItem {
    return doc as ListItem;
  }

  readonly dataKey: DataKey = "blockLanguages";

  // mat-pagination info
  pageSize: number = 25;

  //Query Object which can be used to refetch data
  //fetchPolicy must be network-only, to get a clean pagination
  readonly query = this.blockLanguagesGQL.watch(
    { first: this.pageSize },
    { notifyOnNetworkStatusChange: true, fetchPolicy: "network-only" }
  );

  readonly displayedColumns: ColumnName[] = [
    "name",
    "slug",
    "grammarId",
    "generated",
    "id",
    "actions",
  ];
  async onDeleteBlockLanguage(id: string) {
    const res = await this._destroyBlockLanguage.mutate({ id: id }).toPromise();
    const errors = res.data.destroyBlockLanguage?.errors;
    if (errors.length > 0) {
      alert(errors);
    } else {
      this.query.refetch();
    }
  }

  onRefresh() {
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
