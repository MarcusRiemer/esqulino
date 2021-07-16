import { RouterModule, Routes } from "@angular/router";
import { AssignmentOverviewComponent } from "./assignment-overview.component";

export const courseRoutes: Routes = [
  {
    path: "",
    pathMatch: "full",
    component: AssignmentOverviewComponent,
  },
  {
    path: ":assignmentId",
    component: AssignmentOverviewComponent,
  },
];

// export const courseRouting = RouterModule.forChild(courseRoutes);
