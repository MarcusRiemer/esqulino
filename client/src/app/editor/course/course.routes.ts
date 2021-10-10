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
import { OverviewParticipantsParticipantComponent } from "./participant/participants/overview-participants-participant.component";
import { OverviewGradeComponent } from "./teacher/grade/overview-grade.component";
import { ToGradeListComponent } from "./teacher/grade/to-grade-list.component";
import { ToGradeComponent } from "./teacher/grade/to-grade.component";
import { CreateRequiredCodeResourceComponent } from "./teacher/assignment/dialog/create-required-code-resource.component";
import { EditorCodeResourceTeacherComponent } from "./teacher/editor/editor-code-resource-teacher.component";
import { CreateParticipantGroup } from "./teacher/participants/create-participant-group.component";
import { CreateParticipantGroupsComponent } from "./teacher/participants/create-participant-groups.component";

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
    path: "assignments/:assignmentId",
    component: AssignmentComponent,
  },
  {
    path: "assignments/:assignmentId/editor/:requiredId/:codeResourceId",
    component: EditorCodeResourceTeacherComponent,
  },
  {
    path: "assignments/:assignmentId/create/file",
    component: CreateRequiredCodeResourceComponent,
  },
  {
    path: "assignments",
    component: AssignmentOverviewComponent,
  },
  {
    path: "grade/overview",
    component: OverviewGradeComponent,
  },

  {
    path: "grade/to-grade",
    component: ToGradeListComponent,
  },
  {
    path: "grade/to-grade/:submissionId",
    component: ToGradeComponent,
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
    component: OverviewParticipantsParticipantComponent,
  },

  {
    path: "participants",
    component: OverviewParticipantComponent,
  },
  {
    path: "participants/create/group",
    component: CreateParticipantGroup,
  },
  {
    path: "participants/create/groups",
    component: CreateParticipantGroupsComponent,
  },
];

// export const courseRouting = RouterModule.forChild(courseRoutes);
