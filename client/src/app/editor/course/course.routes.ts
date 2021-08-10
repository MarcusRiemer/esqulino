import { RouterModule, Routes } from "@angular/router";
import { SettingsComponent } from "../project-settings/settings.component";
import { AssignmentComponent } from "./assignment/assignment.component";
import { CreateAssignmentComponent } from "./assignment/dialog/create-assignment.component";
import { AssignmentOverviewComponent } from "./assignment/overview-assignment.component";
import { OverviewCourseConponent } from "./overview-course.component";
import { OverviewParticipantComponent } from "./participants/overview-participant.component";

export const courseRoutes: Routes = [
  {
    path: "",
    pathMatch: "full",
    component: SettingsComponent,
  },
  {
    path: "create/assignment",
    component: CreateAssignmentComponent,
  },
  {
    path: "assignments/:assignmentId",
    component: AssignmentComponent,
  },
  {
    path: "assignments",
    component: AssignmentOverviewComponent,
  },
  {
    path: "participants",
    component: OverviewParticipantComponent,
  },
];

// export const courseRouting = RouterModule.forChild(courseRoutes);
