import { RouterModule, Routes } from "@angular/router";
import { SettingsComponent } from "../project-settings/settings.component";
import { AssignmentComponent } from "./teacher/assignment/assignment.component";
import { CreateAssignmentComponent } from "./teacher/assignment/dialog/create-assignment.component";
import { AssignmentOverviewComponent } from "./teacher/assignment/overview-assignment.component";
import { OverviewCourseConponent } from "./overview-course.component";
import { OverviewParticipantComponent } from "./teacher/participants/overview-participant.component";
import { OverviewSingelCourseParticipantComponent } from "./participant/overview-single-course-participant.component";
import { AssignmentParticipantComponent } from "./participant/assignment/assignment-participant.component";
import { SubmittedCodeResourceEditorParticipantComponente } from "./participant/assignment/submitted-code-resource-editor-participant";
import { OverviewParticipantsPrticipantComponent } from "./participant/participants/overview-participants-participant.component";

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
    path: "participant/overview",
    component: OverviewSingelCourseParticipantComponent,
  },
  {
    path: "participant/assignment/:assignmentId",
    component: AssignmentParticipantComponent,
  },
  {
    path: "participant/assignment/:assignmentId/submitted/:resourceId",
    component: SubmittedCodeResourceEditorParticipantComponente,
  },
  {
    path: "participant/assignment/:assignmentId/submitted/:resourceId/template",
    component: SubmittedCodeResourceEditorParticipantComponente,
  },
  {
    path: "participant/participants",
    component: OverviewParticipantsPrticipantComponent,
  },

  {
    path: "participants",
    component: OverviewParticipantComponent,
  },
];

// export const courseRouting = RouterModule.forChild(courseRoutes);
