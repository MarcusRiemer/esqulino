import { Component } from "@angular/core";
import { filter, map } from "rxjs/operators";
import { FrontpageListProjectsGQL } from "../../generated/graphql";

@Component({
  templateUrl: "./list-courses-overview.component.html",
})
export class ListCorusesOverviewComponent {
  constructor(private _projectsGQL: FrontpageListProjectsGQL) {}
}
