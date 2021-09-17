import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";

import { SharedAppModule } from "../../shared/shared.module";
import { CodeEditorModule } from "../code/code.module";
import { CourseNavComponent } from "./teacher/navigation/course-nav.component";
import { AssignmentOverviewComponent } from "./teacher/assignment/overview-assignment.component";
import { AssignmentComponent } from "./teacher/assignment/assignment.component";
import { OverviewCourseConponent } from "./overview-course.component";
import { CreateAssignmentComponent } from "./teacher/assignment/dialog/create-assignment.component";
import { CreateRequiredCodeResourceComponent } from "./teacher/assignment/dialog/create-required-code-resource.component";
import { CreateRequiredCodeResourceSolutionComponent } from "./teacher/assignment/dialog/create-required-code-resource-solution.component";
import { ChangeRequiredCodeResourceDialogComponent } from "./teacher/assignment/dialog/change-required-code-resource-dialog.component";
import { CourseIconComponent } from "./icons/course-icon.component";
import { UpdateAssignmentDialogComponent } from "./teacher/assignment/dialog/update-assignment-dialog.component";
import { OverviewParticipantComponent } from "./teacher/participants/overview-participant.component";
import { CreateParticipantGroup } from "./teacher/participants/create-participant-group.component";
import { CourseService } from "./course.service";
import { CourseParticipantNavComponent } from "./participant/navigation/course-participant-nav.component";
import { OverviewSingelCourseParticipantComponent } from "./participant/overview-single-course-participant.component";
import { SingleAssignmentCardComponent } from "./participant/templates/single-assignment-card.component";
import { AssignmentParticipantComponent } from "./participant/assignment/assignment-participant.component";
import { CreateAssignmentSubmittedCodeResourceDialogComponent } from "./participant/assignment/dialog/create-assignment-submitteed-code-resource-dialog.component";
import { SubmittedCodeResourceEditorParticipantComponente } from "./participant/assignment/submitted-code-resource-editor-participant";
import { RemainingDaysPipe } from "./participant/assignment/remaining-days.pipe";
import { OverviewParticipantsParticipantComponent } from "./participant/participants/overview-participants-participant.component";
import { ToGradeListComponent } from "./teacher/grade/to-grade-list.component";
import { OverviewGradeComponent } from "./teacher/grade/overview-grade.component";
import { ToGradeComponent } from "./teacher/grade/to-grade.component";
import { CreateGradeComponent } from "./teacher/grade/template/create-grade.component";
import { CreateGradeSettingComponent } from "./teacher/grade/template/create-grade-setting.component";
import { CreateParticipantGroupsComponent } from "./teacher/participants/create-participant-groups.component";
import { ParticipantMemberGroupDialogComponent } from "./teacher/participants/dialog/participant-member-group-dialog.component";

@NgModule({
  imports: [CommonModule, SharedAppModule, CodeEditorModule],
  declarations: [
    CourseNavComponent,
    AssignmentOverviewComponent,
    OverviewCourseConponent,
    AssignmentComponent,
    CreateAssignmentComponent,
    CreateRequiredCodeResourceComponent,
    CreateRequiredCodeResourceSolutionComponent,
    ChangeRequiredCodeResourceDialogComponent,
    CourseIconComponent,
    UpdateAssignmentDialogComponent,
    OverviewParticipantComponent,
    CreateParticipantGroup,
    CourseParticipantNavComponent,
    OverviewSingelCourseParticipantComponent,
    SingleAssignmentCardComponent,
    AssignmentParticipantComponent,
    CreateAssignmentSubmittedCodeResourceDialogComponent,
    SubmittedCodeResourceEditorParticipantComponente,
    RemainingDaysPipe,
    OverviewParticipantsParticipantComponent,
    ToGradeListComponent,
    OverviewGradeComponent,
    ToGradeComponent,
    CreateGradeComponent,
    CreateGradeSettingComponent,
    CreateParticipantGroupsComponent,
    ParticipantMemberGroupDialogComponent,
  ],
  exports: [CourseNavComponent, CourseParticipantNavComponent],
})
export class CourseModule {
  public static forRoot(): ModuleWithProviders<CourseModule> {
    return {
      ngModule: CourseModule,
      providers: [CourseService],
    };
  }
}
