import { Component } from "@angular/core";
import { filter, map, pluck } from "rxjs/operators";
import {
  FrontpageListProjectsGQL,
  UserListCoursesGQL,
} from "../../generated/graphql";

@Component({
  templateUrl: "./list-courses-overview.component.html",
})
export class ListCorusesOverviewComponent {
  constructor(private _course: UserListCoursesGQL) {}

  //TODO: Markus - So okay ?
  readonly courses$ = this._course
    .fetch(
      {},
      { notifyOnNetworkStatusChange: true, fetchPolicy: "network-only" }
    )
    .pipe(pluck("data", "projects", "nodes"));
}
