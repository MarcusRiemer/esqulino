import { RouterModule, Routes } from "@angular/router";
import { AssignmentOverviewComponent } from "./assignment/overview-assignment.component";
import { OverviewCourseConponent } from "./overview-course.component";

export const courseRoutes: Routes = [
  {
    path: "",
    pathMatch: "full",
    component: OverviewCourseConponent,
  },
  {
    path: "assignments",
    component: AssignmentOverviewComponent,
  },
  {
    path: "assignments/:id",
    component: AssignmentOverviewComponent,
  },
];

// export const courseRouting = RouterModule.forChild(courseRoutes);
