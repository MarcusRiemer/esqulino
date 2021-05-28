import { Component, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { first } from "rxjs/operators";
import {
  AdminListUsersGQL,
  AdminListUsersQuery,
  AdminListUsersQueryVariables,
  PromoteUserAdminGQL,
} from "../../../generated/graphql";
import { GraphQLQueryComponent } from "../../shared/table/paginator-table-graphql.component";

type DataKey = Exclude<keyof AdminListUsersQuery, "__typename">;
type ListItem = AdminListUsersQuery[DataKey]["nodes"][0];
type ColumnName = keyof ListItem | "actions";

@Component({
  selector: "app-overview-user",
  templateUrl: "./overview-user.component.html",
  styleUrls: ["./overview-user.component.scss"],
})
export class OverviewUserComponent
  implements
    GraphQLQueryComponent<
      AdminListUsersQuery,
      AdminListUsersQueryVariables,
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
    readonly usersGQL: AdminListUsersGQL,
    private readonly makeAdmin: PromoteUserAdminGQL
  ) {}

  readonly dataKey: DataKey = "users";

  pageSize: number = 25;

  readonly query = this.usersGQL.watch(
    { first: this.pageSize },
    { notifyOnNetworkStatusChange: true, fetchPolicy: "network-only" }
  );

  typed(doc: any): ListItem {
    return doc as ListItem;
  }

  displayedColumns: ColumnName[] = ["displayName", "id", "roles", "actions"];

  get queryData() {
    return {
      query: this.query,
      dataKey: this.dataKey,
      displayColumns: this.displayedColumns,
      pageSize: this.pageSize,
      sort: this.sort,
    };
  }

  async onPromoteToAdmin(userId: string) {
    const result = await this.makeAdmin
      .mutate({ userId })
      .pipe(first())
      .toPromise();
    console.log(result);
  }
}
